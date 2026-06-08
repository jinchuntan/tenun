import Groq from "groq-sdk";

/**
 * Shared LLM provider helper.
 *
 * OpenRouter is the PRIMARY provider; Groq is the fallback. All calls happen
 * server-side only — never import this from a client component, and never
 * expose the API keys to the browser.
 */

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RouteName =
  | "job-intent"
  | "job-detail"
  | "parse-resume"
  | "site-guide"
  | "generate-cv"
  | "cv-assistant"
  | "improve-cv-block"
  | "mock-interview"
  // Dashboard personalization (explanation/ranking/drafting only — never facts).
  | "personalize-dashboard-summary"
  | "personalize-pathway"
  | "personalize-skill-gaps"
  | "personalize-outreach";

export type GenerateJSONOptions = {
  routeName: RouteName;
  messages: LLMMessage[];
  temperature: number;
  maxTokens: number;
};

export type GenerateJSONResult = {
  raw: string;
  provider: "openrouter" | "groq";
  model: string;
};

// Default model used when no per-route OPENROUTER_MODEL_* override is set.
// gpt-4o-mini is reliable, cheap (~$0.000007/call), and — unlike OpenRouter's
// :free models — works with OPENROUTER_DATA_COLLECTION=deny (free models 404
// under "deny" because they require allowing prompt training). Override per
// route via env if you want a different/free model.
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_TIMEOUT_MS = 30_000;

// HTTP statuses that should trigger a fallback to Groq (transient / capacity).
const FALLBACK_STATUSES = new Set([402, 408, 409, 429, 500, 502, 503, 504]);

/** Error carrying the provider HTTP status + a safe (no-secret) summary. */
class ProviderError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

function openRouterEndpoint(): string {
  const base = (process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
  return `${base}/chat/completions`;
}

function getOpenRouterModel(routeName: RouteName): string {
  switch (routeName) {
    case "job-intent":
      return process.env.OPENROUTER_MODEL_JOB_INTENT ?? DEFAULT_OPENROUTER_MODEL;
    case "job-detail":
      return process.env.OPENROUTER_MODEL_JOB_DETAIL ?? DEFAULT_OPENROUTER_MODEL;
    case "site-guide":
      return process.env.OPENROUTER_MODEL_SITE_GUIDE ?? DEFAULT_OPENROUTER_MODEL;
    case "generate-cv":
      // Prefer the documented name; keep back-compat with the older variable.
      return (
        process.env.OPENROUTER_MODEL_CV_GENERATE ??
        process.env.OPENROUTER_MODEL_GENERATE_CV ??
        DEFAULT_OPENROUTER_MODEL
      );
    case "cv-assistant":
    case "improve-cv-block":
      return process.env.OPENROUTER_MODEL_CV_ASSISTANT ?? DEFAULT_OPENROUTER_MODEL;
    case "mock-interview":
      return process.env.OPENROUTER_MODEL_MOCK_INTERVIEW ?? DEFAULT_OPENROUTER_MODEL;
    case "personalize-dashboard-summary":
    case "personalize-pathway":
    case "personalize-skill-gaps":
    case "personalize-outreach":
      return process.env.OPENROUTER_MODEL_PERSONALIZE ?? DEFAULT_OPENROUTER_MODEL;
    case "parse-resume":
    default:
      return process.env.OPENROUTER_MODEL_RESUME_PARSE ?? DEFAULT_OPENROUTER_MODEL;
  }
}

function getGroqModel(): string {
  return process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
}

/** Turn an OpenRouter error body into a short, secret-free summary for logs. */
function summarizeErrorBody(text: string): string {
  if (!text) return "(empty body)";
  try {
    const parsed = JSON.parse(text);
    const msg = parsed?.error?.message ?? parsed?.error ?? parsed?.message ?? text;
    return String(msg).slice(0, 200);
  } catch {
    return text.slice(0, 200);
  }
}

/**
 * Validates that the model output can be turned into a JSON object. Handles
 * code-fence wrapping and truncated/garbage output by attempting a repair.
 */
export function isJsonParseable(text: string): boolean {
  if (!text || !text.trim()) return false;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    JSON.parse(cleaned);
    return true;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        JSON.parse(cleaned.slice(start, end + 1));
        return true;
      } catch { /* fall through */ }
    }
    return false;
  }
}

