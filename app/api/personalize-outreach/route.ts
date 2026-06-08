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
import type { OutreachAIResult } from "@/lib/personalization";

const SYSTEM_PROMPT = `You are Tenun's writing assistant. You draft short, authentic outreach messages for a student/fresh graduate. The message is theirs to edit and send — you only draft.

You receive: the user's profile, the message type (cold-email, linkedin-message, mentorship-request, follow-up, self-intro, why-good-fit), an optional selected career pathway, an optional target role/company, an optional recipient context (e.g. a mentor's name/role), the user's current skill gaps, and optionally their resume text and a base draft to improve.

Return a JSON object with EXACTLY this shape:
{
  "subject": "Only for email types — a short, specific subject line. Omit or empty for non-email types.",
  "body": "The message body. Warm, specific, and concise (roughly 90-160 words). Use real details from the profile/resume. Sign off generically as the user (do not invent a real name if none is given)."
}

CRITICAL HONESTY RULES:
- NEVER invent achievements, job titles, companies worked at, projects, certifications, GPA, or metrics that are not in the profile/resume text.
- If the user lacks direct experience, phrase it honestly: "I'm currently building experience in..." or "I'm early in my journey but...".
- Do not promise outcomes or exaggerate. Keep it humble and genuine.
- Ground claims in the provided skills, interests, pathway and resume text only.
- If a base draft is provided, IMPROVE it (clarity, warmth, specificity) without adding fabricated facts.

${GROUNDING_RULES}`;

const EMAIL_TYPES = new Set(["cold-email", "follow-up", "why-good-fit"]);

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("personalize-outreach", ip);
  if (rateLimited.limited) return rateLimited.response;

  if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI personalization is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const locale: Locale = body?.locale === "ms" || body?.locale === "zh-CN" ? body.locale : "en";
    const messageType = asString(body?.messageType, 40) || "cold-email";

    const userMessage = JSON.stringify(
      {
        profile: body?.profile ?? {},
        messageType,
        pathwayName: body?.pathwayName ?? null,
        targetRole: body?.targetRole ?? null,
        targetCompany: body?.targetCompany ?? null,
        recipientContext: body?.recipientContext ?? null,
        skillGaps: Array.isArray(body?.skillGaps) ? body.skillGaps : [],
        resumeText: typeof body?.resumeText === "string" ? body.resumeText.slice(0, 2500) : null,
        baseDraft: body?.baseDraft ?? null,
      },
      null,
      0
    );

    const { raw } = await generateJSONWithFallback({
      routeName: "personalize-outreach",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + localeDirective(locale) },
        { role: "user", content: `Draft this outreach message:\n${userMessage}` },
      ],
      temperature: 0.6,
      maxTokens: 700,
    });

    const parsed = extractJsonObject<Record<string, unknown>>(raw);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });
    }

    const bodyText = asString(parsed.body, 2000);
    if (!bodyText) {
      return NextResponse.json({ error: "AI response was empty." }, { status: 502 });
    }

    const result: OutreachAIResult = { body: bodyText };
    const subject = asString(parsed.subject, 160);
    if (subject && EMAIL_TYPES.has(messageType)) result.subject = subject;

    return NextResponse.json(result);
  } catch (err) {
    console.error("personalize-outreach error:", err);
    return NextResponse.json({ error: "Failed to draft outreach message." }, { status: 500 });
  }
}
