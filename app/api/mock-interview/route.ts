import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";

/**
 * AI Mock Interview API.
 *
 * A dedicated interview-practice endpoint — NOT the chatbot / site guide. It
 * runs entirely server-side through the shared OpenRouter→Groq helper so no API
 * key is ever exposed to the browser. Every mode returns strict JSON.
 */

type Mode = "start" | "evaluate_answer" | "next_question" | "final_report";
type InterviewType = "general" | "behavioural" | "technical" | "cv_based";
type Difficulty = "easy" | "medium" | "challenging";
type Locale = "en" | "ms";

interface Feedback {
  score?: number;
  summary?: string;
  whatWentWell?: string[];
  toImprove?: string[];
  sampleAnswer?: string;
}

interface HistoryItem {
  question: string;
  answer?: string;
  feedback?: Feedback;
}

interface RequestBody {
  mode: Mode;
  targetRole?: string;
  interviewType?: InterviewType;
  difficulty?: Difficulty;
  cvContext?: string;
  history?: HistoryItem[];
  currentQuestion?: string;
  answer?: string;
  locale?: Locale;
}

// Keep the session short to control AI cost (spec: ~5 questions).
const MAX_QUESTIONS = 5;

const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  general: "General (a mix of common interview questions)",
  behavioural: "Behavioural (past situations, teamwork, conflict, leadership — STAR method)",
  technical: "Technical (role-specific knowledge and problem solving)",
  cv_based: "CV-based (questions grounded in the candidate's pasted CV context)",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy — warm, supportive, foundational questions",
  medium: "Medium — realistic questions for a typical interview",
  challenging: "Challenging — probing follow-ups and higher expectations",
};

function localeRule(locale: Locale): string {
  return locale === "ms"
    ? 'Write ALL user-facing text (questions, summary, whatWentWell, toImprove, sampleAnswer, and the final report text) in natural Malaysian Malay (Bahasa Melayu). Keep every JSON key in English. Keep widely-used technical terms and proper nouns as-is.'
    : "Write all user-facing text in clear, simple, professional English.";
}

const INTERVIEWER_RULES = `You are "Tenun Interview Coach", a friendly but rigorous AI interviewer that helps a candidate practise for a real job interview. This is an interview-practice tool, not a chatbot.

Rules:
- Ask ONE interview question at a time. Never ask multiple questions in a single turn.
- Tailor every question to the target role, interview type, and difficulty.
- Evaluate answers on five dimensions: relevance, structure, specificity, impact, and communication.
- For behavioural questions, encourage the STAR method (Situation, Task, Action, Result).
- Keep feedback practical, specific, and encouraging. Never be harsh, sarcastic, or dismissive.
- NEVER invent achievements, employers, metrics, dates, or experience the candidate did not state. A "sampleAnswer" is an illustrative model answer the candidate can learn from — make it clearly a template, never attributed facts about this candidate.
- If an answer is empty, off-topic, or far too vague to assess, give a low score (0-3), say so kindly in the summary, and tell the candidate to add a concrete example with more detail in "toImprove".`;

function buildSystemPrompt(locale: Locale): string {
  return `${INTERVIEWER_RULES}\n\n${localeRule(locale)}\n\nReturn ONLY valid JSON. No markdown, no code fences, no commentary.`;
}

function contextBlock(body: RequestBody): string {
  const role = body.targetRole?.trim() || "(general role — candidate did not specify)";
  const type = body.interviewType ? INTERVIEW_TYPE_LABELS[body.interviewType] : INTERVIEW_TYPE_LABELS.general;
  const diff = body.difficulty ? DIFFICULTY_LABELS[body.difficulty] : DIFFICULTY_LABELS.medium;
  const cv = body.cvContext?.trim()
    ? `CV context provided by the candidate (use it to make questions relevant; do not treat unstated things as fact):\n"""\n${body.cvContext.slice(0, 3000)}\n"""`
    : "CV context: (none provided)";
  return [
    `Target role: ${role}`,
    `Interview type: ${type}`,
    `Difficulty: ${diff}`,
    cv,
  ].join("\n");
}

function askedQuestions(history: HistoryItem[]): string {
  if (!history.length) return "Previously asked questions: (none yet)";
  return `Previously asked questions (do NOT repeat these):\n${history
    .map((h, i) => `${i + 1}. ${h.question}`)
    .join("\n")}`;
}

function transcript(history: HistoryItem[]): string {
  if (!history.length) return "Transcript: (no answers were recorded)";
  return `Full interview transcript:\n${history
    .map((h, i) => {
      const score = typeof h.feedback?.score === "number" ? ` [score ${h.feedback.score}/10]` : "";
      return `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer?.trim() || "(no answer given)"}${score}`;
    })
    .join("\n\n")}`;
}

