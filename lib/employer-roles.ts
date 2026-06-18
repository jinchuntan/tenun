// ─────────────────────────────────────────────────────────────────────────────
// Employer-posted roles (the structured JD).
//
// These drive the Best-fit candidates view and the JD-vs-candidate Compare.
// Persisted client-side (localStorage) for the prototype; a Supabase `roles`
// table + RLS exists in migrations for when the backend is wired in.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_LEVELS = ["Internship", "Entry", "Mid", "Senior"] as const;
export type RoleLevel = (typeof ROLE_LEVELS)[number];

export const WORK_MODES = ["On-site", "Hybrid", "Remote"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const ROLE_STAGES = ["Posted", "Reviewing", "Contacted", "Interviewing"] as const;
export type RoleStage = (typeof ROLE_STAGES)[number];

export interface EmployerRole {
  id: string;
  title: string;
  level: RoleLevel;
  location: string;
  workMode: WorkMode;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  context: string;
  stage: RoleStage;
  createdAt: string;
}

/** Fields the user fills in; the rest is derived on create. */
export type RoleDraft = Omit<EmployerRole, "id" | "createdAt" | "stage"> & {
  stage?: RoleStage;
};

export function newRoleId(): string {
  return `role-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** A search query string derived from a role, for the candidate ranker. */
export function roleToQuery(role: EmployerRole): string {
  return [role.title, ...role.mustHaveSkills, ...role.niceToHaveSkills].join(" ");
}

/** Human-readable salary band. */
export function salaryLabel(role: EmployerRole): string | null {
  const fmt = (n: number) => `RM ${n.toLocaleString()}`;
  if (role.salaryMin && role.salaryMax) return `${fmt(role.salaryMin)} – ${fmt(role.salaryMax)}`;
  if (role.salaryMin) return `From ${fmt(role.salaryMin)}`;
  if (role.salaryMax) return `Up to ${fmt(role.salaryMax)}`;
  return null;
}
