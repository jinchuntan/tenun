import type { UserProfile } from "./types";
import { demoProfile } from "./demo-data";

/**
 * Demo persona system.
 *
 * A small, typed set of `UserProfile` fixtures that exercise different parts of
 * the Weaver dashboard (Summary, Paths, Skills, Universities, Atlas, Mentors,
 * Outreach, CV, Interview). Used by `/dashboard?demo=<id>` and the Playwright
 * smoke tests — all deterministic, no AI/Supabase required.
 *
 * Backward compatibility: the original `demoProfile` (Aisha Lim) is preserved as
 * the "generalist" persona, so `/dashboard?demo=true` behaves exactly as before.
 */

export type DemoProfileId =
  | "generalist"
  | "technologist"
  | "creative"
  | "builder"
  | "climate"
  | "university"
  | "minimal";

// 1. Generalist — the existing demo profile (broad, multi-interest).
const generalist: UserProfile = demoProfile;

// 2. Technologist — strong software/data/technical profile.
const technologist: UserProfile = {
  name: "Arjun Mehta",
  currentRole: "Software Engineer (2 yrs)",
  education: "BSc Computer Science, Universiti Malaya (2022). First Class Honours.",
  experience:
    "Software Engineer at a fintech scale-up (2 years) — built and shipped REST + GraphQL APIs in Node.js and Python, owned a payments microservice on AWS, and cut p95 latency by 40%. Migrated CI/CD to GitHub Actions and Docker. Mentored 2 junior engineers. Open-source contributor with an active GitHub portfolio.",
  skills: [
    "Python", "SQL", "JavaScript", "TypeScript", "React", "Node.js",
    "Git", "Docker", "AWS", "GraphQL", "PostgreSQL", "CI/CD",
  ],
  interests: ["Backend Engineering", "Cloud Infrastructure", "Machine Learning", "Developer Tools"],
  preferredIndustries: ["Technology", "Fintech", "SaaS"],
  salaryExpectation: "RM 9,000 - RM 13,000 / month",
  riskAppetite: "medium",
  lifestylePreference: "fast-growth",
  locationPreference: "Kuala Lumpur, Singapore, or Remote",
  targetJob: "Senior Software Engineer",
  resumeText:
    "ARJUN MEHTA — Software Engineer\nBSc Computer Science, Universiti Malaya (2022)\nEXPERIENCE\nSoftware Engineer — Fintech scale-up (2022–present): Node.js/Python APIs, AWS payments microservice, 40% p95 latency reduction, GitHub Actions + Docker CI/CD, mentored 2 juniors.\nSKILLS: Python, SQL, TypeScript, React, Node.js, AWS, Docker, GraphQL, PostgreSQL\nLINKS: github.com/arjun (active open-source portfolio)",
};

// 3. Creative Designer — UX/UI, portfolio, communication.
const creative: UserProfile = {
  name: "Mei Ling Chong",
  currentRole: "Junior Product Designer",
  education: "BA Communication Design, The One Academy (2023).",
  experience:
    "Junior Product Designer at a design studio (1 year) — ran user interviews, built wireframes and high-fidelity prototypes in Figma, and shipped a design system used across 3 product teams. Freelance brand and UI work for 5 local startups. Maintains a Behance + personal portfolio site.",
  skills: [
    "Figma", "UX Research", "UI Design", "Prototyping", "Design Systems",
    "Communication", "User Testing", "Branding", "Webflow",
  ],
  interests: ["Product Design", "UX Research", "Design Systems", "Brand Strategy", "Accessibility"],
  preferredIndustries: ["Technology", "Design", "Media", "E-commerce"],
  salaryExpectation: "RM 4,500 - RM 7,000 / month",
  riskAppetite: "medium",
  lifestylePreference: "flexibility",
  locationPreference: "Kuala Lumpur or Remote",
  targetJob: "Product Designer",
  resumeText:
    "MEI LING CHONG — Product Designer\nBA Communication Design, The One Academy (2023)\nEXPERIENCE\nJunior Product Designer — design studio (2023–present): user interviews, Figma wireframes/prototypes, design system across 3 teams. Freelance UI for 5 startups.\nSKILLS: Figma, UX Research, UI Design, Prototyping, Design Systems, Webflow\nPORTFOLIO: behance.net/meiling",
};

// 4. Builder / Startup — hackathon-heavy, high risk, entrepreneurial.
const builder: UserProfile = {
  name: "Daniel Tan",
  currentRole: "Final-year Engineering Student & Indie Builder",
  education: "BEng Mechatronics, Universiti Teknologi Malaysia (Expected 2026).",
  experience:
    "Shipped 4 side projects, two earning their first paying users. Won 1st place at MyHackathon 2025 and top 5 at a regional startup weekend. Co-founded a 3-person student startup building an AI study tool; handled product, basic full-stack, and early sales. Comfortable shipping an MVP in a weekend.",
  skills: [
    "Full-Stack Development", "Python", "React", "MVP Design", "Sales",
    "Product Management", "Figma", "Git", "Public Speaking",
  ],
  interests: ["Entrepreneurship", "Startups", "Product Management", "AI", "Growth"],
  preferredIndustries: ["Technology", "Startups", "AI", "Consumer Apps"],
  salaryExpectation: "Equity-friendly / RM 4,000 - RM 8,000 / month",
  riskAppetite: "high",
  lifestylePreference: "fast-growth",
  locationPreference: "Anywhere — remote-first",
  targetJob: "Founding Engineer",
  resumeText:
    "DANIEL TAN — Builder\nBEng Mechatronics, UTM (Expected 2026)\nPROJECTS: 4 shipped side projects (2 with paying users), MyHackathon 2025 winner, co-founder of student AI study-tool startup (product + full-stack + sales).\nSKILLS: Full-Stack, Python, React, MVP design, Sales",
};

