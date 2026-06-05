/**
 * Portfolio / project evidence — structured proof of work that a candidate can
 * feed into the CV Generator. Especially useful for design and project-based
 * students whose visual portfolios (Canva / Figma / Adobe exports) often have no
 * extractable text. Evidence is captured as structured fields instead, so the AI
 * can write truthful CV bullets without needing to read the file.
 */
export interface PortfolioEvidence {
  id: string;
  title: string;
  description: string;
  role?: string;
  tools?: string[];
  outcome?: string;
  url?: string;
  /** Where this item came from. */
  source?: "manual" | "upload" | "career_weave";
  /** Text pulled from a supporting file, when extraction succeeded. */
  extractedText?: string;
  fileName?: string;
  fileType?: string;
}

/** Stable ID for a new evidence item (browser secure context / Node 16.7+). */
export function newEvidenceId(): string {
  return crypto.randomUUID();
}

/** Create an empty manual evidence item ready for editing. */
export function emptyEvidence(): PortfolioEvidence {
  return {
    id: newEvidenceId(),
    title: "",
    description: "",
    role: "",
    tools: [],
    outcome: "",
    url: "",
    source: "manual",
  };
}

/** True when an item has enough content to be worth sending to the AI. */
export function hasUsefulEvidence(item: PortfolioEvidence): boolean {
  return Boolean(
    item.title.trim() ||
      item.description.trim() ||
      item.url?.trim() ||
      item.outcome?.trim() ||
      (item.tools && item.tools.length > 0) ||
      item.extractedText?.trim()
  );
}
