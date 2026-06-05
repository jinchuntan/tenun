import type { PortfolioEvidence } from "./portfolio-types";
import { newEvidenceId } from "./portfolio-types";
import type { UserProfile } from "./types";

/**
 * Lightweight client-side store for portfolio / project evidence.
 *
 * For this pass the data lives in localStorage (so it survives a refresh and can
 * be reused across the CV flow). It is deliberately isolated behind this module
 * so it can later be swapped for the Supabase `portfolio_items` table
 * (see supabase/migrations/20260606_portfolio_items.sql) without touching the UI.
 */

const STORAGE_KEY = "tenun-portfolio-evidence";
const PROFILE_KEY = "tenun-profile"; // where the Career Weave profile is cached

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Load all saved portfolio evidence items. */
export function loadEvidence(): PortfolioEvidence[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PortfolioEvidence[]) : [];
  } catch {
    return [];
  }
}

/** Persist the full list of portfolio evidence items. */
export function saveEvidence(items: PortfolioEvidence[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

function readProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    // The profile is cached in sessionStorage by the profile/dashboard flow.
    const raw =
      window.sessionStorage.getItem(PROFILE_KEY) ||
      window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

/**
 * Derive portfolio/project evidence from the user's existing Career Weave /
 * profile data (their saved experience text and skills). Returns an empty array
 * when there is nothing useful to pull. These items are NOT yet persisted — the
 * user chooses which to include in the CV Generator.
 */
export function getCareerWeaveEvidence(): PortfolioEvidence[] {
  const profile = readProfile();
  if (!profile) return [];

  const items: PortfolioEvidence[] = [];
  const experience = profile.experience?.trim();
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [];

  if (experience) {
    items.push({
      id: newEvidenceId(),
      title: "Experience & projects (from your profile)",
      description: experience.slice(0, 1500),
      role: profile.currentRole?.trim() || "",
      tools: skills.slice(0, 12),
      outcome: "",
      url: "",
      source: "career_weave",
    });
  }

  return items;
}

/** Whether any Career Weave data exists to offer the "use my profile" option. */
export function hasCareerWeaveData(): boolean {
  const profile = readProfile();
  return Boolean(profile?.experience?.trim() || (profile?.skills && profile.skills.length > 0));
}
