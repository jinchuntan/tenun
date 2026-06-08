import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import {
  GROUNDING_RULES,
  localeDirective,
  extractJsonObject,
  asString,
  asStringArray,
} from "@/lib/ai-prompt";
import type { Locale } from "@/lib/i18n";
import type { DashboardPersonalization, ThirtyDayAction } from "@/lib/personalization";

const SYSTEM_PROMPT = `You are Tenun's career companion. You explain a student's DETERMINISTIC career analysis in a warm, personal way. You do NOT generate the analysis — it is given to you. You only interpret and personalize it.

You receive structured JSON: the user's profile, their computed career archetype, their career "threads" (scored dimensions), the candidate pathways, the recommended pathway, their skill gaps, and an optional target job.

Return a JSON object with EXACTLY this shape:
{
  "personalizedSummary": "2-4 warm sentences summarizing where this person is right now and what their profile points toward. Reference real details from their profile/threads.",
  "whyThisArchetypeFits": "2-3 sentences explaining why the given archetype fits THEM, grounded in their actual skills/experience/interests.",
  "topStrengths": ["3 short strengths drawn from their profile and high-scoring threads"],
  "topRisks": ["3 short, kind risks or gaps to be aware of, drawn from low threads / skill gaps"],
  "recommendedPathExplanation": "2-3 sentences on why the recommended pathway aligns with their current profile. Mention a trade-off honestly.",
  "thirtyDayActions": [
    { "title": "Concrete action", "reason": "Why it helps them specifically", "timeframe": "e.g. Week 1" }
  ],
  "confidenceNote": "1 sentence reminding them this is guidance based on their current profile, not a prediction or guarantee."
}

Provide 3-5 thirtyDayActions. Keep everything concise for a compact dashboard UI.

${GROUNDING_RULES}`;

function fallbackUnavailable() {
  return NextResponse.json(
    { error: "AI personalization is not configured." },
    { status: 503 }
  );
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("personalize-dashboard-summary", ip);
  if (rateLimited.limited) return rateLimited.response;

  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    return fallbackUnavailable();
  }

  try {
    const body = await request.json();
    const locale: Locale = body?.locale === "ms" || body?.locale === "zh-CN" ? body.locale : "en";

    const userMessage = JSON.stringify(
      {
        profile: body?.profile ?? {},
        archetype: body?.archetype ?? {},
        threads: body?.threads ?? [],
        pathways: body?.pathways ?? [],
        recommendedPathway: body?.recommendedPathway ?? {},
        skillGaps: body?.skillGaps ?? [],
        targetJob: body?.targetJob ?? null,
      },
      null,
      0
    );

    const { raw } = await generateJSONWithFallback({
      routeName: "personalize-dashboard-summary",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + localeDirective(locale) },
        { role: "user", content: `Here is the deterministic analysis to personalize:\n${userMessage}` },
      ],
      temperature: 0.5,
      maxTokens: 1400,
    });

    const parsed = extractJsonObject<Record<string, unknown>>(raw);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    const actionsRaw = Array.isArray(parsed.thirtyDayActions) ? parsed.thirtyDayActions : [];
    const thirtyDayActions: ThirtyDayAction[] = actionsRaw
      .slice(0, 5)
      .map((a) => {
        const obj = (a ?? {}) as Record<string, unknown>;
        return {
          title: asString(obj.title, 120),
          reason: asString(obj.reason, 240),
          timeframe: asString(obj.timeframe, 60),
        };
      })
      .filter((a) => a.title);

    const result: DashboardPersonalization = {
      personalizedSummary: asString(parsed.personalizedSummary, 800),
      whyThisArchetypeFits: asString(parsed.whyThisArchetypeFits, 600),
      topStrengths: asStringArray(parsed.topStrengths, 4),
      topRisks: asStringArray(parsed.topRisks, 4),
      recommendedPathExplanation: asString(parsed.recommendedPathExplanation, 600),
      thirtyDayActions,
      confidenceNote: asString(parsed.confidenceNote, 240),
    };

    if (!result.personalizedSummary) {
      return NextResponse.json({ error: "AI response was empty." }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("personalize-dashboard-summary error:", err);
    return NextResponse.json({ error: "Failed to personalize summary." }, { status: 500 });
  }
}
