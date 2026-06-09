import type { UserProfile } from "./types";

/**
 * Profile-wizard form data model.
 *
 * `UserProfile` (see ./types) is the DASHBOARD-facing model. The onboarding
 * wizard collects everything `UserProfile` needs plus several wizard-only
 * fields (contact number, email, description, structured education/experience
 * rows, working style, availability, location chips). This module owns those
 * extra fields and the helpers that translate between the two layers, so the
 * page component stays thin and the mapping lives in one place.
 *
 * ── Data-honesty contract ───────────────────────────────────────────────────
 * Two very different sources feed this form:
 *
 *   1. DEMO data  — may be COMPLETE and FICTIONAL. `getAishaDemoFormData()` is
 *      free to fill every field so the wizard looks fully populated.
 *   2. PARSED CV  — must be EVIDENCE-BASED. The AI parser (see
 *      app/api/parse-resume/route.ts) returns "" / [] for anything the CV does
 *      not clearly state and must NEVER invent missing facts. The form keeps
 *      those fields empty and surfaces them via `getMissingImportantFields()`.
 *
 * Never blur the two: do not backfill parsed gaps with demo-style defaults.
 */

// ── Structured sub-entries (shared by the wizard + the CV parser) ────────────
export interface EducationEntry {
  school: string;
  fieldOfStudy: string;
  qualification: string;
  startYear: string;
  endYear: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  description: string;
  startYear: string;
  endYear: string;
}

export type WorkingStyle = "Hybrid" | "Remote" | "On-site";
export const WORKING_STYLES: WorkingStyle[] = ["Hybrid", "Remote", "On-site"];

/** Full wizard state — a superset of `UserProfile`. */
export interface ProfileFormData {
  // Step 1 — Basic info
  name: string;
  contactNumber: string;
  email: string;
  currentRole: string;
  description: string;
  // Step 2 — Education & experience (structured rows)
  education: EducationEntry[];
  experience: ExperienceEntry[];
  // Step 3 — Skills & interests
  skills: string[];
  interests: string[];
  // Step 4 — Preferences
  preferredIndustries: string[];
  salaryExpectation: string;
  workingStyle: WorkingStyle;
  availabilityYear: string;
  availabilityMonth: string;
  riskAppetite: UserProfile["riskAppetite"];
  lifestylePreference: UserProfile["lifestylePreference"];
  locations: string[];
  // Source CV text (when uploaded)
  resumeText: string;
}

/**
 * Shape the AI CV parser returns for the wizard (the `form` field of
 * /api/parse-resume). EVIDENCE-BASED ONLY — every field is "" / [] when the CV
 * does not clearly contain it. The client merges this into existing form state
 * without ever overwriting what the user already typed.
 */
export interface ParsedProfileFormData {
  name: string;
  email: string;
  contactNumber: string;
  currentRole: string;
  description: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  interests: string[];
  preferredIndustries: string[];
  locationPreference: string;
  salaryExpectation: string;
  availabilityYear: string;
  availabilityMonth: string;
  workingStyle: string;
  resumeText: string;
}

// ── Empty factories ──────────────────────────────────────────────────────────
export const emptyEducationEntry = (): EducationEntry => ({
  school: "", fieldOfStudy: "", qualification: "", startYear: "", endYear: "",
});

export const emptyExperienceEntry = (): ExperienceEntry => ({
  company: "", role: "", description: "", startYear: "", endYear: "",
});

export const emptyProfileForm = (): ProfileFormData => ({
  name: "",
  contactNumber: "",
  email: "",
  currentRole: "",
  description: "",
  education: [emptyEducationEntry()],
  experience: [emptyExperienceEntry()],
  skills: [],
  interests: [],
  preferredIndustries: [],
  salaryExpectation: "",
  workingStyle: "Hybrid",
  availabilityYear: "",
  availabilityMonth: "",
  riskAppetite: "medium",
  lifestylePreference: "flexibility",
  locations: [],
  resumeText: "",
});

