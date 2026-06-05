import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import {
  GUIDE_ACTIONS,
  getSupportEmail,
  knowledgeAsPromptText,
} from "@/lib/site-guide-knowledge";

/**
 * Tenun Guide chatbot endpoint.
 *
 * Answers strictly from the controlled SITE_GUIDE_KNOWLEDGE base plus the
 * current page context. Returns structured JSON. Never exposes API keys to the
 * browser — all LLM calls go through the shared server-side helper.
 */

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;

type HistoryItem = { role: "user" | "assistant"; content: string };

type RequestBody = {
  message?: string;
  history?: HistoryItem[];
  locale?: "en" | "ms";
  pageContext?: {
    pathname?: string;
    pageTitle?: string;
    sectionId?: string;
  };
};

type GuideResponse = {
  answer: string;
  confidence: "high" | "medium" | "low";
  suggestedActions: { label: string; href: string }[];
  shouldEscalate: boolean;
  escalationMessage?: string;
};

// Allow-list of hrefs the model is permitted to surface as suggested actions.
// Anything outside this set is dropped so the guide can never link to an
// invented or broken page.
const ALLOWED_HREFS = new Set<string>(Object.values(GUIDE_ACTIONS).map((a) => a.href));

function buildSystemPrompt(locale: "en" | "ms"): string {
  const supportEmail = getSupportEmail();
  const languageRule =
    locale === "ms"
      ? `\nLANGUAGE: Reply ONLY in natural, friendly Malaysian Malay (Bahasa Melayu) — not Indonesian, not formal government style. Also translate the "label" of each suggested action into Malay, but keep the "href" values EXACTLY as given. Keep "Tenun" and "Weaver" as-is.`
      : `\nLANGUAGE: Reply in clear, friendly English.`;
  return `You are the Tenun mascot guide — a friendly, cute, encouraging, slightly playful helper that guides users around the Tenun website. You speak naturally (not robotic), keep replies short and practical, and never overpromise.
${languageRule}

You help users navigate and understand the Tenun website.

You may ONLY answer using:
1. The provided Tenun website knowledge base (below).
2. The current page context (provided with each message).
3. The visible conversation context.

If the user asks something outside this knowledge, do NOT guess. Say you are not fully sure and suggest contacting the Tenun team at ${supportEmail}.

RULES:
- Keep answers short, usually 2 to 5 sentences.
- Be warm, practical, and natural. A little playful is good.
- Do not invent pages, features, partnerships, pricing, or policies.
- Do not guarantee career outcomes or hiring outcomes.
- Do not give legal, financial, medical, or immigration advice.
- Do not ask for sensitive personal information.
- Do not store or request full CV content in the chat.
- Do not mention internal implementation details.
- If the user seems lost, suggest one clear next action.
- Always include useful suggestedActions when possible, but ONLY from the approved list below — never invent an href.
- If your answer confidence is low, set "shouldEscalate" to true and provide an "escalationMessage" that points the user to the Tenun team at ${supportEmail}.

APPROVED SUGGESTED ACTIONS (use these exact hrefs only):
${Object.values(GUIDE_ACTIONS)
  .map((a) => `- "${a.label}" -> ${a.href}`)
  .join("\n")}

${knowledgeAsPromptText()}

OUTPUT FORMAT — return ONLY a valid JSON object, no markdown, no code fences, with EXACTLY this shape:
{
  "answer": "your short, friendly reply",
  "confidence": "high" | "medium" | "low",
  "suggestedActions": [{ "label": "string", "href": "string" }],
  "shouldEscalate": boolean,
  "escalationMessage": "optional string shown when shouldEscalate is true"
}`;
}

function sanitizeHistory(history: unknown): HistoryItem[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (h): h is HistoryItem =>
        !!h &&
        typeof h === "object" &&
        (h as HistoryItem).role !== undefined &&
        ((h as HistoryItem).role === "user" || (h as HistoryItem).role === "assistant") &&
        typeof (h as HistoryItem).content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((h) => ({
      role: h.role,
      content: h.content.slice(0, MAX_MESSAGE_LENGTH),
    }));
}

