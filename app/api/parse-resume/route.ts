import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  skillSuggestions,
  interestSuggestions,
  industrySuggestions,
} from "@/lib/resume-parser";

const SYSTEM_PROMPT = `You are a resume/CV parser. Extract structured information from the resume text provided. Return a JSON object with exactly this shape:

{
  "name": "string or empty string",
  "currentRole": "string or empty string — their current or most recent job title / student status",
  "education": "string or empty string — degrees, institutions, years. Keep to 1-2 lines max.",
  "experience": "string or empty string — summarize in 2-3 SHORT sentences only. Do not list every role.",
  "skills": ["array of matched skill tags"],
  "interests": ["array of matched interest tags"],
  "preferredIndustries": ["array of matched industry tags"],
  "locationPreference": "string or empty string — city/country if mentioned"
}

IMPORTANT RULES:
1. For "skills", match ONLY from this list: ${JSON.stringify(skillSuggestions)}
2. For "interests", match ONLY from this list: ${JSON.stringify(interestSuggestions)}
3. For "preferredIndustries", match ONLY from this list: ${JSON.stringify(industrySuggestions)}
4. Keep "education" and "experience" very concise — no long paragraphs.
5. Return ONLY valid JSON — no markdown, no code fences, no explanation.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJSON(text: string): Record<string, any> {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    let repaired = cleaned;
    repaired = repaired.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
    repaired = repaired.replace(/,\s*"[^"]*":\s*\[[^\]]*$/, "");
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";
    return JSON.parse(repaired);
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("parse-resume", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid resume text." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "No API key configured." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Parse this resume and extract structured profile data:\n\n${text.slice(0, 12000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = safeParseJSON(raw);

    const confidence = {
      name: !!parsed.name,
      currentRole: !!parsed.currentRole,
      education: !!parsed.education,
      experience: !!parsed.experience,
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0,
      interests: Array.isArray(parsed.interests) && parsed.interests.length > 0,
      industries: Array.isArray(parsed.preferredIndustries) && parsed.preferredIndustries.length > 0,
      location: !!parsed.locationPreference,
    };

    const profile = {
      ...(parsed.name && { name: parsed.name }),
      ...(parsed.currentRole && { currentRole: parsed.currentRole }),
      ...(parsed.education && { education: parsed.education }),
      ...(parsed.experience && { experience: parsed.experience }),
      ...((parsed.skills as string[])?.length > 0 && {
        skills: (parsed.skills as string[]).filter((s) => skillSuggestions.includes(s)),
      }),
      ...((parsed.interests as string[])?.length > 0 && {
        interests: (parsed.interests as string[]).filter((s) => interestSuggestions.includes(s)),
      }),
      ...((parsed.preferredIndustries as string[])?.length > 0 && {
        preferredIndustries: (parsed.preferredIndustries as string[]).filter((s) => industrySuggestions.includes(s)),
      }),
      ...(parsed.locationPreference && { locationPreference: parsed.locationPreference }),
    };

    return NextResponse.json({ profile, confidence, provider: "groq" });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json({ error: "Failed to parse resume." }, { status: 500 });
  }
}
