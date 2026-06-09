import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import { cleanString, badRequest, LIMITS } from "@/lib/api-validation";
import {
  skillSuggestions,
  interestSuggestions,
  industrySuggestions,
} from "@/lib/resume-parser";
import {
  educationEntriesToString,
  experienceEntriesToString,
  WORKING_STYLES,
  type EducationEntry,
  type ExperienceEntry,
  type ParsedProfileFormData,
} from "@/lib/profile-form";

/**
 * CV/resume parser.
 *
 * DATA-HONESTY CONTRACT: the model must extract only what the CV actually
 * contains. Anything not clearly present is returned as "" / [] — it must NOT
 * be inferred, guessed, or invented. Demo data may be fictional; parsed user
 * data must be evidence-based (see lib/profile-form.ts).
 *
 * The response keeps two views so every caller stays happy:
 *   - `profile`     — back-compat `Partial<UserProfile>` (education/experience
 *                     as strings) used by the CV builder + CVUpload card.
 *   - `confidence`  — same boolean keys as before (CVUpload renders these).
 *   - `form`        — NEW: structured fields for the profile wizard prefill.
 */
const SYSTEM_PROMPT = `You are a precise resume/CV parser. Extract ONLY information that is explicitly present in the resume text. Return a single JSON object with exactly this shape:

{
  "name": "string — the person's full name, or \\"\\"",
  "email": "string — their email address exactly as written, or \\"\\"",
  "contactNumber": "string — their phone/mobile number exactly as written, or \\"\\"",
  "currentRole": "string — current or most recent job title / student status, or \\"\\"",
  "description": "string — a 1-2 sentence professional summary, ONLY if the CV has a summary/objective/about section or it can be quoted from the text. Otherwise \\"\\"",
  "education": [
    { "school": "", "fieldOfStudy": "", "qualification": "", "startYear": "", "endYear": "" }
  ],
  "experience": [
    { "company": "", "role": "", "description": "", "startYear": "", "endYear": "" }
  ],
  "skills": ["array of matched skill tags"],
  "interests": ["array of matched interest tags"],
  "preferredIndustries": ["array of matched industry tags"],
  "locationPreference": "string — city/country ONLY if stated, else \\"\\"",
  "salaryExpectation": "string — ONLY if the CV states a salary expectation, else \\"\\"",
  "availabilityYear": "string — ONLY if the CV states when they are available to start, else \\"\\"",
  "availabilityMonth": "string — ONLY if the CV states an availability month, else \\"\\"",
  "workingStyle": "string — exactly one of Hybrid, Remote, On-site, ONLY if the CV states a preference, else \\"\\""
}

CRITICAL ANTI-HALLUCINATION RULES — read carefully:
1. NEVER invent, infer, or guess missing facts. If a value is not clearly in the resume text, return "" (or [] for arrays). This applies especially to: phone numbers, emails, salary expectations, universities/schools, grades/GPA, companies, dates/years, certifications, achievements, job titles, locations, links and portfolio URLs.
2. If the resume is vague, keep it vague — leave structured sub-fields empty rather than filling them with plausible-sounding values.
3. For each education/experience entry, only include the sub-fields you can actually read. Leave the others "". Do not output an entry that has no real data. If there is no education (or experience) at all, return an empty array [].
4. "startYear"/"endYear" must be copied from the text. Never estimate a year. Use "" for an ongoing/present end date.
5. "description" / "interests" / "preferredIndustries" may only reflect things explicitly stated or directly evidenced by the listed projects/experience. Do not infer interests or industries from a name, school, or single keyword guess. When unsure, leave them empty.
6. For "skills", match ONLY from this list: ${JSON.stringify(skillSuggestions)}
7. For "interests", match ONLY from this list: ${JSON.stringify(interestSuggestions)}
8. For "preferredIndustries", match ONLY from this list: ${JSON.stringify(industrySuggestions)}
9. Return ONLY valid JSON — no markdown, no code fences, no explanation.`;

