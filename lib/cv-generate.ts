import type { CVBlock, BlockType } from "./cv-types";
import { DEFAULT_BLOCK_CONTENT, newId } from "./cv-types";

/**
 * Shape returned by the `/api/generate-cv` route. Every field is optional —
 * the AI may omit sections it has nothing to say about, and a generated CV
 * built from only a target job (no uploaded file) will leave contact fields
 * blank for the user to fill in.
 *
 * This intentionally mirrors the keys used by `DEFAULT_BLOCK_CONTENT` so the
 * mapper below can drop values straight into the existing block model.
 */
export interface GeneratedCV {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  workExperience?: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  achievements?: string[];
  extracurricular?: Array<{
    organisation?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
  }>;
  portfolio?: Array<{
    title?: string;
    url?: string;
    description?: string;
  }>;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

/** Build a block, layering supplied fields over the type's default content. */
function makeBlock(type: BlockType, fields: Record<string, string | string[]>): CVBlock {
  return {
    id: newId(),
    type,
    content: { ...DEFAULT_BLOCK_CONTENT[type], ...fields },
  };
}

/**
 * Convert an AI-generated CV payload into the editable block model used by the
 * Redux slice, templates, and editor. The output always contains the core
 * sections (personal info, summary, at least one work + education entry, and
 * skills) so the result is never an empty canvas; optional sections are only
 * added when the AI returned content for them.
 */
export function buildBlocksFromGenerated(data: GeneratedCV): CVBlock[] {
  const blocks: CVBlock[] = [];

  // 1. Personal info (always present — it's the CV header)
  const pi = data.personalInfo ?? {};
  blocks.push(
    makeBlock("personal_info", {
      name: asString(pi.name),
      email: asString(pi.email),
      phone: asString(pi.phone),
      location: asString(pi.location),
      linkedin: asString(pi.linkedin),
      website: asString(pi.website),
    })
  );

  // 2. Summary (always present)
  blocks.push(makeBlock("summary", { text: asString(data.summary) }));

  // 3. Work experience — one block per entry (fall back to an empty one)
  const work = data.workExperience?.length ? data.workExperience : [{}];
  for (const w of work) {
    blocks.push(
      makeBlock("work_experience", {
        company: asString(w.company),
        role: asString(w.role),
        startDate: asString(w.startDate),
        endDate: asString(w.endDate),
        current: "false",
        bullets: asStringArray(w.bullets),
      })
    );
  }

  // 4. Education — one block per entry (fall back to an empty one)
  const edu = data.education?.length ? data.education : [{}];
  for (const e of edu) {
    blocks.push(
      makeBlock("education", {
        institution: asString(e.institution),
        degree: asString(e.degree),
        field: asString(e.field),
        startDate: asString(e.startDate),
        endDate: asString(e.endDate),
        grade: asString(e.grade),
      })
    );
  }

  // 5. Skills (always present)
  blocks.push(makeBlock("skills", { items: asStringArray(data.skills) }));

  // 6. Certifications — optional, one block per named entry
  for (const c of data.certifications ?? []) {
    if (!asString(c.name)) continue;
    blocks.push(
      makeBlock("certifications", {
        name: asString(c.name),
        issuer: asString(c.issuer),
        date: asString(c.date),
        url: asString(c.url),
      })
    );
  }

  // 7. Achievements — optional, a single bullet block
  const achievements = asStringArray(data.achievements);
  if (achievements.length) {
    blocks.push(makeBlock("achievements", { bullets: achievements }));
  }

  // 8. Extracurricular — optional, one block per entry
  for (const x of data.extracurricular ?? []) {
    if (!asString(x.organisation) && !asString(x.role)) continue;
    blocks.push(
      makeBlock("extracurricular", {
        organisation: asString(x.organisation),
        role: asString(x.role),
        startDate: asString(x.startDate),
        endDate: asString(x.endDate),
        bullets: asStringArray(x.bullets),
      })
    );
  }

  // 9. Portfolio — optional, one block per entry
  for (const p of data.portfolio ?? []) {
    if (!asString(p.title)) continue;
    blocks.push(
      makeBlock("portfolio", {
        title: asString(p.title),
        url: asString(p.url),
        description: asString(p.description),
      })
    );
  }

  return blocks;
}
