import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are helping students and fresh graduates figure out what job they actually want. Many of them don't know the real job titles yet — they just know what they enjoy doing.

Given a user's query (and optional background), return a JSON object with this exact shape:

{
  "overview": "2–3 sentences in plain, friendly language explaining what this career space is about. Write like you're explaining it to a friend, not a LinkedIn post. No buzzwords.",
  "didYouMean": ["Related sub-field or search 1", "Related search 2", "Related search 3", "Related search 4"],
  "suggestions": [
    {
      "title": "Canonical Job Title",
      "explanation": "2 sentences in plain English: what this job actually is and why it matches what the user described. Avoid corporate jargon. Write like you're texting a friend who asked 'what does this job mean?'",
      "dayToDay": "One honest sentence about what this person does on a typical Tuesday — tools they use, what they make or solve, who they talk to.",
      "salaryRange": "e.g. MYR 4,000–9,000/mo or USD 55,000–90,000/yr — use the most relevant currency for the user's context",
      "industries": ["Industry 1", "Industry 2"],
      "resumeSkills": ["Only include skills from the provided skills list that are directly relevant — leave empty array if none"]
    }
  ]
}

Rules:
- Return 6–8 suggestions covering the full range of what the user could mean — from common entry-level roles to more niche ones.
- didYouMean: 3–5 related areas or sub-fields the user might want to explore.
- Write ALL text at a reading level a 17-year-old would understand. No jargon, no corporate speak, no buzzwords like "leverage", "synergy", "cross-functional", "stakeholder", "deliverables", "robust", "dynamic", "fast-paced environment".
- Be specific and concrete. Instead of "responsible for creating engaging content", say "writes posts, makes videos, or designs graphics for social media".
- Distinguish each suggestion clearly — no near-duplicates.
- Return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;

async function suggestWithGemini(query: string, skills: string[], interests: string[], experience: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: "application/json" },
  });

  const userMessage = buildUserMessage(query, skills, interests, experience);
  const result = await model.generateContent([{ text: SYSTEM_PROMPT }, { text: userMessage }]);
  return result.response.text();
}

async function suggestWithGroq(query: string, skills: string[], interests: string[], experience: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(query, skills, interests, experience) },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });
  return completion.choices[0]?.message?.content || "";
}

function buildUserMessage(query: string, skills: string[], interests: string[], experience: string): string {
  return [
    `User query: "${query}"`,
    skills.length ? `Skills: ${skills.slice(0, 20).join(", ")}` : "",
    interests.length ? `Interests: ${interests.slice(0, 10).join(", ")}` : "",
    experience ? `Experience summary: ${experience.slice(0, 300)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function safeParseResult(text: string): { overview: string; didYouMean: string[]; suggestions: unknown[] } {
  const fallback = { overview: "", didYouMean: [], suggestions: [] };
  let cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        overview: typeof parsed.overview === "string" ? parsed.overview : "",
        didYouMean: Array.isArray(parsed.didYouMean) ? parsed.didYouMean : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    }
    // Legacy: bare array of suggestions
    if (Array.isArray(parsed)) return { ...fallback, suggestions: parsed };
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        return {
          overview: typeof parsed.overview === "string" ? parsed.overview : "",
          didYouMean: Array.isArray(parsed.didYouMean) ? parsed.didYouMean : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        };
      } catch { /* fall through */ }
    }
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, skills = [], interests = [], experience = "" } = body as {
      query: string;
      skills: string[];
      interests: string[];
      experience: string;
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: "Missing query." }, { status: 400 });
    }

    let raw: string;

    if (process.env.GEMINI_API_KEY) {
      try {
        raw = await suggestWithGemini(query, skills, interests, experience);
      } catch {
        if (!process.env.GROQ_API_KEY) throw new Error("No fallback API key available.");
        raw = await suggestWithGroq(query, skills, interests, experience);
      }
    } else if (process.env.GROQ_API_KEY) {
      raw = await suggestWithGroq(query, skills, interests, experience);
    } else {
      return NextResponse.json({ error: "No AI API key configured." }, { status: 500 });
    }

    const result = safeParseResult(raw);
    result.suggestions = result.suggestions.slice(0, 8);
    return NextResponse.json(result);
  } catch (err) {
    console.error("job-intent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate suggestions." },
      { status: 500 }
    );
  }
}
