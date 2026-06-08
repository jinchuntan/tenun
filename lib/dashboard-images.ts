/**
 * Centralised mapping between dashboard data (career archetypes, pathways) and
 * the mascot logo images that live in `public/images`.
 *
 * Keeping the mapping here (rather than hardcoded inside JSX) means the visual
 * assets can be swapped or remapped in one place without touching components.
 *
 * Files: public/images/logo1.png … logo8.png
 *   logo1–logo5 → pathway rows
 *   logo6–logo8 → summary archetype illustration
 */

const IMAGE_BASE = "/images";

// ── Pathway illustrations (logo1 – logo5) ──

const PATHWAY_LOGO_BY_ID: Record<string, string> = {
  "stable-growth": "logo1",
  "startup-builder": "logo2",
  "skill-pivot": "logo3",
  "high-salary": "logo4",
  "leadership": "logo5",
};

// Fallback by display name in case ids ever change.
const PATHWAY_LOGO_BY_NAME: Record<string, string> = {
  "Stable Growth Path": "logo1",
  "Startup / Builder Path": "logo2",
  "Skill Pivot Path": "logo3",
  "High Salary Path": "logo4",
  "Leadership Path": "logo5",
};

/** Returns the public path to the illustration for a pathway. */
export function getPathwayImage(pathway: { id: string; name: string }): string {
  const logo =
    PATHWAY_LOGO_BY_ID[pathway.id] ??
    PATHWAY_LOGO_BY_NAME[pathway.name] ??
    "logo1";
  return `${IMAGE_BASE}/${logo}.png`;
}

// ── Summary archetype illustration (logo6 – logo8) ──

/**
 * Maps a career archetype title to a mascot illustration.
 *
 *   Generalist / Specialist            → logo6
 *   Builder / Technologist             → logo7
 *   Connector / Change Maker / Orchestrator → logo8
 */
const ARCHETYPE_LOGO_BY_TITLE: Record<string, string> = {
  "The Generalist": "logo6",
  "The Specialist": "logo6",
  "The Builder": "logo7",
  "The Technologist": "logo7",
  "The Connector": "logo8",
  "The Change Maker": "logo8",
  "The Orchestrator": "logo8",
};

/** Returns the public path to the illustration for an archetype. */
export function getArchetypeImage(archetype: { title: string }): string {
  const logo = ARCHETYPE_LOGO_BY_TITLE[archetype.title] ?? "logo6";
  return `${IMAGE_BASE}/${logo}.png`;
}
