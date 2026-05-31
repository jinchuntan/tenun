import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number within [min, max]. Used by all scoring engines. */
export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Score overlap between a user's set and a candidate set.
 * Returns 0–1 (proportion of candidateSet items present in userSet).
 */
export function scoreOverlap(userSet: string[], candidateSet: string[]): number {
  if (!candidateSet.length) return 0;
  const lower = userSet.map((x) => x.toLowerCase());
  return (
    candidateSet.filter((c) => lower.includes(c.toLowerCase())).length /
    candidateSet.length
  );
}

/** Convert a job title to a URL-safe slug. e.g. "UX Designer" → "ux-designer" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