function safeParseJSON(text: string): Record<string, unknown> {
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

// ── Sanitizers: coerce LLM output to safe, evidence-only shapes ───────────────
const MAX_ENTRIES = 8;

/** Trimmed string, or "" for anything non-string / falsy. */
function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function strArray(v: unknown, allowList: string[]): string[] {
  if (!Array.isArray(v)) return [];
  const allowed = new Set(allowList);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = str(item);
    if (s && allowed.has(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

function educationArray(v: unknown): EducationEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, MAX_ENTRIES)
    .map((e) => {
      const o = (e ?? {}) as Record<string, unknown>;
      return {
        school: str(o.school),
        fieldOfStudy: str(o.fieldOfStudy),
        qualification: str(o.qualification),
        startYear: str(o.startYear),
        endYear: str(o.endYear),
      };
    })
    .filter((e) => e.school || e.fieldOfStudy || e.qualification);
}

function experienceArray(v: unknown): ExperienceEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, MAX_ENTRIES)
    .map((e) => {
      const o = (e ?? {}) as Record<string, unknown>;
      return {
        company: str(o.company),
        role: str(o.role),
        description: str(o.description),
        startYear: str(o.startYear),
        endYear: str(o.endYear),
      };
    })
    .filter((e) => e.company || e.role || e.description);
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("parse-resume", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const { text: rawText } = await request.json();

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return badRequest("Missing or invalid resume text.");
    }

    // Cap the résumé text before it reaches the AI provider or logs.
    const text = cleanString(rawText, LIMITS.RESUME);

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI parsing is unavailable — OpenRouter API key is not configured on the server (set OPENROUTER_API_KEY, or GROQ_API_KEY for fallback)." },
        { status: 503 }
      );
    }

    const { raw, provider } = await generateJSONWithFallback({
      routeName: "parse-resume",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Parse this resume and extract structured profile data. Remember: leave any field empty if the resume does not clearly state it — do not invent anything.\n\n${text.slice(0, 12000)}`,
        },
      ],
      temperature: 0.1,
      maxTokens: 4096,
    });

    const parsed = safeParseJSON(raw);

    // Structured, evidence-only view for the profile wizard.
    const workingStyleRaw = str(parsed.workingStyle);
    const form: ParsedProfileFormData = {
      name: str(parsed.name),
      email: str(parsed.email),
      contactNumber: str(parsed.contactNumber),
      currentRole: str(parsed.currentRole),
      description: str(parsed.description),
      education: educationArray(parsed.education),
      experience: experienceArray(parsed.experience),
      skills: strArray(parsed.skills, skillSuggestions),
      interests: strArray(parsed.interests, interestSuggestions),
      preferredIndustries: strArray(parsed.preferredIndustries, industrySuggestions),
      locationPreference: str(parsed.locationPreference),
      salaryExpectation: str(parsed.salaryExpectation),
      availabilityYear: str(parsed.availabilityYear),
      availabilityMonth: str(parsed.availabilityMonth),
      workingStyle: (WORKING_STYLES as string[]).includes(workingStyleRaw) ? workingStyleRaw : "",
      resumeText: "", // attached client-side from the raw extraction
    };

    // Back-compat `Partial<UserProfile>` view (strings) for the CV builder /
    // CVUpload card — derived from the same evidence, never invented.
    const educationStr = educationEntriesToString(form.education);
    const experienceStr = experienceEntriesToString(form.experience);

    const profile = {
      ...(form.name && { name: form.name }),
      ...(form.currentRole && { currentRole: form.currentRole }),
      ...(educationStr && { education: educationStr }),
      ...(experienceStr && { experience: experienceStr }),
      ...(form.skills.length > 0 && { skills: form.skills }),
      ...(form.interests.length > 0 && { interests: form.interests }),
      ...(form.preferredIndustries.length > 0 && { preferredIndustries: form.preferredIndustries }),
      ...(form.locationPreference && { locationPreference: form.locationPreference }),
    };

    const confidence = {
      name: !!form.name,
      currentRole: !!form.currentRole,
      education: !!educationStr,
      experience: !!experienceStr,
      skills: form.skills.length > 0,
      interests: form.interests.length > 0,
      industries: form.preferredIndustries.length > 0,
      location: !!form.locationPreference,
    };

    return NextResponse.json({ profile, form, confidence, provider });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json({ error: "Failed to parse resume." }, { status: 500 });
  }
}
