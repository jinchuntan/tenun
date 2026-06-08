import type { UserProfile, CareerWeaveResult } from "./types";
import { clamp } from "./utils";

/**
 * University Career Bridge — candidate-side seed data + light inference.
 *
 * This is intentionally a thin, candidate-facing layer: it shows how a
 * university connects to the Career OS (readiness, campus opportunities, alumni
 * mentors, a skills bridge). It is NOT a university admin portal. All records
 * are mock/seed data structured so they can later be swapped for real
 * university-partner records without changing the UI.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface UniversityProfile {
  name: string;
  faculty: string;
  programme: string;
  graduationYear: string;
  careerCentre: string;
  /** e.g. "Student profile linked" / "Graduate profile linked". */
  verification: string;
  /** True when fields were inferred from the user's education string. */
  inferred: boolean;
}

export type UniversityOpportunityType =
  | "Internship"
  | "Graduate Programme"
  | "Career Fair"
  | "Campus Event"
  | "Scholarship"
  | "Hackathon";

export interface UniversityOpportunity {
  id: string;
  title: string;
  organization: string;
  type: UniversityOpportunityType;
  /** Human-readable deadline or date. */
  date: string;
  location: string;
  relevance: string;
  tags: string[];
}

export interface AlumniMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  university: string;
  expertise: string[];
  status: "Available" | "Limited" | "Busy";
}

export interface ReadinessMetric {
  key: string;
  label: string;
  /** 0–100. */
  value: number;
  hint: string;
}

export interface SkillsBridge {
  studied: string[];
  required: string[];
  gaps: string[];
}

// ── University profile inference (best-effort, falls back to mock) ───────────

const FALLBACK_UNIVERSITY: UniversityProfile = {
  name: "Universiti Teknologi Malaysia",
  faculty: "Faculty of Computing",
  programme: "BSc Computer Science",
  graduationYear: "2025",
  careerCentre: "Active — campus career centre connected",
  verification: "Student profile linked",
  inferred: false,
};

/** Map a detected field of study to a plausible faculty label. */
function facultyFor(programme: string): string {
  const t = programme.toLowerCase();
  if (/comput|software|information|data|it\b/.test(t)) return "Faculty of Computing";
  if (/engineer/.test(t)) return "Faculty of Engineering";
  if (/business|management|account|finance|economic/.test(t)) return "Faculty of Business & Management";
  if (/design|art|media|architect/.test(t)) return "Faculty of Built Environment & Design";
  if (/science|biolog|chemist|physic|environment/.test(t)) return "Faculty of Science";
  if (/law|legal/.test(t)) return "Faculty of Law";
  return "Faculty of Science & Technology";
}

/**
 * Infer a university profile from the free-text education string. Kept simple —
 * if matching is unreliable we fall back to mock data rather than guessing.
 */
export function inferUniversityProfile(profile: UserProfile): UniversityProfile {
  const edu = profile.education ?? "";
  if (!edu.trim()) return FALLBACK_UNIVERSITY;

  // University name: "University of X" or "X University/Universiti/Institute/College".
  const nameMatch =
    edu.match(/University of [A-Z][\w&.'-]*(?:\s[A-Z][\w&.'-]*)*/) ||
    edu.match(/[A-Z][\w&.'-]*(?:\s[A-Z][\w&.'-]*){0,3}\s(?:University|Universiti|Institute|College|Polytechnic)/);

  // Degree/programme: "BSc Computer Science", "Bachelor of ...", "Diploma in ...".
  const progMatch =
    edu.match(/\b(?:BSc|BA|BEng|B\.?Sc|B\.?A|BBA|Bachelor(?:'s)?(?: of| in)?|Master(?:'s)?(?: of| in)?|MSc|MBA|Diploma(?: in)?)\b[^.,;\n(]*/i);

  // Graduation year: first 4-digit 20xx near "expected"/"graduat" or anywhere.
  const yearMatch = edu.match(/(20\d{2})/);

  const programme = progMatch ? progMatch[0].replace(/\s+/g, " ").trim() : FALLBACK_UNIVERSITY.programme;
  const name = nameMatch ? nameMatch[0].trim() : FALLBACK_UNIVERSITY.name;
  const graduationYear = yearMatch ? yearMatch[1] : FALLBACK_UNIVERSITY.graduationYear;

  const nowYear = 2026; // app's reference "today" (see currentDate context)
  const gradNum = Number(graduationYear);
  const isStudent = Number.isFinite(gradNum) ? gradNum >= nowYear : true;

  return {
    name,
    faculty: facultyFor(programme),
    programme,
    graduationYear,
    careerCentre: "Active — campus career centre connected",
    verification: isStudent ? "Student profile linked" : "Graduate profile linked",
    inferred: !!(nameMatch || progMatch),
  };
}

