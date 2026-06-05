import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateJSONWithFallback } from "@/lib/llm";
import type { CVBlock, BlockType } from "@/lib/cv-types";

type AssistantMode =
  | "generate_from_notes"
  | "improve_block"
  | "generate_bullets"
  | "refine_bullets"
  | "suggest_sections";

interface AssistantBody {
  mode: AssistantMode;
  targetJob?: string;
  format?: "resume" | "cv";
  style?: "harvard" | "creative";
  notes?: string;
  instruction?: string;
  block?: CVBlock;
  existingBlocks?: CVBlock[];
  locale?: "en" | "ms";
}

interface RawSuggestion {
  type?: string;
  blockType?: string;
  content?: Record<string, unknown>;
  explanation?: string;
}

const SUGGESTION_TYPES = new Set(["replace_block", "append_bullets", "add_block", "update_field"]);
const BLOCK_TYPES = new Set<BlockType>([
  "personal_info", "summary", "work_experience", "education", "skills",
  "certifications", "achievements", "extracurricular", "portfolio", "custom",
]);

const SAFETY_RULES = `STRICT HONESTY RULES — these override every other instruction:
- NEVER invent employers, job titles, dates, degrees, certifications, metrics, awards, tools, or project outcomes.
- Only use facts present in the user's notes or current section content. Do not add numbers/percentages the user did not provide.
- If a metric would strengthen a bullet but none was given, either omit it or use the literal placeholder "[add metric if available]".
- "More pompous / more detailed / stronger" means more polished, professional, confident and impact-focused — NOT exaggerated or fabricated.
- Use strong CV action verbs (e.g. Developed, Built, Led, Coordinated, Improved) and concise, readable phrasing.
- Add relevant role keywords only when they genuinely fit the user's described work.`;

const OUTPUT_CONTRACT = `Return ONLY a JSON object with this exact shape (no markdown, no commentary):
{
  "suggestions": [
    {
      "type": "append_bullets" | "update_field" | "replace_block" | "add_block",
      "blockType": "summary" | "work_experience" | "skills" | "achievements" | "extracurricular" | "portfolio" | "education" | "certifications" | "custom",
      "content": { ... },
      "explanation": "one short sentence on what changed"
    }
  ],
  "warnings": ["short notes about missing info you could not invent"]
}

CONTENT KEYS BY SECTION (use ONLY these keys):
- summary: { "text": "..." }
- skills: { "items": ["skill", ...] }
- work_experience / achievements / extracurricular: { "bullets": ["bullet", ...] }
- portfolio: { "description": "..." }
- custom: { "body": "..." }
Bullets must NOT start with a bullet character or dash.`;

function blockSummary(block?: CVBlock): string {
  if (!block) return "(no section selected)";
  return `Section type: ${block.type}\nCurrent content: ${JSON.stringify(block.content)}`;
}

function buildUserPrompt(body: AssistantBody): string {
  const parts: string[] = [];
  parts.push(`Mode: ${body.mode}`);
  parts.push(`Target job: ${body.targetJob?.trim() || "(not specified)"}`);
  parts.push(`Document type: ${body.format === "cv" ? "full CV" : "resume"}`);
  if (body.instruction) parts.push(`Extra instruction: ${body.instruction}`);
  if (body.notes?.trim()) parts.push(`User notes:\n"""\n${body.notes.slice(0, 4000)}\n"""`);
  parts.push(`Active section:\n${blockSummary(body.block)}`);

  switch (body.mode) {
    case "generate_bullets":
      parts.push(`Task: From the user's notes, write 3-5 NEW achievement-oriented bullet points for this ${body.block?.type ?? "section"}. Return one suggestion of type "append_bullets" with { "bullets": [...] }.`);
      break;
    case "refine_bullets":
      parts.push(`Task: Rewrite the section's existing bullet points to be stronger and more professional${body.instruction ? ` (${body.instruction})` : ""}. Keep every fact truthful. Return one suggestion of type "update_field" with { "bullets": [...] }.`);
      break;
    case "improve_block":
      parts.push(`Task: Improve this section's writing. Return one suggestion of type "update_field" using the correct content key for the section type (text/items/bullets/description/body). Keep all facts truthful.`);
      break;
    case "suggest_sections":
      parts.push(`Task: From the notes, suggest up to 3 helpful sections to ADD (only summary, skills, or achievements — never invent an employer or role). Return suggestions of type "add_block".`);
      break;
    case "generate_from_notes":
    default:
      parts.push(`Task: Turn the notes into CV-ready sections. Return "add_block" suggestions for summary, skills, and achievements where supported by the notes.`);
      break;
  }
  return parts.join("\n\n");
}

function sanitizeContent(raw: Record<string, unknown> | undefined): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      out[key] = value;
    } else if (Array.isArray(value)) {
      out[key] = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    }
  }
  return out;
}

function safeParse(text: string): { suggestions: RawSuggestion[]; warnings: string[] } {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  }
  let parsed: { suggestions?: RawSuggestion[]; warnings?: string[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("non-JSON");
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  }
  return {
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((w) => typeof w === "string") : [],
  };
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("cv-assistant", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const body = (await request.json()) as AssistantBody;

    if (!body.mode) {
      return NextResponse.json({ error: "Missing mode." }, { status: 400 });
    }
    if (!process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "No AI provider is configured." }, { status: 500 });
    }

    const langRule = body.locale === "ms"
      ? "Write all human-readable text in Bahasa Melayu (keep proper nouns and technical terms as-is)."
      : "Write all content in clear, professional English.";

    const { raw, provider } = await generateJSONWithFallback({
      routeName: "cv-assistant",
      messages: [
        {
          role: "system",
          content: `You are Tenun's CV writing assistant. You help students and fresh graduates turn rough notes into strong, truthful CV content.\n\n${SAFETY_RULES}\n\n${langRule}\n\n${OUTPUT_CONTRACT}`,
        },
        { role: "user", content: buildUserPrompt(body) },
      ],
      temperature: 0.4,
      maxTokens: 1800,
    });

    const { suggestions, warnings } = safeParse(raw);

    // Validate / sanitize before returning to the client.
    const clean = suggestions
      .filter((s) => s.type && SUGGESTION_TYPES.has(s.type) && s.blockType && BLOCK_TYPES.has(s.blockType as BlockType))
      .map((s) => ({
        type: s.type as "replace_block" | "append_bullets" | "add_block" | "update_field",
        blockType: s.blockType as BlockType,
        content: sanitizeContent(s.content),
        explanation: typeof s.explanation === "string" ? s.explanation : "",
      }))
      .filter((s) => Object.keys(s.content).length > 0);

    return NextResponse.json({ suggestions: clean, warnings, provider });
  } catch (err) {
    console.error("cv-assistant error:", err);
    return NextResponse.json({ error: "The assistant could not respond. Please try again." }, { status: 500 });
  }
}
