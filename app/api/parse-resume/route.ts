import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
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

// ── Gemini (primary) ──

async function parseWithGemini(resumeText: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `Parse this resume and extract structured profile data:\n\n${resumeText.slice(0, 12000)}` },
  ]);

  return result.response.text();
}

// ── Groq (fallback) ──

async function parseWithGroq(resumeText: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Parse this resume and extract structured profile data:\n\n${resumeText.slice(0, 12000)}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message?.content || "";
}

// ── Safe JSON parse with truncation repair ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJSON(text: string): Record<string, any> {
  // Strip markdown fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to repair truncated JSON by closing open strings/arrays/objects
    let repaired = cleaned;

    // Remove trailing incomplete string value (e.g., `"experience": "some text that got cut`)
    repaired = repaired.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
    // Remove trailing incomplete array item
    repaired = repaired.replace(/,\s*"[^"]*":\s*\[[^\]]*$/, "");

    // Count and close unclosed brackets
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";

    return JSON.parse(repaired);
  }
}

// ── Route handler ──

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid resume text." },
        { status: 400 }
      );
    }

    // Try Gemini first, fall back to Groq
    let responseText: string;
    let provider: string;

    if (process.env.GEMINI_API_KEY) {
      try {
        responseText = await parseWithGemini(text);
        provider = "gemini";
      } catch (geminiErr) {
        console.warn("Gemini failed, falling back to Groq:", geminiErr);
        if (!process.env.GROQ_API_KEY) {
          throw geminiErr;
        }
        responseText = await parseWithGroq(text);
        provider = "groq";
      }
    } else if (process.env.GROQ_API_KEY) {
      responseText = await parseWithGroq(text);
      provider = "groq";
    } else {
      return NextResponse.json(
        { error: "No AI API key configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const parsed = safeParseJSON(responseText);

    // Build confidence map
    const confidence = {
      name: !!parsed.name,
      currentRole: !!parsed.currentRole,
      education: !!parsed.education,
      experience: !!parsed.experience,
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0,
      interests: Array.isArray(parsed.interests) && parsed.interests.length > 0,
      industries:
        Array.isArray(parsed.preferredIndustries) &&
        parsed.preferredIndustries.length > 0,
      location: !!parsed.locationPreference,
    };

    // Build profile, filtering arrays to valid suggestions only
    const profile = {
      ...(parsed.name && { name: parsed.name }),
      ...(parsed.currentRole && { currentRole: parsed.currentRole }),
      ...(parsed.education && { education: parsed.education }),
      ...(parsed.experience && { experience: parsed.experience }),
      ...((parsed.skills as string[])?.length > 0 && {
        skills: (parsed.skills as string[]).filter((s) =>
          skillSuggestions.includes(s)
        ),
      }),
      ...((parsed.interests as string[])?.length > 0 && {
        interests: (parsed.interests as string[]).filter((s) =>
          interestSuggestions.includes(s)
        ),
      }),
      ...((parsed.preferredIndustries as string[])?.length > 0 && {
        preferredIndustries: (parsed.preferredIndustries as string[]).filter(
          (s) => industrySuggestions.includes(s)
        ),
      }),
      ...(parsed.locationPreference && {
        locationPreference: parsed.locationPreference,
      }),
    };

    return NextResponse.json({ profile, confidence, provider });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to parse resume with AI.",
      },
      { status: 500 }
    );
  }
}
