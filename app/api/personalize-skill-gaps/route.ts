import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import {
  GROUNDING_RULES,
  localeDirective,
  extractJsonObject,
  asString,
} from "@/lib/ai-prompt";
import type { Locale } from "@/lib/i18n";
import type { SkillGapExplanation } from "@/lib/personalization";

const SYSTEM_PROMPT = `You are Tenun's career companion. You explain WHY a set of deterministic skill gaps matter for a student's chosen career path. The skill list and the path are given and fixed — do NOT invent new skills, courses, certifications, or links. You only explain.

You receive: the user's profile, the selected pathway name, and a list of skill gaps (each with a priority of high/medium/low). For EACH skill in the input, return one explanation.

Return a JSON object with EXACTLY this shape:
{
  "explanations": [
    {
      "skill": "exact skill name from the input",
      "whyItMatters": "1-2 sentences on why this skill matters for the selected path.",
      "whatToBuild": "1 sentence: a small, concrete thing the user could build or do to PROVE this skill (no specific course/product/company names).",
      "urgency": "a short phrase like 'Start now', 'Within 3 months', or 'Longer-term' — align with the gap's priority (high=now, medium=3-6 months, low=longer-term)."
    }
  ]
}

Return one entry per input skill, using the EXACT skill names provided. Keep each field short for compact UI cards.

${GROUNDING_RULES}`;

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("personalize-skill-gaps", ip);
  if (rateLimited.limited) return rateLimited.response;

  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI personalization is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const locale: Locale = body?.locale === "ms" || body?.locale === "zh-CN" ? body.locale : "en";
    const skillGaps = Array.isArray(body?.skillGaps) ? body.skillGaps : [];

    if (skillGaps.length === 0) {
      return NextResponse.json({ explanations: [] });
    }

    const userMessage = JSON.stringify(
      {
        profile: body?.profile ?? {},
        pathwayName: body?.pathwayName ?? "",
        skillGaps,
        targetJob: body?.targetJob ?? null,
      },
      null,
      0
    );

    const { raw } = await generateJSONWithFallback({
      routeName: "personalize-skill-gaps",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + localeDirective(locale) },
        { role: "user", content: `Explain these skill gaps for the user:\n${userMessage}` },
      ],
      temperature: 0.4,
      maxTokens: 1400,
    });

    const parsed = extractJsonObject<Record<string, unknown>>(raw);
    const arr = Array.isArray(parsed?.explanations) ? parsed!.explanations : [];

    const explanations: SkillGapExplanation[] = arr
      .map((e) => {
        const obj = (e ?? {}) as Record<string, unknown>;
        return {
          skill: asString(obj.skill, 80),
          whyItMatters: asString(obj.whyItMatters, 300),
          whatToBuild: asString(obj.whatToBuild, 300),
          urgency: asString(obj.urgency, 60),
        };
      })
      .filter((e) => e.skill && (e.whyItMatters || e.whatToBuild));

    return NextResponse.json({ explanations });
  } catch (err) {
    console.error("personalize-skill-gaps error:", err);
    return NextResponse.json({ error: "Failed to personalize skill gaps." }, { status: 500 });
  }
}