// ── Career readiness snapshot (deterministic, explainable) ───────────────────

function has(profile: UserProfile, ...kw: string[]): boolean {
  const hay = `${profile.experience} ${profile.resumeText ?? ""}`.toLowerCase();
  return kw.some((k) => hay.includes(k.toLowerCase()));
}

/**
 * Simple, deterministic readiness scores derived from the profile + weave
 * result. No AI and no randomness — every number is explainable from inputs.
 */
export function computeReadiness(profile: UserProfile, result: CareerWeaveResult): ReadinessMetric[] {
  const skills = profile.skills ?? [];

  // Skills match: overlap between the recommended pathway's required skills and
  // what the candidate already lists.
  const recommended = result.pathways.find((p) => p.id === result.recommendedPathway);
  const required = recommended?.requiredSkills ?? [];
  const owned = new Set(skills.map((s) => s.toLowerCase()));
  const matched = required.filter((r) => owned.has(r.toLowerCase())).length;
  const skillsMatch = required.length ? Math.round((matched / required.length) * 100) : 55;

  const resumeLen = profile.resumeText?.length ?? 0;
  const cvReadiness = profile.resumeText ? clamp(58 + Math.min(Math.round(resumeLen / 45), 37)) : 38;

  const interviewReadiness = clamp(
    44 + (has(profile, "intern") ? 18 : 0) + Math.min(skills.length * 2, 18) + (has(profile, "led", "managed") ? 8 : 0)
  );

  const internshipReadiness = clamp(
    40 + (has(profile, "intern") ? 28 : 0) + (profile.experience.length > 150 ? 14 : 0)
  );

  const portfolioStrength = clamp(
    34 +
      (has(profile, "hackathon", "project", "won", "built") ? 26 : 0) +
      (owned.has("git") || owned.has("github") ? 12 : 0) +
      (owned.has("figma") ? 8 : 0) +
      Math.min(skills.length * 2, 14)
  );

  return [
    { key: "cv", label: "CV readiness", value: cvReadiness, hint: profile.resumeText ? "CV uploaded — keep refining impact statements." : "Upload your CV to boost this." },
    { key: "interview", label: "Interview readiness", value: interviewReadiness, hint: "Practise role-specific questions in Mock Interview." },
    { key: "skills", label: "Skills match", value: skillsMatch, hint: recommended ? `vs ${recommended.name}.` : "Pick a path to compare." },
    { key: "internship", label: "Internship readiness", value: internshipReadiness, hint: "Apply to campus internship programmes below." },
    { key: "portfolio", label: "Portfolio strength", value: portfolioStrength, hint: "Add a project that proves a target skill." },
  ];
}

// ── Skills bridge (university → market) ──────────────────────────────────────

/** A few illustrative subjects a programme typically covers. */
function studiedSubjectsFor(programme: string): string[] {
  const t = programme.toLowerCase();
  if (/comput|software|information|data|it\b/.test(t))
    return ["Programming Fundamentals", "Data Structures & Algorithms", "Databases", "Software Engineering"];
  if (/engineer/.test(t)) return ["Mathematics", "Systems Design", "Project Engineering", "Problem Solving"];
  if (/business|management|account|finance|economic/.test(t))
    return ["Management Principles", "Accounting", "Economics", "Business Communication"];
  if (/design|art|media/.test(t)) return ["Design Principles", "Visual Communication", "Prototyping", "User Research"];
  return ["Core Theory", "Research Methods", "Communication", "Critical Thinking"];
}

