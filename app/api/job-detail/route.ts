import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a brutally honest career mentor helping a student understand what it really takes to land a specific job.

Given a job title and brief description, return a JSON object with this exact shape:

{
  "skills_required": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "skills_nice_to_have": ["Bonus skill 1", "Bonus skill 2", "Bonus skill 3"],
  "secret_sauce": "2–3 sentences on what actually separates candidates who get hired from those who don't. Be specific and honest — not generic advice like 'show passion'. Give a real insight.",
  "fit_questions": [
    "Honest self-check question 1 a candidate should ask themselves?",
    "Honest self-check question 2?",
    "Honest self-check question 3?"
  ],
  "common_gaps": ["Gap most candidates have #1", "Gap most candidates have #2", "Gap most candidates have #3"],
  "how_to_get_there": "3–4 sentences on the most realistic path to land this role for a fresh graduate or student. Mention specific entry-level roles, portfolio steps, or skills to build first. Be concrete.",
  "entry_paths": ["Entry-level role or path 1", "Entry-level role or path 2", "Entry-level role or path 3"]
}

Rules:
- Write at a level a 17-year-old would understand. No jargon, no buzzwords.
- secret_sauce must be genuinely specific to this job — not generic career advice.
- fit_questions should be uncomfortable and real, not soft.
- common_gaps should be things most university students actually lack, not obvious things.
- Return ONLY valid JSON. No markdown, no code fences.`;

function safeParse(text: string) {
  const fallback = {
    skills_required: [],
    skills_nice_to_have: [],
    secret_sauce: "",
    fit_questions: [],
    common_gaps: [],
    how_to_get_there: "",
    entry_paths: [],
  };
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    return { ...fallback, ...JSON.parse(cleaned) };
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try { return { ...fallback, ...JSON.parse(cleaned.slice(start, end + 1)) }; }
      catch { /* fall through */ }
    }
  }
  return fallback;
}

export async function POST(request: Request) {
  // Public endpoint — rate limit by IP so unauthenticated users can explore freely
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("job-detail", ip);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const { title, context = "" } = await request.json() as { title: string; context: string };

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "No API key configured." }, { status: 500 });
    }

    const { raw } = await generateJSONWithFallback({
      routeName: "job-detail",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Job title: "${title}"\nContext: "${context}"` },
      ],
      temperature: 0.4,
      maxTokens: 1500,
    });

    return NextResponse.json(safeParse(raw));
  } catch (err) {
    console.error("job-detail error:", err);
    return NextResponse.json({ error: "Failed to generate job details." }, { status: 500 });
  }
}