function buildUserPrompt(body: RequestBody): string {
  const history = body.history ?? [];
  const ctx = contextBlock(body);

  switch (body.mode) {
    case "start":
      return `Mode: start\n${ctx}\n\nTask: Plan a short practice interview of about ${MAX_QUESTIONS} questions and produce ONLY the FIRST question. The plan should move from an introductory question through role-relevant and problem-solving questions to a closing motivation question.\n\nReturn ONLY this exact JSON shape:\n{\n  "question": "<the first interview question — one question only>",\n  "sessionPlan": ["<short label of planned question 1>", "<label 2>", "<label 3>", "<label 4>", "<label 5>"],\n  "feedback": null,\n  "nextQuestion": null,\n  "finalReport": null\n}`;

    case "evaluate_answer": {
      const answeredSoFar = history.length; // history does not yet include the current Q/A
      const isLast = answeredSoFar + 1 >= MAX_QUESTIONS;
      return `Mode: evaluate_answer\n${ctx}\n\nQuestion that was asked:\n"${body.currentQuestion ?? ""}"\n\nCandidate's answer:\n"""\n${(body.answer ?? "").slice(0, 4000)}\n"""\n\nThis is answer ${answeredSoFar + 1} of ${MAX_QUESTIONS}.\n${askedQuestions(history)}\n\nTask: Evaluate the answer across relevance, structure, specificity, impact, and communication. ${
        isLast
          ? "This was the LAST planned question, so set \"nextQuestion\" to null."
          : "Then provide ONE fresh next question (not previously asked)."
      }\n\nReturn ONLY this exact JSON shape:\n{\n  "question": null,\n  "feedback": {\n    "score": <integer 0-10>,\n    "summary": "<2-3 sentence overall summary>",\n    "whatWentWell": ["<point>", "<point>"],\n    "toImprove": ["<point>", "<point>"],\n    "sampleAnswer": "<a stronger model answer the candidate can learn from>"\n  },\n  "nextQuestion": ${isLast ? "null" : '"<the next interview question, or null>"'},\n  "finalReport": null\n}`;
    }

    case "next_question":
      return `Mode: next_question\n${ctx}\n\n${askedQuestions(history)}\n\nTask: Produce ONE fresh interview question that has not been asked yet.\n\nReturn ONLY this exact JSON shape:\n{\n  "question": "<one interview question>",\n  "sessionPlan": null,\n  "feedback": null,\n  "nextQuestion": null,\n  "finalReport": null\n}`;

    case "final_report":
      return `Mode: final_report\n${ctx}\n\n${transcript(history)}\n\nTask: Summarise the candidate's overall interview performance. Base it ONLY on what they actually said. Be encouraging and concrete.\n\nReturn ONLY this exact JSON shape:\n{\n  "finalReport": {\n    "overallScore": <integer 0-10>,\n    "strengths": ["<strength>", "<strength>"],\n    "improvementAreas": ["<area>", "<area>"],\n    "recommendedPractice": ["<actionable practice tip>", "<tip>", "<tip>"]\n  }\n}`;

    default:
      return "";
  }
}

// ── Parsing & normalisation ────────────────────────────────────────────────

function parseJSON(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("non-JSON model output");
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  }
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function asStringArray(v: unknown, max = 6): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

function asScore(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(10, Math.round(n)));
}

function normalizeFeedback(v: unknown): Feedback | null {
  if (!v || typeof v !== "object") return null;
  const f = v as Record<string, unknown>;
  return {
    score: asScore(f.score) ?? 0,
    summary: asString(f.summary) ?? "",
    whatWentWell: asStringArray(f.whatWentWell),
    toImprove: asStringArray(f.toImprove),
    sampleAnswer: asString(f.sampleAnswer) ?? "",
  };
}

function normalizeFinalReport(v: unknown) {
  if (!v || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  return {
    overallScore: asScore(r.overallScore) ?? 0,
    strengths: asStringArray(r.strengths),
    improvementAreas: asStringArray(r.improvementAreas),
    recommendedPractice: asStringArray(r.recommendedPractice),
  };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("mock-interview", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  const VALID_MODES: Mode[] = ["start", "evaluate_answer", "next_question", "final_report"];

  try {
    const body = (await request.json()) as RequestBody;

    if (!body.mode || !VALID_MODES.includes(body.mode)) {
      return NextResponse.json({ error: "Invalid or missing mode." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI Mock Interview is not configured yet. Please check the OpenRouter API key." },
        { status: 503 }
      );
    }

    if (body.mode === "evaluate_answer" && !body.currentQuestion) {
      return NextResponse.json({ error: "Missing question to evaluate." }, { status: 400 });
    }

    const locale: Locale = body.locale === "ms" ? "ms" : "en";

    const { raw, provider } = await generateJSONWithFallback({
      routeName: "mock-interview",
      messages: [
        { role: "system", content: buildSystemPrompt(locale) },
        { role: "user", content: buildUserPrompt(body) },
      ],
      temperature: 0.6,
      maxTokens: 1400,
    });

    const parsed = parseJSON(raw);

    const result = {
      question: asString(parsed.question),
      sessionPlan: asStringArray(parsed.sessionPlan, MAX_QUESTIONS),
      feedback: normalizeFeedback(parsed.feedback),
      nextQuestion: asString(parsed.nextQuestion),
      finalReport: normalizeFinalReport(parsed.finalReport),
      provider,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("mock-interview error:", err);
    const message =
      err instanceof Error
        ? `The interview coach could not respond: ${err.message}`
        : "The interview coach could not respond. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
