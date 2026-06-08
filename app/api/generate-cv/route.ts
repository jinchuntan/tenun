import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import { optionalString, LIMITS } from "@/lib/api-validation";
import type { GeneratedCV } from "@/lib/cv-generate";
import type { PortfolioEvidence } from "@/lib/portfolio-types";

interface GenerateBody {
  resumeText?: string;
  targetJob?: string;
  format?: "resume" | "cv";
  style?: "harvard" | "creative";
  portfolioEvidence?: PortfolioEvidence[];
  userNotes?: string;
  locale?: "en" | "ms" | "zh-CN";
}

const JSON_SHAPE = `{
  "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "summary": "2-4 sentence professional summary",
  "workExperience": [
    { "company": "", "role": "", "startDate": "e.g. Jan 2022", "endDate": "e.g. Present", "bullets": ["impact-focused achievement", "..."] }
  ],
  "education": [
    { "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "grade": "" }
  ],
  "skills": ["skill", "..."],
  "certifications": [ { "name": "", "issuer": "", "date": "", "url": "" } ],
  "achievements": ["notable achievement", "..."],
  "extracurricular": [ { "organisation": "", "role": "", "startDate": "", "endDate": "", "bullets": ["..."] } ],
  "portfolio": [ { "title": "", "url": "", "description": "" } ]
}`;

function buildSystemPrompt(format: "resume" | "cv", locale: "en" | "ms" | "zh-CN"): string {
  const lengthRule =
    format === "resume"
      ? `This is a RESUME (1 page). Be concise: at most 3 work experiences, at most 3 bullet points each, a 2-3 sentence summary, and roughly 8-12 skills. Omit certifications, achievements, extracurricular, and portfolio unless they are clearly important.`
      : `This is a full CV (up to 2 pages). Be thorough: include relevant work experiences with 3-5 bullet points each, a fuller summary, education detail, skills, and where appropriate certifications, achievements, extracurricular activities, and portfolio items.`;

  const langRule =
    locale === "ms"
      ? `Write all human-readable content (summary, bullet points, descriptions) in Bahasa Melayu. Keep proper nouns, company names, and technical terms as-is.`
      : locale === "zh-CN"
      ? `Write all human-readable content (summary, bullet points, descriptions) in Simplified Chinese (简体中文). Keep proper nouns, company names, and technical terms as-is.`
      : `Write all content in clear, professional English.`;

  return `You are an expert CV/resume writer. Produce a complete, well-structured, ATS-friendly ${format} as a single JSON object.

Return ONLY valid JSON matching EXACTLY this shape (no markdown, no code fences, no commentary):

${JSON_SHAPE}

RULES:
1. ${lengthRule}
2. ${langRule}
3. Bullet points must be achievement-oriented and, where possible, quantified (numbers, %, scale). Start each with a strong action verb. Do NOT include leading bullet characters.
4. Tailor wording, skills, and emphasis toward the target job title when one is provided.
5. When resume source text is provided, extract the candidate's REAL details (name, contact info, history) from it — never invent contact details. Improve and rephrase the wording, but stay truthful to the source.
6. When NO source text is provided, generate a strong, realistic starter tailored to the target job that the user can edit. In that case leave "personalInfo" fields (name/email/phone/location/linkedin/website) as empty strings — do not fabricate a person.
7. Every string field must be a string and every list field must be an array. Use "" or [] when you have nothing for a field. Do not add keys that are not in the shape above.
8. PORTFOLIO / PROJECT EVIDENCE (when provided below): treat each item as REAL, user-supplied proof of work. Turn its title, role, tools, description, and outcome into strong, truthful CV content — populate the "portfolio" array (title, url, description) and, where it represents hands-on work, also add concise achievement bullets under "workExperience" and relevant "skills". Pack role, tools, and outcome into a readable "description". NEVER invent project details, metrics, or outcomes that were not provided. If an item has only a URL and no description, include it in "portfolio" with its title/url but do NOT guess what the link contains. For design portfolios, you may use professional wording (design process, user research, prototyping, visual design, usability testing, brand identity, and the named tools such as Figma/Canva/Adobe) ONLY when those details were provided or clearly implied by the evidence.`;
}