// ── Small predicates / utilities ─────────────────────────────────────────────
const isEducationEmpty = (e: EducationEntry): boolean =>
  !e.school && !e.fieldOfStudy && !e.qualification && !e.startYear && !e.endYear;

const isExperienceEmpty = (e: ExperienceEntry): boolean =>
  !e.company && !e.role && !e.description && !e.startYear && !e.endYear;

const isWorkingStyle = (s: string): s is WorkingStyle =>
  (WORKING_STYLES as string[]).includes(s);

/** Split a free-text location string ("KL, Singapore, or Remote") into chips. */
export function splitLocations(value: string): string[] {
  return value
    .split(/,|;|\/|•|\bor\b/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Form → dashboard (UserProfile) ───────────────────────────────────────────
/** Serialize structured education rows into the dashboard's single string. */
export function educationEntriesToString(entries: EducationEntry[]): string {
  return entries
    .filter((e) => e.school)
    .map((e) =>
      [
        e.school,
        e.fieldOfStudy,
        e.qualification,
        e.startYear && `${e.startYear}–${e.endYear || "present"}`,
      ]
        .filter(Boolean)
        .join(", ")
    )
    .join("\n");
}

/** Serialize structured experience rows into the dashboard's single string. */
export function experienceEntriesToString(entries: ExperienceEntry[]): string {
  return entries
    .filter((e) => e.company)
    .map((e) =>
      [
        e.role && e.company ? `${e.role} at ${e.company}` : e.company,
        e.description,
        e.startYear && `${e.startYear}–${e.endYear || "present"}`,
      ]
        .filter(Boolean)
        .join(", ")
    )
    .join("\n");
}

/**
 * Convert the wizard form into the dashboard-facing `UserProfile`. This is what
 * gets stored as `tenun-profile` on submit and what the dashboard consumes.
 */
export function profileFormToUserProfile(form: ProfileFormData): UserProfile {
  return {
    name: form.name,
    currentRole: form.currentRole,
    education: educationEntriesToString(form.education),
    experience: experienceEntriesToString(form.experience),
    skills: form.skills,
    interests: form.interests,
    preferredIndustries: form.preferredIndustries,
    salaryExpectation: form.salaryExpectation,
    riskAppetite: form.riskAppetite,
    lifestylePreference: form.lifestylePreference,
    locationPreference: form.locations.join(", "),
    resumeText: form.resumeText,
  };
}

// ── Stored UserProfile → form (round-trip hydration) ─────────────────────────
/**
 * Map a stored `UserProfile` back onto the form's scalar/array fields when the
 * user returns to the wizard. Education/experience are kept as the dashboard
 * strings only (we don't reconstruct structured rows from prose), so those
 * placeholder rows stay empty rather than guessing.
 */
export function userProfileToFormPartial(
  p: Partial<UserProfile>
): Partial<ProfileFormData> {
  const partial: Partial<ProfileFormData> = {};
  if (p.name) partial.name = p.name;
  if (p.currentRole) partial.currentRole = p.currentRole;
  if (p.skills?.length) partial.skills = p.skills;
  if (p.interests?.length) partial.interests = p.interests;
  if (p.preferredIndustries?.length) partial.preferredIndustries = p.preferredIndustries;
  if (p.salaryExpectation) partial.salaryExpectation = p.salaryExpectation;
  if (p.riskAppetite) partial.riskAppetite = p.riskAppetite;
  if (p.lifestylePreference) partial.lifestylePreference = p.lifestylePreference;
  if (p.locationPreference) partial.locations = splitLocations(p.locationPreference);
  if (p.resumeText) partial.resumeText = p.resumeText;
  return partial;
}

// ── Parsed CV → form (evidence-based merge) ──────────────────────────────────
/**
 * Merge AI-parsed CV data into the current form. Rules:
 *  - Only fills fields that are still empty — never overwrites the user's input.
 *  - Only uses evidence the parser actually returned. Missing parsed fields
 *    ("" / []) are left untouched, so the form stays honest. NO invented values.
 *  - Skills / interests / industries are unioned (deduped) with what's there.
 */
export function applyParsedProfileToForm(
  parsed: Partial<ParsedProfileFormData>,
  current: ProfileFormData
): ProfileFormData {
  const next: ProfileFormData = { ...current };

  if (parsed.name && !current.name) next.name = parsed.name;
  if (parsed.email && !current.email) next.email = parsed.email;
  if (parsed.contactNumber && !current.contactNumber) next.contactNumber = parsed.contactNumber;
  if (parsed.currentRole && !current.currentRole) next.currentRole = parsed.currentRole;
  if (parsed.description && !current.description) next.description = parsed.description;

  // Structured rows: keep any the user already filled, then append real parsed
  // rows (drop blank parser rows so we never add empty cards).
  if (parsed.education?.length) {
    const real = parsed.education.filter((e) => !isEducationEmpty(e));
    if (real.length) {
      const existing = current.education.filter((e) => !isEducationEmpty(e));
      next.education = [...existing, ...real];
    }
  }
  if (parsed.experience?.length) {
    const real = parsed.experience.filter((e) => !isExperienceEmpty(e));
    if (real.length) {
      const existing = current.experience.filter((e) => !isExperienceEmpty(e));
      next.experience = [...existing, ...real];
    }
  }

  if (parsed.skills?.length)
    next.skills = [...new Set([...current.skills, ...parsed.skills])];
  if (parsed.interests?.length)
    next.interests = [...new Set([...current.interests, ...parsed.interests])];
  if (parsed.preferredIndustries?.length)
    next.preferredIndustries = [
      ...new Set([...current.preferredIndustries, ...parsed.preferredIndustries]),
    ];

  if (parsed.locationPreference && current.locations.length === 0)
    next.locations = splitLocations(parsed.locationPreference);
  if (parsed.salaryExpectation && !current.salaryExpectation)
    next.salaryExpectation = parsed.salaryExpectation;
  if (parsed.availabilityYear && !current.availabilityYear)
    next.availabilityYear = parsed.availabilityYear;
  if (parsed.availabilityMonth && !current.availabilityMonth)
    next.availabilityMonth = parsed.availabilityMonth;
  if (parsed.workingStyle && isWorkingStyle(parsed.workingStyle))
    next.workingStyle = parsed.workingStyle;

  if (parsed.resumeText) next.resumeText = parsed.resumeText;

  return next;
}

/**
 * Important fields that a CV often omits. After a real CV parse we ask the user
 * to fill whichever of these are still blank — instead of silently leaving the
 * form half-empty or (worse) inventing values.
 */
const MISSING_FIELD_CHECKS: { label: string; isMissing: (f: ProfileFormData) => boolean }[] = [
  { label: "Contact number", isMissing: (f) => !f.contactNumber.trim() },
  { label: "Email", isMissing: (f) => !f.email.trim() },
  { label: "Availability", isMissing: (f) => !f.availabilityYear.trim() && !f.availabilityMonth.trim() },
  { label: "Salary expectation", isMissing: (f) => !f.salaryExpectation.trim() },
  { label: "Preferred locations", isMissing: (f) => f.locations.length === 0 },
];

/** Human-readable labels of important fields still empty after a CV parse. */
export function getMissingImportantFields(form: ProfileFormData): string[] {
  return MISSING_FIELD_CHECKS.filter((c) => c.isMissing(form)).map((c) => c.label);
}

// ── Demo data (COMPLETE + FICTIONAL — see data-honesty contract above) ───────
/**
 * Aisha Lim — the single source of truth for the "Load demo profile" button.
 * Unlike parsed CV data, this is allowed to fill EVERY field so the wizard
 * looks fully populated. `lib/demo-data.ts` derives the dashboard `UserProfile`
 * from this via `profileFormToUserProfile`, so there is no duplicate Aisha data.
 */
export function getAishaDemoFormData(): ProfileFormData {
  return {
    name: "Aisha Lim",
    contactNumber: "12-345 6789",
    email: "aisha.lim@example.com",
    currentRole: "Final-year Computer Science Student",
    description:
      "Final-year Computer Science student at the University of Melbourne with a strong interest in product and data. I interned on an ESG reporting dashboard in climate tech, lead student consulting and climate-action initiatives, and enjoy turning messy problems into clear, data-driven products. Active hackathon participant — 2nd place at GreenHack 2024.",
    education: [
      {
        school: "University of Melbourne",
        fieldOfStudy: "Computer Science",
        qualification: "BSc Computer Science",
        startYear: "2022",
        endYear: "2025",
      },
    ],
    experience: [
      {
        company: "Deloitte",
        role: "Data Analytics Intern",
        description:
          "Built interactive Tableau dashboards for ESG compliance reporting and analysed 50,000+ data points to surface sustainability trends.",
        startYear: "2024",
        endYear: "2024",
      },
      {
        company: "University Consulting Club",
        role: "Strategy Consultant (Pro Bono)",
        description:
          "Led a 5-person team advising a climate-tech startup on go-to-market strategy across APAC.",
        startYear: "2023",
        endYear: "2023",
      },
      {
        company: "Youth Climate Action Network",
        role: "Volunteer Coordinator",
        description:
          "Organised 12+ workshops and community events; managed social media reaching 5,000+ followers.",
        startYear: "2022",
        endYear: "",
      },
      {
        company: "GreenHack 2024",
        role: "Project Lead — Carbon Footprint Tracker (2nd Place)",
        description:
          "Built a carbon footprint tracker app in Python and React; designed the user flows and data-visualisation components.",
        startYear: "2024",
        endYear: "2024",
      },
    ],
    skills: [
      "Python", "SQL", "Tableau", "Figma", "Git", "React",
      "Agile", "Public Speaking", "Research", "Project Management",
      "Data Visualization",
    ],
    interests: [
      "Product Management", "Climate Technology", "Data Analytics",
      "Social Impact", "UX Research",
    ],
    preferredIndustries: ["Technology", "Climate Tech", "Consulting", "Social Enterprise"],
    salaryExpectation: "AUD $70,000 - $90,000",
    workingStyle: "Hybrid",
    availabilityYear: "2025",
    availabilityMonth: "July",
    riskAppetite: "medium",
    lifestylePreference: "flexibility",
    locations: ["Melbourne", "Sydney", "Singapore", "Remote"],
    resumeText: `AISHA LIM
Final-year Computer Science Student | Aspiring Product Manager & Data Analyst

EDUCATION
BSc Computer Science, University of Melbourne (Expected 2025)
Minor in Environmental Studies | Dean's List 2023 | GPA: 3.7/4.0

EXPERIENCE
Data Analytics Intern — Deloitte, Melbourne (Jan 2024 – Jun 2024)
• Built interactive Tableau dashboards for ESG compliance reporting
• Analyzed 50,000+ data points to identify sustainability trends
• Collaborated with senior consultants on client deliverables

Strategy Consultant (Pro Bono) — University Consulting Club (Mar 2023 – Nov 2023)
• Led a 5-person team advising a climate-tech startup on go-to-market strategy
• Conducted market research and competitive analysis across APAC region
• Presented findings to founding team and university board

PROJECTS & COMPETITIONS
GreenHack 2024 — 2nd Place
• Built a carbon footprint tracker app using Python and React
• Designed user flows and data visualization components

Youth Climate Action Network — Volunteer Coordinator (2022 – Present)
• Organized 12+ workshops and community events
• Managed social media presence reaching 5,000+ followers

SKILLS
Technical: Python, SQL, Tableau, Figma, Git, React (basic), Agile
Soft: Public Speaking, Research, Project Management, Team Leadership

INTERESTS
Product Management, Climate Technology, Data Analytics, Social Impact, UX Research`,
  };
}

/** Aisha as a dashboard `UserProfile` (derived from the demo form data). */
export function demoFormDataToUserProfile(): UserProfile {
  return profileFormToUserProfile(getAishaDemoFormData());
}