// 5. Purpose-driven / Climate — sustainability, social impact, data/policy.
const climate: UserProfile = {
  name: "Nurul Hidayah",
  currentRole: "Sustainability Analyst",
  education: "BSc Environmental Science, Universiti Putra Malaysia (2023). Minor in Data Analytics.",
  experience:
    "Sustainability Analyst at an ESG consultancy (1.5 years) — built carbon-accounting models, analysed supply-chain emissions data in Python and SQL, and co-authored 3 client sustainability reports. Volunteer policy researcher for a youth climate NGO. Presented at a national climate-tech forum.",
  skills: [
    "Data Analysis", "Python", "SQL", "Research", "Policy Analysis",
    "ESG Reporting", "Stakeholder Management", "Public Speaking", "Excel",
  ],
  interests: ["Climate Technology", "Sustainability", "Social Impact", "Data for Good", "Policy"],
  preferredIndustries: ["Climate Tech", "Consulting", "Government", "Non-profit", "Energy"],
  salaryExpectation: "RM 5,000 - RM 8,000 / month",
  riskAppetite: "low",
  lifestylePreference: "purpose-driven",
  locationPreference: "Kuala Lumpur, Putrajaya, or Remote",
  targetJob: "Climate Data Analyst",
  resumeText:
    "NURUL HIDAYAH — Sustainability Analyst\nBSc Environmental Science, UPM (2023), Minor Data Analytics\nEXPERIENCE\nSustainability Analyst — ESG consultancy (2023–present): carbon-accounting models, supply-chain emissions analysis (Python/SQL), 3 client reports. Volunteer climate-policy researcher.\nSKILLS: Data Analysis, Python, SQL, ESG Reporting, Policy Analysis",
};

// 6. University Student — clear programme + graduation year, internship-seeking.
const university: UserProfile = {
  name: "Faiz Rahman",
  currentRole: "Second-year Computer Science Student",
  education:
    "BSc Computer Science, Universiti Teknologi Malaysia (Expected 2027). Faculty of Computing. CGPA 3.6. Active in the Google Developer Student Club.",
  experience:
    "No full-time experience yet — actively seeking a first internship. Completed coursework projects in Java and Python, a database mini-project, and a class web app. Member of the campus coding club and a recent participant in a 24-hour university hackathon.",
  skills: ["Java", "Python", "SQL", "HTML/CSS", "Git", "Problem Solving"],
  interests: ["Software Engineering", "Data Science", "Internships", "Web Development"],
  preferredIndustries: ["Technology", "Banking", "Telecommunications"],
  salaryExpectation: "Internship allowance RM 800 - RM 1,500 / month",
  riskAppetite: "low",
  lifestylePreference: "stability",
  locationPreference: "Johor Bahru or Kuala Lumpur",
  targetJob: "Software Engineering Intern",
  resumeText:
    "FAIZ RAHMAN — CS Student\nBSc Computer Science, UTM (Expected 2027), Faculty of Computing, CGPA 3.6\nSeeking first internship. Coursework projects in Java/Python, a database mini-project, and a class web app. GDSC member; university hackathon participant.\nSKILLS: Java, Python, SQL, HTML/CSS, Git",
};

// 7. Low-information user — minimal data to test fallbacks/empty states.
const minimal: UserProfile = {
  name: "Sam",
  currentRole: "Fresh graduate",
  education: "Diploma graduate.",
  experience: "Some part-time work.",
  skills: ["Communication"],
  interests: ["Not sure yet"],
  preferredIndustries: [],
  salaryExpectation: "",
  riskAppetite: "medium",
  lifestylePreference: "stability",
  locationPreference: "Malaysia",
};

export const demoProfiles: Record<DemoProfileId, UserProfile> = {
  generalist,
  technologist,
  creative,
  builder,
  climate,
  university,
  minimal,
};

export interface DemoProfileOption {
  id: DemoProfileId;
  label: string;
  description: string;
}

export const demoProfileOptions: DemoProfileOption[] = [
  { id: "generalist", label: "Generalist", description: "Broad skills, unclear target role" },
  { id: "technologist", label: "Technologist", description: "Software / data / cloud profile" },
  { id: "creative", label: "Creative Designer", description: "UX/UI, portfolio, communication" },
  { id: "builder", label: "Builder / Startup", description: "Hackathons, high risk, entrepreneurial" },
  { id: "climate", label: "Purpose / Climate", description: "Sustainability, social impact, data" },
  { id: "university", label: "University Student", description: "Internship-seeking undergrad" },
  { id: "minimal", label: "Minimal", description: "Low-information user / empty states" },
];

const DEFAULT_DEMO_ID: DemoProfileId = "generalist";

function isDemoProfileId(id: string): id is DemoProfileId {
  return id in demoProfiles;
}

/**
 * Resolve a demo persona by id. Accepts the legacy `"true"` value (and any
 * missing/invalid id) by falling back to the default generalist persona — so
 * `/dashboard?demo=true` keeps working exactly as before.
 */
export function getDemoProfile(id?: string | null): UserProfile {
  if (id && isDemoProfileId(id)) return demoProfiles[id];
  return demoProfiles[DEFAULT_DEMO_ID];
}

/** The persona id a `demo` query value maps to (default when missing/invalid). */
export function resolveDemoId(id?: string | null): DemoProfileId {
  return id && isDemoProfileId(id) ? id : DEFAULT_DEMO_ID;
}