export function buildSkillsBridge(
  uni: UniversityProfile,
  result: CareerWeaveResult
): SkillsBridge {
  const recommended = result.pathways.find((p) => p.id === result.recommendedPathway);
  return {
    studied: studiedSubjectsFor(uni.programme),
    required: (recommended?.requiredSkills ?? []).slice(0, 6),
    gaps: result.skillGaps.slice(0, 5).map((g) => g.skill),
  };
}

// ── Seed: university-supported opportunities (clearly mock APAC/MY examples) ──

export const UNIVERSITY_OPPORTUNITIES: UniversityOpportunity[] = [
  {
    id: "uni-opp-1",
    title: "Maybank GO Ahead Challenge",
    organization: "Maybank",
    type: "Graduate Programme",
    date: "Applications close 30 Aug 2026",
    location: "Kuala Lumpur, MY",
    relevance: "Flagship graduate trainee track for analytics & strategy roles.",
    tags: ["Graduate", "Analytics", "Leadership"],
  },
  {
    id: "uni-opp-2",
    title: "Shopee Tech Internship",
    organization: "Shopee",
    type: "Internship",
    date: "Rolling intake — Jan & Jun 2026",
    location: "Singapore / Remote",
    relevance: "Hands-on software & data internship aligned to your tech path.",
    tags: ["Internship", "Software", "Data"],
  },
  {
    id: "uni-opp-3",
    title: "Campus Career Fair 2026",
    organization: "University Career Centre",
    type: "Career Fair",
    date: "12–13 Sep 2026",
    location: "On campus",
    relevance: "Meet 40+ employers hiring fresh graduates in tech & consulting.",
    tags: ["Networking", "Hiring"],
  },
  {
    id: "uni-opp-4",
    title: "Khazanah Watan Scholarship",
    organization: "Khazanah Nasional",
    type: "Scholarship",
    date: "Applications close 15 Oct 2026",
    location: "Malaysia",
    relevance: "Funding + structured upskilling for high-potential students.",
    tags: ["Scholarship", "Upskilling"],
  },
  {
    id: "uni-opp-5",
    title: "ImagineHack 2026",
    organization: "Taylor's University x APU",
    type: "Hackathon",
    date: "4–6 Jul 2026",
    location: "Kuala Lumpur, MY",
    relevance: "Build a portfolio project and meet employer judges.",
    tags: ["Hackathon", "Portfolio"],
  },
  {
    id: "uni-opp-6",
    title: "PETRONAS Tech Talk — Data & AI",
    organization: "PETRONAS Digital",
    type: "Campus Event",
    date: "21 Aug 2026",
    location: "On campus + livestream",
    relevance: "Employer campus event for students targeting data roles.",
    tags: ["Employer Event", "Data/AI"],
  },
];

// ── Seed: alumni / university-linked mentors ─────────────────────────────────

export const ALUMNI_MENTORS: AlumniMentor[] = [
  {
    id: "alumni-1",
    name: "Nadia Rahman",
    role: "Senior Product Manager",
    company: "Grab",
    university: "Class of 2018 · Computing",
    expertise: ["Product", "Analytics", "Career switching"],
    status: "Available",
  },
  {
    id: "alumni-2",
    name: "Wei Jie Tan",
    role: "Data Scientist",
    company: "AirAsia",
    university: "Class of 2020 · Computer Science",
    expertise: ["Machine Learning", "SQL", "Interviews"],
    status: "Limited",
  },
  {
    id: "alumni-3",
    name: "Priya Nair",
    role: "Management Consultant",
    company: "Accenture",
    university: "Class of 2019 · Business Analytics",
    expertise: ["Consulting", "Case prep", "Storytelling"],
    status: "Available",
  },
  {
    id: "alumni-4",
    name: "Daniel Lee",
    role: "Software Engineer",
    company: "Setel (PETRONAS)",
    university: "Class of 2021 · Software Engineering",
    expertise: ["Backend", "System design", "Portfolio review"],
    status: "Busy",
  },
];

// ── Seed: "For Universities" teaser bullets ──────────────────────────────────

export const UNIVERSITY_PARTNER_BENEFITS: string[] = [
  "Track graduate outcomes and employability in real time",
  "Spot curriculum-to-market skills gaps across cohorts",
  "Connect students to verified internships and employers",
  "Power alumni mentoring and campus career events",
  "Build measurable employer partnerships",
];
