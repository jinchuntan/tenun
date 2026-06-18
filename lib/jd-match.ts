// ─────────────────────────────────────────────────────────────────────────────
// JD ↔ candidate skill matching.
//
// Shared, deterministic helpers behind the side-by-side Compare view: which
// JD skills a candidate has evidence for, and which of their projects prove
// skills the role is hiring for. NO numeric scores — only met / not-shown.
// ─────────────────────────────────────────────────────────────────────────────

import type { CandidateProject, EmployerCandidate } from "@/lib/employer-candidates";
import type { EmployerRole } from "@/lib/employer-roles";

/** Loose, case-insensitive skill equivalence (e.g. "Node" ↔ "Node.js"). */
export function skillMatch(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x.includes(y) || y.includes(x);
}

/** Does the candidate have this JD skill, and which project best proves it? */
export function evaluateSkill(skill: string, candidate: EmployerCandidate): {
  met: boolean;
  project: CandidateProject | null;
} {
  const declared =
    candidate.skills.some((s) => skillMatch(s, skill)) ||
    candidate.tools.some((s) => skillMatch(s, skill));
  const project = candidate.projects.find((p) => p.skills.some((s) => skillMatch(s, skill))) ?? null;
  return { met: declared || !!project, project };
}

/** All JD skills (must-have first, then nice-to-have). */
export function jdSkills(role: EmployerRole): string[] {
  return [...role.mustHaveSkills, ...role.niceToHaveSkills];
}

/** Does a candidate skill match anything the role is hiring for? */
export function skillFitsRole(skill: string, role: EmployerRole): boolean {
  return jdSkills(role).some((j) => skillMatch(j, skill));
}

/** How many of the role's must-have skills the candidate can evidence. */
export function mustHaveMet(role: EmployerRole, candidate: EmployerCandidate): number {
  return role.mustHaveSkills.filter((s) => evaluateSkill(s, candidate).met).length;
}

export interface ProjectFit {
  project: CandidateProject;
  /** The role's skills this project proves (deduped, JD-labelled). */
  proves: string[];
}

/** Candidate projects that prove at least one of the role's skills. */
export function matchingProjects(role: EmployerRole, candidate: EmployerCandidate): ProjectFit[] {
  const skills = jdSkills(role);
  return candidate.projects
    .map((project) => ({
      project,
      proves: skills.filter((j) => project.skills.some((s) => skillMatch(s, j))),
    }))
    .filter((p) => p.proves.length > 0);
}

/** Evidence-backed candidate skills the JD does NOT ask for ("also brings"). */
export function extraSkills(role: EmployerRole, candidate: EmployerCandidate): string[] {
  return candidate.skills.filter((s) => !skillFitsRole(s, role));
}
