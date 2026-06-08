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
import { LIMITS } from "@/lib/api-validation";
import type { PathwayExplanation } from "@/lib/personalization";

const SYSTEM_PROMPT = `You are Tenun's career companion. You explain how a DETERMINISTIC career pathway relates to a specific student's profile. The pathway (name, timeline, description, required skills, trade-offs, risks) is given and fixed — do not change it or invent new roles/skills.

You receive the user's profile and one pathway. Return a JSON object with EXACTLY this shape:
{
  "whyFits": "2-3 sentences on why this path could fit THIS person, grounded in their actual skills, interests and experience.",
  "whatsDifficult": "2-3 sentences on what makes this path challenging for their CURRENT profile (missing skills, experience, risk appetite, trade-offs).",
  "howToTest30Days": "2-3 sentences describing a concrete, low-cost way to test this path within 30 days using things genuinely available to a student (a small project, an informational chat, a short course they choose)."
}

Do not invent specific companies, courses, mentors, or links. Refer to required skills and trade-offs that are present in the input.

${GROUNDING_RULES}`;

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("personalize-pathway", ip);
  if (rateLimited.limited) return rateLimited.response;

  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI personalization is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const locale: Locale = body?.locale === "ms" || body?.locale === "zh-CN" ? body.locale : "en";

    const userMessage = JSON.stringify(
      {
        profile: body?.profile ?? {},
        pathway: body?.pathway ?? {},
        targetJob: body?.targetJob ?? null,
      },
      null,
      0
    ).slice(0, LIMITS.AI_PAYLOAD);

    const { raw } = await generateJSONWithFallback({
      routeName: "personalize-pathway",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + localeDirective(locale) },
        { role: "user", content: `Personalize this pathway for the user:\n${userMessage}` },
      ],
      temperature: 0.5,
      maxTokens: 600,
    });

    const parsed = extractJsonObject<Record<string, unknown>>(raw);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    const result: PathwayExplanation = {
      whyFits: asString(parsed.whyFits, 500),
      whatsDifficult: asString(parsed.whatsDifficult, 500),
      howToTest30Days: asString(parsed.howToTest30Days, 500),
    };

    if (!result.whyFits && !result.whatsDifficult && !result.howToTest30Days) {
      return NextResponse.json({ error: "AI response was empty." }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("personalize-pathway error:", err);
    return NextResponse.json({ error: "Failed to personalize pathway." }, { status: 500 });
  }
}
