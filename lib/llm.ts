import Groq from "groq-sdk";

/**
 * Shared LLM provider helper.
 *
 * OpenRouter is the primary provider; Groq is the fallback. All calls happen
 * server-side only — never import this from a client component, and never expose
 * the API keys to the browser.
 */

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type RouteName = "job-intent" | "job-detail" | "parse-resume";

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

const DEFAULT_OPENROUTER_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_TIMEOUT_MS = 30_000;

// HTTP statuses that should trigger a fallback to Groq.
const FALLBACK_STATUSES = new Set([429, 402, 500, 502, 503, 504]);

function getOpenRouterModel(routeName: RouteName): string {
  if (routeName === "job-intent") {
    return process.env.OPENROUTER_MODEL_JOB_INTENT ?? DEFAULT_OPENROUTER_MODEL;
  }
  if (routeName === "job-detail") {
    return process.env.OPENROUTER_MODEL_JOB_DETAIL ?? DEFAULT_OPENROUTER_MODEL;
  }
  return process.env.OPENROUTER_MODEL_RESUME_PARSE ?? DEFAULT_OPENROUTER_MODEL;
}

function getGroqModel(): string {
  return process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
}

/**
 * Validates that the model output can be turned into a JSON object. Handles
 * code-fence wrapping and truncated/garbage output by attempting a repair.
 * Returns true when the content is usable JSON, false otherwise.
 */
export function isJsonParseable(text: string): boolean {
  if (!text || !text.trim()) return false;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    JSON.parse(cleaned);
    return true;
  } catch {
    // Try to recover an object/array substring.
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
  const model = getOpenRouterModel(options.routeName);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": process.env.OPENROUTER_APP_NAME ?? "Tenun",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        response_format: { type: "json_object" },
        provider: {
          require_parameters: true,
          data_collection:
            process.env.OPENROUTER_DATA_COLLECTION === "allow" ? "allow" : "deny",
        },
      }),
    });

    if (!res.ok) {
      if (FALLBACK_STATUSES.has(res.status)) {
        throw new Error(`OpenRouter returned status ${res.status}`);
      }
      throw new Error(`OpenRouter returned non-OK status ${res.status}`);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    if (!isJsonParseable(raw)) {
      throw new Error("OpenRouter returned empty or non-JSON content");
    }
    return raw;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(options: GenerateJSONOptions): Promise<string> {
  const model = getGroqModel();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model,
    messages: options.messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "";
  if (!isJsonParseable(raw)) {
    throw new Error("Groq returned empty or non-JSON content");
  }
  return raw;
}

/**
 * Generate a JSON response, preferring OpenRouter and falling back to Groq.
 *
 * - Tries OpenRouter first when OPENROUTER_API_KEY is set.
 * - Falls back to Groq on any OpenRouter error (HTTP error, timeout, invalid
 *   JSON) or when OPENROUTER_API_KEY is missing.
 * - Throws only when both providers fail (or neither key is configured).
 */
export async function generateJSONWithFallback(
  options: GenerateJSONOptions
): Promise<GenerateJSONResult> {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (!hasOpenRouter && !hasGroq) {
    throw new Error("No LLM provider configured.");
  }

  // 1. Try OpenRouter first.
  if (hasOpenRouter) {
    try {
      const raw = await callOpenRouter(options);
      return { raw, provider: "openrouter", model: getOpenRouterModel(options.routeName) };
    } catch (err) {
      console.warn(
        `[llm] OpenRouter failed for ${options.routeName}, falling back to Groq:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  // 2. Fall back to Groq.
  if (hasGroq) {
    try {
      const raw = await callGroq(options);
      return { raw, provider: "groq", model: getGroqModel() };
    } catch (err) {
      console.error(
        `[llm] Groq fallback failed for ${options.routeName}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw new Error("All LLM providers failed.");
}
