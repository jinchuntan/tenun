import type { Locale } from "./i18n";

/**
 * Server-side helpers shared by the dashboard personalization routes.
 *
 * These routes only ever EXPLAIN, RANK, SUMMARIZE or DRAFT on top of
 * deterministic data — they must never invent factual records (jobs, mentors,
 * courses, salaries, links, achievements). The grounding rules below are
 * appended to every personalization system prompt.
 */

/** Shared grounding rules — keep AI honest and non-hallucinating. */
export const GROUNDING_RULES = `STRICT GROUNDING RULES:
- Only use facts present in the structured input (profile, archetype, threads, pathways, skill gaps, target job, resume text). Do NOT invent companies, jobs, mentors, courses, salaries, scholarships, links, locations, certifications, achievements, or work experience.
- Do NOT predict the future or guarantee outcomes. Use hedged language: "based on your current profile", "this suggests", "a practical next step could be".
- If evidence is missing, be honest (e.g. "you're currently building experience in...") rather than fabricating it.
- Keep the tone friendly, plain and encouraging — written for students and fresh graduates. No corporate buzzwords.
- Be concise: short sentences suitable for compact dashboard cards.
- Return ONLY valid JSON matching the requested shape. No markdown, no code fences, no text outside the JSON.`;

/** Locale directive appended to system prompts so string VALUES are localized. */
export function localeDirective(locale: Locale): string {
  if (locale === "ms") {
    return `\n\nLANGUAGE: Write every user-facing string VALUE in natural, friendly Malaysian Malay (Bahasa Melayu) — not Indonesian, not formal government style. Keep all JSON keys in English. Job titles and skill names may stay in English when they are common industry terms.`;
  }
  if (locale === "zh-CN") {
    return `\n\nLANGUAGE: Write every user-facing string VALUE in natural, friendly Simplified Chinese (简体中文) suitable for young Malaysian users. Keep all JSON keys in English. Job titles and skill names may stay in English when they are common industry terms.`;
  }
  return "";
}

/**
 * Best-effort JSON object extraction. Handles code-fence wrapping and trailing
 * text by falling back to the first `{` … last `}` slice. Returns null on
 * failure so callers can fall back to deterministic content.
 */
export function extractJsonObject<T = Record<string, unknown>>(text: string): T | null {
  if (!text || !text.trim()) return null;
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Coerce an unknown value to a trimmed string (empty string on miss). */
export function asString(v: unknown, max = 800): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Coerce an unknown value to a string array of up to `max` non-empty entries. */
export function asStringArray(v: unknown, max = 5): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}