function buildContextLine(pageContext: RequestBody["pageContext"]): string {
  if (!pageContext) return "Current page: unknown.";
  const parts = [`pathname=${pageContext.pathname ?? "unknown"}`];
  if (pageContext.pageTitle) parts.push(`title=${pageContext.pageTitle}`);
  if (pageContext.sectionId) parts.push(`section=${pageContext.sectionId}`);
  return `Current page context: ${parts.join(", ")}`;
}

function safeParse(text: string): GuideResponse | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let parsed = tryParse(cleaned);
  if (!parsed) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      parsed = tryParse(cleaned.slice(start, end + 1));
    }
  }
  if (!parsed || typeof parsed !== "object") return null;

  const p = parsed as Record<string, unknown>;
  const answer = typeof p.answer === "string" ? p.answer.trim() : "";
  if (!answer) return null;

  const confidence =
    p.confidence === "high" || p.confidence === "medium" || p.confidence === "low"
      ? p.confidence
      : "medium";

  // Only keep actions whose href is on the approved allow-list.
  const suggestedActions = Array.isArray(p.suggestedActions)
    ? (p.suggestedActions as unknown[])
        .filter(
          (a): a is { label: string; href: string } =>
            !!a &&
            typeof a === "object" &&
            typeof (a as { label?: unknown }).label === "string" &&
            typeof (a as { href?: unknown }).href === "string" &&
            ALLOWED_HREFS.has((a as { href: string }).href)
        )
        .slice(0, 4)
    : [];

  const shouldEscalate = p.shouldEscalate === true || confidence === "low";
  const escalationMessage =
    typeof p.escalationMessage === "string" ? p.escalationMessage : undefined;

  return { answer, confidence, suggestedActions, shouldEscalate, escalationMessage };
}

function escalationFallback(locale: "en" | "ms"): GuideResponse {
  const supportEmail = getSupportEmail();
  if (locale === "ms") {
    return {
      answer: `Saya belum pasti tentang itu. Cara paling selamat ialah hubungi pasukan Tenun di ${supportEmail}, dan mereka boleh bantu anda terus.`,
      confidence: "low",
      suggestedActions: [],
      shouldEscalate: true,
      escalationMessage: `Hubungi pasukan Tenun di ${supportEmail}.`,
    };
  }
  return {
    answer: `I'm not fully sure about that yet. The safest next step is to contact the Tenun team at ${supportEmail}, and they can help you directly.`,
    confidence: "low",
    suggestedActions: [],
    shouldEscalate: true,
    escalationMessage: `Contact the Tenun team at ${supportEmail}.`,
  };
}

export async function POST(request: Request) {
  // Public endpoint — rate limit by IP so unauthenticated users can ask freely.
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("site-guide", ip);
  if (rateLimited.limited) return rateLimited.response;

  let locale: "en" | "ms" = "en";
  try {
    const body = (await request.json()) as RequestBody;
    locale = body.locale === "ms" ? "ms" : "en";

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Missing message." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      // No provider — degrade gracefully to an escalation rather than 500ing.
      return NextResponse.json(escalationFallback(locale));
    }

    const history = sanitizeHistory(body.history);
    const contextLine = buildContextLine(body.pageContext);

    const { raw } = await generateJSONWithFallback({
      routeName: "site-guide",
      messages: [
        { role: "system", content: buildSystemPrompt(locale) },
        ...history,
        { role: "user", content: `${contextLine}\n\nUser message: ${message}` },
      ],
      temperature: 0.2,
      maxTokens: 700,
    });

    const result = safeParse(raw) ?? escalationFallback(locale);
    return NextResponse.json(result);
  } catch (err) {
    console.error("site-guide error:", err);
    // Never leak internals — return a friendly escalation instead.
    return NextResponse.json(escalationFallback(locale));
  }
}