async function callOpenRouter(options: GenerateJSONOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new ProviderError("OPENROUTER_API_KEY is not set");

  const model = getOpenRouterModel(options.routeName);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const res = await fetch(openRouterEndpoint(), {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Correct OpenRouter attribution headers.
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME ?? "Tenun",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        // Ask for JSON. We deliberately DO NOT set provider.require_parameters,
        // because that makes OpenRouter reject every provider that doesn't
        // support structured outputs (true for most free models) — which made
        // OpenRouter fail on every request. Without it, OpenRouter routes
        // freely and ignores unsupported params; our JSON repair handles the
        // rare case where a provider returns lightly-wrapped JSON.
        response_format: { type: "json_object" },
        provider: {
          data_collection:
            process.env.OPENROUTER_DATA_COLLECTION === "allow" ? "allow" : "deny",
        },
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new ProviderError(
        `OpenRouter ${res.status}: ${summarizeErrorBody(bodyText)}`,
        res.status
      );
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    if (!isJsonParseable(raw)) {
      throw new ProviderError("OpenRouter returned empty or non-JSON content");
    }
    return raw;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(options: GenerateJSONOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new ProviderError("GROQ_API_KEY is not set");

  const model = getGroqModel();
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model,
    messages: options.messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "";
  if (!isJsonParseable(raw)) {
    throw new ProviderError("Groq returned empty or non-JSON content");
  }
  return raw;
}

/**
 * Generate a JSON response, preferring OpenRouter and falling back to Groq.
 *
 * - Tries OpenRouter first when OPENROUTER_API_KEY is set.
 * - Falls back to Groq on any OpenRouter error (HTTP error, timeout, invalid
 *   JSON) or when OPENROUTER_API_KEY is missing.
 * - Throws only when both providers fail (or neither key is configured). The
 *   thrown message carries a safe summary of the last provider error.
 */
export async function generateJSONWithFallback(
  options: GenerateJSONOptions
): Promise<GenerateJSONResult> {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (!hasOpenRouter && !hasGroq) {
    throw new Error("No AI provider configured (set OPENROUTER_API_KEY or GROQ_API_KEY).");
  }

  let lastError = "";

  // 1. Try OpenRouter first (primary).
  if (hasOpenRouter) {
    try {
      const model = getOpenRouterModel(options.routeName);
      const raw = await callOpenRouter(options);
      console.log(`[llm] ${options.routeName}: OpenRouter ok (model=${model})`);
      return { raw, provider: "openrouter", model };
    } catch (err) {
      const status = err instanceof ProviderError ? err.status : undefined;
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(
        `[llm] ${options.routeName}: OpenRouter failed${status ? ` [${status}]` : ""} — ${lastError}. ${hasGroq ? "Falling back to Groq." : "No fallback configured."}`
      );
    }
  }

  // 2. Fall back to Groq.
  if (hasGroq) {
    try {
      const model = getGroqModel();
      const raw = await callGroq(options);
      console.log(`[llm] ${options.routeName}: Groq fallback ok (model=${model})`);
      return { raw, provider: "groq", model };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[llm] ${options.routeName}: Groq fallback failed — ${lastError}`);
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError || "unknown"}`);
}

// ── Diagnostics (used by /api/ai-health — safe, no secrets) ─────────────────

export function getAIConfig() {
  return {
    openrouterConfigured: !!process.env.OPENROUTER_API_KEY,
    groqConfigured: !!process.env.GROQ_API_KEY,
    openrouterModelDefaults: {
      jobIntent: getOpenRouterModel("job-intent"),
      jobDetail: getOpenRouterModel("job-detail"),
      resumeParse: getOpenRouterModel("parse-resume"),
      siteGuide: getOpenRouterModel("site-guide"),
      cvGenerate: getOpenRouterModel("generate-cv"),
      cvAssistant: getOpenRouterModel("cv-assistant"),
      mockInterview: getOpenRouterModel("mock-interview"),
    },
    groqModel: getGroqModel(),
    dataCollection: process.env.OPENROUTER_DATA_COLLECTION === "allow" ? "allow" : "deny",
  };
}

export type ProviderPing = {
  ok: boolean;
  provider: "openrouter" | "groq";
  model: string;
  status?: number;
  error?: string;
};

const PING_OPTIONS: GenerateJSONOptions = {
  routeName: "job-intent",
  messages: [{ role: "user", content: 'Return JSON only: { "ok": true }' }],
  temperature: 0,
  maxTokens: 50,
};

/** Tiny, isolated OpenRouter call to confirm it works (used by ?test=true). */
export async function pingOpenRouter(): Promise<ProviderPing> {
  const model = getOpenRouterModel("job-intent");
  try {
    const raw = await callOpenRouter(PING_OPTIONS);
    return { ok: isJsonParseable(raw), provider: "openrouter", model };
  } catch (err) {
    return {
      ok: false,
      provider: "openrouter",
      model,
      status: err instanceof ProviderError ? err.status : undefined,
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown error",
    };
  }
}

/** Tiny, isolated Groq call to confirm the fallback works. */
export async function pingGroq(): Promise<ProviderPing> {
  const model = getGroqModel();
  try {
    const raw = await callGroq(PING_OPTIONS);
    return { ok: isJsonParseable(raw), provider: "groq", model };
  } catch (err) {
    return {
      ok: false,
      provider: "groq",
      model,
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown error",
    };
  }
}
