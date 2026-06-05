import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";

const SYSTEM_PROMPT = `You are a brutally honest career guide helping students and fresh graduates who don't know their job title yet. Your job is to take whatever they describe — even a single vague word — and show them the full range of genuinely different careers that word could mean.

Given a user's query, return a JSON object with this exact shape:

{
  "overview": "2–3 sentences in plain, friendly language explaining what this career space is about. Write like you're texting a friend. No buzzwords.",
  "didYouMean": [
    "A more specific activity-based search phrase 1",
    "A more specific activity-based search phrase 2",
    "A more specific activity-based search phrase 3",
    "A more specific activity-based search phrase 4"
  ],
  "suggestions": [
    {
      "title": "Specific Canonical Job Title",
      "explanation": "2 sentences: what this job actually is and why it matches the query. Write like you're texting a friend. No jargon.",
      "dayToDay": "One honest sentence about a typical Tuesday — specific tools, what they build or solve, who they talk to.",
      "salaryRange": "MYR range/mo for Malaysia context, or USD/yr if clearly international",
      "industries": ["Industry 1", "Industry 2"],
      "resumeSkills": []
    }
  ]
}

CRITICAL RULES — follow these exactly or the response is wrong:

1. EXACTLY 6 suggestions. Not 5, not 7, not 8. Always 6.

2. EVERY suggestion must be genuinely different from the others. Different industry, different skill set, different kind of work. Test yourself: if two suggestions could be described as the same job with a different name, cut one.
   BAD for "programmer": Frontend Developer, Backend Developer, Full Stack Developer, Web Developer, Software Engineer, Mobile Developer — these are all similar web developers. WRONG.
   GOOD for "programmer": Game Programmer, Machine Learning Engineer, Embedded Systems Engineer, 3D Graphics Programmer, Cybersecurity Analyst, DevOps Engineer — genuinely different tracks. RIGHT.

3. When the query is a single generic word, span at least 4 different industries or domains.

4. When the query is descriptive like "I want to make 3D models", return the exact job titles for those activities including niche roles.

5. didYouMean: always 4 items. Make these specific activity-based phrases a user could type to narrow down.
   BAD: ["Software Engineering", "Data Science"]
   GOOD: ["I want to build mobile games", "I want to create 3D animations"]

6. Write at a level a 17-year-old understands. No buzzwords: no leverage, synergy, stakeholder, deliverables, cross-functional, dynamic, robust.

7. Be concrete. "Writes Python scripts to clean messy data" beats "responsible for data analysis tasks".

8. Return ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.`;

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
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        overview: typeof parsed.overview === "string" ? parsed.overview : "",
        didYouMean: Array.isArray(parsed.didYouMean) ? parsed.didYouMean : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    }
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
  // Public endpoint — rate limit by IP so unauthenticated users can search freely
  const ip = (request.headers.get("x-forwarded-for") ?? "anonymous").split(",")[0].trim();
  const rateLimited = await checkRateLimit("job-intent", ip);
  if (rateLimited.limited) return rateLimited.response;

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

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "No API key configured." }, { status: 500 });
    }

    const { raw } = await generateJSONWithFallback({
      routeName: "job-intent",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(query, skills, interests, experience) },
      ],
      temperature: 0.4,
      maxTokens: 3000,
    });

    const result = safeParseResult(raw);
    result.suggestions = result.suggestions.slice(0, 6);
    return NextResponse.json(result);
  } catch (err) {
    console.error("job-intent error:", err);
    return NextResponse.json({ error: "Failed to generate suggestions." }, { status: 500 });
  }
}
