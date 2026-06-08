import type { Locale } from "./i18n";
import type {
  UserProfile,
  CareerArchetype,
  CareerThread,
  PathwayCard,
  SkillGap,
} from "./types";

/**
 * Shared contracts for the AI personalization LAYER.
 *
 * Important: everything here is an EXPLANATION/RANKING/DRAFTING layer that sits
 * on top of the deterministic career engine + seed data. The structured data
 * (archetype, pathways, skill gaps, courses, mentors, opportunities, atlas)
 * remains the source of truth. If any AI call fails, callers fall back to the
 * deterministic content and the dashboard keeps working.
 */

// ── Response shapes ─────────────────────────────────────────────────────────

export interface ThirtyDayAction {
  title: string;
  reason: string;
  timeframe: string;
}

export interface DashboardPersonalization {
  personalizedSummary: string;
  whyThisArchetypeFits: string;
  topStrengths: string[];
  topRisks: string[];
  recommendedPathExplanation: string;
  thirtyDayActions: ThirtyDayAction[];
  confidenceNote: string;
}

export interface PathwayExplanation {
  whyFits: string;
  whatsDifficult: string;
  howToTest30Days: string;
}

export interface SkillGapExplanation {
  skill: string;
  whyItMatters: string;
  whatToBuild: string;
  urgency: string;
}

export type OutreachAIResult = {
  subject?: string;
  body: string;
};

// ── Slim request payloads (keep tokens small, send only what's needed) ───────

function slimProfile(p: UserProfile) {
  return {
    name: p.name,
    currentRole: p.currentRole,
    education: p.education?.slice(0, 200),
    experience: p.experience?.slice(0, 600),
    skills: p.skills?.slice(0, 25) ?? [],
    interests: p.interests?.slice(0, 12) ?? [],
    preferredIndustries: p.preferredIndustries?.slice(0, 8) ?? [],
    salaryExpectation: p.salaryExpectation,
    riskAppetite: p.riskAppetite,
    lifestylePreference: p.lifestylePreference,
    locationPreference: p.locationPreference,
    hasResume: !!p.resumeText,
  };
}

function slimPathway(p: PathwayCard) {
  return {
    id: p.id,
    name: p.name,
    timeline: p.timeline,
    description: p.description,
    requiredSkills: p.requiredSkills,
    tradeoffs: p.tradeoffs,
    risks: p.risks,
  };
}

// ── Cache key (fingerprint) ─────────────────────────────────────────────────

/**
 * Stable fingerprint of the inputs that affect the personalized summary.
 * Changes only when the profile or target job changes, so we can cache the
 * summary in sessionStorage across tab switches.
 */
export function personalizationFingerprint(profile: UserProfile, targetJob?: string): string {
  const parts = [
    profile.name,
    profile.currentRole,
    (profile.skills ?? []).join(","),
    (profile.interests ?? []).join(","),
    profile.experience?.length ?? 0,
    profile.riskAppetite,
    profile.lifestylePreference,
    targetJob ?? "",
  ];
  // djb2 — small, deterministic, no crypto needed (this is just a cache key).
  let hash = 5381;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  return `tenun-ai-summary:${(hash >>> 0).toString(36)}`;
}

export function readCachedSummary(key: string): DashboardPersonalization | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as DashboardPersonalization) : null;
  } catch {
    return null;
  }
}

export function writeCachedSummary(key: string, value: DashboardPersonalization): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sessionStorage unavailable / full — caching is best-effort */
  }
}

// ── Client fetchers (return null on any failure so callers can fall back) ────

async function postJSON<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as T;
  } catch {
    return null;
  }
}

export async function fetchDashboardSummary(input: {
  profile: UserProfile;
  archetype: CareerArchetype;
  threads: CareerThread[];
  pathways: PathwayCard[];
  recommendedPathway: string;
  skillGaps: SkillGap[];
  targetJob?: string;
  locale: Locale;
}): Promise<DashboardPersonalization | null> {
  const recommended = input.pathways.find((p) => p.id === input.recommendedPathway);
  return postJSON<DashboardPersonalization>("/api/personalize-dashboard-summary", {
    profile: slimProfile(input.profile),
    archetype: {
      title: input.archetype.title,
      tagline: input.archetype.tagline,
      strengths: input.archetype.strengths,
      growthAreas: input.archetype.growthAreas,
      keywords: input.archetype.keywords,
    },
    threads: input.threads.map((t) => ({ name: t.name, score: t.score, contextLabel: t.contextLabel })),
    pathways: input.pathways.map((p) => ({ id: p.id, name: p.name, score: p.score })),
    recommendedPathway: recommended
      ? slimPathway(recommended)
      : { id: input.recommendedPathway, name: input.recommendedPathway },
    skillGaps: input.skillGaps.map((g) => ({ skill: g.skill, priority: g.priority })),
    targetJob: input.targetJob,
    locale: input.locale,
  });
}

export async function fetchPathwayExplanation(input: {
  profile: UserProfile;
  pathway: PathwayCard;
  targetJob?: string;
  locale: Locale;
}): Promise<PathwayExplanation | null> {
  return postJSON<PathwayExplanation>("/api/personalize-pathway", {
    profile: slimProfile(input.profile),
    pathway: slimPathway(input.pathway),
    targetJob: input.targetJob,
    locale: input.locale,
  });
}

export async function fetchSkillGapExplanations(input: {
  profile: UserProfile;
  pathwayName: string;
  skillGaps: SkillGap[];
  targetJob?: string;
  locale: Locale;
}): Promise<SkillGapExplanation[] | null> {
  const res = await postJSON<{ explanations: SkillGapExplanation[] }>(
    "/api/personalize-skill-gaps",
    {
      profile: slimProfile(input.profile),
      pathwayName: input.pathwayName,
      skillGaps: input.skillGaps.map((g) => ({ skill: g.skill, priority: g.priority })),
      targetJob: input.targetJob,
      locale: input.locale,
    }
  );
  return res?.explanations ?? null;
}

export async function fetchOutreachDraft(input: {
  profile: UserProfile;
  messageType: string;
  pathwayName?: string;
  targetRole?: string;
  targetCompany?: string;
  recipientContext?: string;
  skillGaps: string[];
  resumeText?: string;
  baseDraft?: { subject?: string; body: string };
  locale: Locale;
}): Promise<OutreachAIResult | null> {
  return postJSON<OutreachAIResult>("/api/personalize-outreach", {
    profile: slimProfile(input.profile),
    messageType: input.messageType,
    pathwayName: input.pathwayName,
    targetRole: input.targetRole,
    targetCompany: input.targetCompany,
    recipientContext: input.recipientContext,
    skillGaps: input.skillGaps.slice(0, 8),
    // Resume text is grounding evidence — trimmed to keep tokens reasonable.
    resumeText: input.resumeText?.slice(0, 2500),
    baseDraft: input.baseDraft,
    locale: input.locale,
  });
}