function formatPortfolioEvidence(items: PortfolioEvidence[]): string {
  const lines: string[] = [];
  items.forEach((item, i) => {
    const fields: string[] = [];
    if (item.title?.trim()) fields.push(`Title: ${item.title.trim()}`);
    if (item.role?.trim()) fields.push(`Role / contribution: ${item.role.trim()}`);
    if (item.tools?.length) fields.push(`Tools used: ${item.tools.filter(Boolean).join(", ")}`);
    if (item.description?.trim()) fields.push(`Description: ${item.description.trim()}`);
    if (item.outcome?.trim()) fields.push(`Outcome / impact: ${item.outcome.trim()}`);
    if (item.url?.trim()) fields.push(`Link: ${item.url.trim()}`);
    if (item.extractedText?.trim()) {
      fields.push(`Extracted file text: ${item.extractedText.trim().slice(0, 1500)}`);
    }
    if (item.url?.trim() && !item.description?.trim() && !item.extractedText?.trim()) {
      fields.push("NOTE: only a link was provided — do not guess the contents of this link.");
    }
    if (fields.length) lines.push(`Project ${i + 1}:\n${fields.join("\n")}`);
  });
  return lines.join("\n\n");
}

function buildUserPrompt(body: GenerateBody): string {
  const parts: string[] = [];
  parts.push(`Target job title: ${body.targetJob?.trim() || "(not specified — produce a strong general-purpose document)"}`);
  parts.push(`Document type: ${body.format === "cv" ? "Full CV" : "Resume"}`);

  if (body.resumeText && body.resumeText.trim()) {
    parts.push(
      `\nSource CV/resume/portfolio text to extract real details from (truncated):\n"""\n${body.resumeText.slice(0, 12000)}\n"""`
    );
  } else {
    parts.push(`\nNo source document was provided — use the notes and any portfolio evidence below, tailored to the target job.`);
  }

  if (body.userNotes && body.userNotes.trim()) {
    parts.push(`\nCandidate's own notes about their background:\n"""\n${body.userNotes.slice(0, 4000)}\n"""`);
  }

  const evidence = (body.portfolioEvidence ?? []).filter(
    (e) => e && (e.title?.trim() || e.description?.trim() || e.url?.trim() || e.outcome?.trim() || (e.tools && e.tools.length))
  );
  if (evidence.length) {
    parts.push(
      `\nPortfolio / project evidence supplied by the candidate (REAL — use truthfully, never fabricate):\n${formatPortfolioEvidence(evidence)}`
    );
  }

  return parts.join("\n");
}

function safeParseJSON(text: string): GeneratedCV {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Model returned non-JSON content.");
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("generate-cv", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const body = (await request.json()) as GenerateBody;

    // Cap oversized free-text before it reaches the AI provider or logs.
    body.resumeText = optionalString(body.resumeText, LIMITS.RESUME);
    body.targetJob = optionalString(body.targetJob, LIMITS.TITLE);
    body.userNotes = optionalString(body.userNotes, LIMITS.CONTEXT);
    if (Array.isArray(body.portfolioEvidence)) {
      body.portfolioEvidence = body.portfolioEvidence.slice(0, LIMITS.ARRAY_ITEMS);
    }

    const format = body.format === "cv" ? "cv" : "resume";
    const style = body.style === "creative" ? "creative" : "harvard";
    const locale = body.locale === "ms" ? "ms" : body.locale === "zh-CN" ? "zh-CN" : "en";

    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "No AI provider is configured." }, { status: 500 });
    }

    const { raw, provider } = await generateJSONWithFallback({
      routeName: "generate-cv",
      messages: [
        { role: "system", content: buildSystemPrompt(format, locale) },
        { role: "user", content: buildUserPrompt({ ...body, format, locale }) },
      ],
      temperature: 0.4,
      maxTokens: 4096,
    });

    const generated = safeParseJSON(raw);

    return NextResponse.json({ generated, provider, style, format });
  } catch (err) {
    console.error("generate-cv error:", err);
    return NextResponse.json({ error: "Failed to generate CV. Please try again." }, { status: 500 });
  }
}
