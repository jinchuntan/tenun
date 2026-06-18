// ─────────────────────────────────────────────────────────────────────────────
// Mock candidate pool for the employer dashboard prototype.
//
// This is fictional demo data — no real people, no database, no privacy logic.
// It exists purely to demonstrate the "Tenun shows WHY a candidate fits, by
// evidence" flow on /employers/dashboard. All candidates are styled after
// Malaysian students / fresh graduates.
//
// Design rule: NO match scores anywhere. Ranking is computed under the hood
// (skill relevance → manual curation → proof density) but only ever surfaced
// as qualitative labels, never as a number.
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateProject {
  name: string;
  description: string;
  skills: string[];
  outcome: string;
  link?: string;
}

export interface CandidateCV {
  education: { institution: string; qualification: string; period: string; result?: string }[];
  experience: string[];
  skills: string[];
  tools: string[];
}

export interface MeetingSlot {
  id: string;
  label: string;
}

export interface EmployerCandidate {
  id: string;
  name: string;
  initials: string;
  headline: string;
  /** One-line, evidence-backed claim shown as the card hero. */
  evidencedClaim: string;
  location: string;
  availability: string;
  preferredRoles: string[];
  matchKeywords: string[];
  skills: string[];
  tools: string[];
  industries: string[];
  salaryExpectation: string;
  /** Manual curation order for the first demos. Lower = higher. */
  curatedRank: number;
  intentSignal: string;
  readiness: string;
  cvSummary: string;
  /** Three tight, scannable highlights. */
  summaryBullets: string[];
  /** How this person could grow inside the hiring company (retention angle). */
  growthPath: string;
  cv: CandidateCV;
  projects: CandidateProject[];
  whyHire: string[];
  /** Verifiable credentials: degrees, certs, results. */
  credentials: string[];
  /** Evidence of how they reason / work, not just what they built. */
  thinkingProof: string[];
  /** External validation: stars, rankings, community, testimonials. */
  socialProof: string[];
  possibleGaps: string[];
  interviewFocus: string[];
  email: string;
  phone: string;
  meetingSlots: MeetingSlot[];
}

/** Outreach handshake state for a candidate (employer requests → accept/decline). */
export type ConnectionStatus = "none" | "pending" | "accepted" | "declined";

export interface CandidateSearchResult {
  candidate: EmployerCandidate;
  /** Candidate skills that matched the query (for display tags). */
  matchedSkills: string[];
  /** True when the candidate covers every recognised skill in the query. */
  meetsAllMustHaves: boolean;
}

const DEFAULT_SLOTS: MeetingSlot[] = [
  { id: "slot-tue", label: "Tuesday, 10:00 AM" },
  { id: "slot-wed", label: "Wednesday, 2:30 PM" },
  { id: "slot-fri", label: "Friday, 4:00 PM" },
];

export const CANDIDATES: EmployerCandidate[] = [
  {
    id: "aisha-rahman",
    name: "Aisha Rahman",
    initials: "AR",
    headline: "Backend Software Engineer · APIs & distributed systems",
    evidencedClaim: "Shipped a payments API handling ~12k daily transactions during her internship.",
    location: "Kuala Lumpur",
    availability: "Available in 1 month",
    preferredRoles: ["Backend Developer", "Software Engineer Intern", "Full-Stack Engineer", "Platform Engineer"],
    matchKeywords: ["backend", "api", "microservices", "rest", "graphql", "distributed systems", "cloud", "deployment"],
    skills: ["Node.js", "TypeScript", "Python", "Go", "REST APIs", "GraphQL", "PostgreSQL", "Docker"],
    tools: ["AWS", "GitHub Actions", "Postman", "Redis", "Kubernetes"],
    industries: ["Fintech", "SaaS", "E-commerce"],
    salaryExpectation: "RM 3,200 – RM 4,000 / month",
    curatedRank: 1,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Final-year Computer Science student at Universiti Malaya with hands-on experience building production-style REST and GraphQL APIs. Comfortable across Node.js, Python and Go, with a focus on clean, well-tested services and cloud deployment.",
    summaryBullets: [
      "Built a production-style payments API (Node.js + PostgreSQL) handling ~12k daily transactions.",
      "Owns deployment end-to-end: AWS, Docker and GitHub Actions CI.",
      "Two public, deployed projects with measurable outcomes.",
    ],
    growthPath:
      "Ready to own backend services from day one; with mentorship on event-driven systems she could grow into a platform/infra lead within 18–24 months.",
    cv: {
      education: [
        { institution: "Universiti Malaya (UM)", qualification: "BSc Computer Science", period: "2021 – 2025", result: "CGPA 3.78" },
      ],
      experience: [
        "Backend Engineering Intern at a KL fintech startup — built a payments reconciliation API in Node.js + PostgreSQL serving ~12k daily transactions.",
        "Open-source contributor — shipped 9 merged PRs to a Go-based CLI tool, adding retry and rate-limit handling.",
        "Teaching assistant for Data Structures & Algorithms (2 semesters).",
      ],
      skills: ["Node.js", "TypeScript", "Python", "Go", "REST APIs", "GraphQL", "PostgreSQL", "Docker"],
      tools: ["AWS", "GitHub Actions", "Postman", "Redis", "Kubernetes"],
    },
    projects: [
      {
        name: "PayLedger API",
        description: "A payments reconciliation service that matches bank statements against internal ledgers and flags mismatches.",
        skills: ["Node.js", "TypeScript", "PostgreSQL", "Docker"],
        outcome: "Reduced manual reconciliation time by ~70% in a demo with a local merchant; deployed on AWS ECS.",
        link: "https://github.com/aisharahman/payledger",
      },
      {
        name: "GoFetch",
        description: "A concurrent web-scraping CLI in Go with rate limiting and retry/backoff.",
        skills: ["Go", "Concurrency", "REST APIs"],
        outcome: "1.2k GitHub stars; used as a teaching example for goroutines at a campus workshop.",
        link: "https://github.com/aisharahman/gofetch",
      },
    ],
    whyHire: [
      "Real production-style API experience — not just coursework — across Node.js, Python and Go.",
      "Strong portfolio evidence: two deployed projects with measurable outcomes and public GitHub code.",
      "Demonstrated ownership of deployment and CI (AWS, Docker, GitHub Actions), reducing onboarding cost.",
      "Intent signal is high — actively looking and available within a month.",
    ],
    credentials: [
      "BSc Computer Science, Universiti Malaya — CGPA 3.78",
      "AWS Cloud Practitioner (foundational)",
    ],
    thinkingProof: [
      "Documented her reconciliation edge-case handling in the PayLedger README.",
      "Added retry/rate-limit logic to an OSS Go tool — reasoning about failure modes, not just features.",
    ],
    socialProof: [
      "1.2k GitHub stars on GoFetch",
      "9 merged PRs to a public Go project",
    ],
    possibleGaps: [
      "Limited experience with large-scale event-driven architectures (Kafka, queues).",
      "No formal on-call / incident-response exposure yet.",
    ],
    interviewFocus: [
      "Walk through how PayLedger handles partial failures during reconciliation.",
      "How would you design rate limiting for an API used by 100x more clients?",
      "Where have you had to debug a concurrency issue in Go?",
    ],
    email: "aisha.rahman@example.com",
    phone: "+60 12-345 6789",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "daniel-wong",
    name: "Daniel Wong",
    initials: "DW",
    headline: "Data Analyst · SQL, Python & dashboards",
    evidencedClaim: "Built sales dashboards that surfaced RM 40k/month of slow-moving stock for a retail client.",
    location: "Petaling Jaya",
    availability: "Available immediately",
    preferredRoles: ["Data Analyst Intern", "Business Intelligence Analyst", "Data Analyst"],
    matchKeywords: ["data", "analytics", "sql", "dashboard", "reporting", "visualisation", "statistics", "insights"],
    skills: ["SQL", "Python", "pandas", "Data Visualisation", "Statistics", "Excel"],
    tools: ["Power BI", "Tableau", "Google Sheets", "Jupyter", "BigQuery"],
    industries: ["Retail", "FMCG", "Banking"],
    salaryExpectation: "RM 2,800 – RM 3,400 / month",
    curatedRank: 3,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Data-focused fresh graduate from Sunway University who turns messy spreadsheets into clear dashboards. Strong SQL and Python, with several end-to-end analytics projects covering sales and operations data.",
    summaryBullets: [
      "Owns the full pipeline: SQL extraction → Python analysis → Power BI dashboards.",
      "Dashboards adopted by real users (3 regional managers) for weekly reviews.",
      "Available immediately, so ramp-up is fast.",
    ],
    growthPath:
      "Strong fit for a junior analyst seat now; as he picks up data-warehousing and experimentation he could anchor a small analytics function within two years.",
    cv: {
      education: [
        { institution: "Sunway University", qualification: "BSc Data Analytics", period: "2021 – 2024", result: "CGPA 3.65" },
      ],
      experience: [
        "Analytics Intern at an FMCG distributor — built weekly sales dashboards in Power BI used by 3 regional managers.",
        "Freelance data clean-up and reporting for two local SMEs.",
        "Kaggle competitor — top 12% in a retail demand forecasting challenge.",
      ],
      skills: ["SQL", "Python", "pandas", "Data Visualisation", "Statistics", "Excel"],
      tools: ["Power BI", "Tableau", "Google Sheets", "Jupyter", "BigQuery"],
    },
    projects: [
      {
        name: "Retail Sales Pulse",
        description: "An interactive Power BI dashboard tracking sales, margin and stock-out risk across 18 outlets.",
        skills: ["SQL", "Power BI", "Data Visualisation"],
        outcome: "Surfaced RM 40k/month of slow-moving stock; adopted by a mock retail client for weekly reviews.",
      },
      {
        name: "Churn Signals",
        description: "A Python notebook that segments customers and flags churn risk using simple behavioural features.",
        skills: ["Python", "pandas", "Statistics"],
        outcome: "Identified the top 3 churn drivers with a clean, explainable model (no black box).",
      },
    ],
    whyHire: [
      "Speaks the language of business — frames numbers as decisions, not just charts.",
      "Owns the full analytics pipeline: extract (SQL) → analyse (Python) → present (Power BI).",
      "Available immediately, so ramp-up is fast.",
    ],
    credentials: [
      "BSc Data Analytics, Sunway University — CGPA 3.65",
      "Google Data Analytics Professional Certificate",
    ],
    thinkingProof: [
      "Chose an explainable churn model over a black box and justified why in his write-up.",
      "Frames every dashboard around the decision it should drive, not the data available.",
    ],
    socialProof: [
      "Top 12% in a Kaggle retail forecasting challenge",
      "Dashboards adopted by 3 regional managers",
    ],
    possibleGaps: [
      "Has not worked with very large datasets / data warehousing at scale.",
      "Limited experience with formal experimentation (A/B testing).",
    ],
    interviewFocus: [
      "Walk me through a SQL query you're proud of and why.",
      "How did you decide what to put on the Retail Sales Pulse dashboard?",
      "How would you validate that a churn signal is actually useful?",
    ],
    email: "daniel.wong@example.com",
    phone: "+60 16-228 4471",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "nurul-iman",
    name: "Nurul Iman",
    initials: "NI",
    headline: "Product / UX Associate · research-led design",
    evidencedClaim: "Lifted task completion from 61% to 89% in moderated usability tests on a redesign.",
    location: "Cyberjaya",
    availability: "Available in 2 weeks",
    preferredRoles: ["Product Associate", "UX Designer", "Product/UX Associate", "Associate Product Manager"],
    matchKeywords: ["product", "ux", "ui", "design", "user research", "prototyping", "wireframe", "usability"],
    skills: ["User Research", "Wireframing", "Prototyping", "Usability Testing", "UX Writing"],
    tools: ["Figma", "Maze", "Notion", "Miro", "FigJam"],
    industries: ["EdTech", "HealthTech", "Consumer apps"],
    salaryExpectation: "RM 2,900 – RM 3,500 / month",
    curatedRank: 4,
    intentSignal: "Open to offers",
    readiness: "Portfolio-ready",
    cvSummary:
      "Multimedia University graduate who blends user research with clean, accessible interface design. Has run real usability sessions and shipped redesigns backed by evidence rather than opinion.",
    summaryBullets: [
      "Designs from evidence — every decision backed by research or a usability result.",
      "Measurable UX impact: task completion 61% → 89% on a real redesign.",
      "Comfortable collaborating with engineers; thinks in flows, not just screens.",
    ],
    growthPath:
      "Slots into a product/UX associate role immediately; with ownership of metrics end-to-end she could grow toward a product manager track in 2–3 years.",
    cv: {
      education: [
        { institution: "Multimedia University (MMU)", qualification: "BA Interface Design", period: "2020 – 2024", result: "First Class" },
      ],
      experience: [
        "UX Intern at an EdTech startup — redesigned the onboarding flow, lifting activation in usability tests.",
        "Freelance UI design for two local mobile apps.",
        "Lead designer for the campus hackathon-winning study app.",
      ],
      skills: ["User Research", "Wireframing", "Prototyping", "Usability Testing", "UX Writing"],
      tools: ["Figma", "Maze", "Notion", "Miro", "FigJam"],
    },
    projects: [
      {
        name: "LearnLoop Onboarding Redesign",
        description: "End-to-end redesign of a student onboarding flow, from research interviews to a clickable Figma prototype.",
        skills: ["User Research", "Figma", "Prototyping"],
        outcome: "Task-completion rose from 61% to 89% in moderated usability tests with 8 students.",
      },
      {
        name: "Klinik Queue",
        description: "A concept app to reduce clinic waiting-room confusion, designed around real patient interviews.",
        skills: ["User Research", "Wireframing", "UX Writing"],
        outcome: "Validated with 5 interviews; presented as a case study with before/after journey maps.",
      },
    ],
    whyHire: [
      "Designs from evidence — every decision is backed by research or a usability result.",
      "Portfolio shows measurable UX impact (task completion 61% → 89%).",
      "Comfortable collaborating with engineers; thinks in flows, not just screens.",
    ],
    credentials: [
      "BA Interface Design, Multimedia University — First Class",
      "Google UX Design Professional Certificate",
    ],
    thinkingProof: [
      "Presents before/after journey maps to justify design decisions.",
      "Frames work around what NOT to build, citing research evidence.",
    ],
    socialProof: [
      "Lead designer on a hackathon-winning study app",
      "Redesign case study cited by her EdTech team",
    ],
    possibleGaps: [
      "Less exposure to design systems at scale.",
      "Has not yet owned product metrics end-to-end (acquisition → retention).",
    ],
    interviewFocus: [
      "Walk me through the research behind the LearnLoop redesign.",
      "How do you decide what NOT to build?",
      "Tell me about a time your design was proven wrong by users.",
    ],
    email: "nurul.iman@example.com",
    phone: "+60 19-770 1132",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "arjun-subramaniam",
    name: "Arjun Subramaniam",
    initials: "AS",
    headline: "Cybersecurity Analyst · blue team & threat detection",
    evidencedClaim: "Built a home SOC lab and wrote 14 tuned detection rules with documented false-positive analysis.",
    location: "Kuala Lumpur",
    availability: "Available in 1 month",
    preferredRoles: ["Cybersecurity Analyst", "SOC Analyst", "IT Security Intern", "Information Security Analyst"],
    matchKeywords: ["cybersecurity", "security", "soc", "threat", "siem", "networking", "incident", "vulnerability", "it"],
    skills: ["Network Security", "Threat Detection", "Incident Response", "Vulnerability Assessment", "Linux"],
    tools: ["Wireshark", "Splunk", "Nmap", "Burp Suite", "Kali Linux"],
    industries: ["Banking", "Telco", "Government"],
    salaryExpectation: "RM 3,000 – RM 3,800 / month",
    curatedRank: 5,
    intentSignal: "Actively looking",
    readiness: "Interview-ready",
    cvSummary:
      "Asia Pacific University graduate focused on defensive security. Hands-on with packet analysis, SIEM dashboards and basic penetration testing, plus a CompTIA Security+ certification.",
    summaryBullets: [
      "Genuinely hands-on detection — built and tuned a real Splunk SIEM lab, not just theory.",
      "Holds CompTIA Security+ and captains a top-5 national CTF team.",
      "Documents clearly (runbooks, tuning notes) — valuable in a SOC.",
    ],
    growthPath:
      "Productive in a SOC analyst seat quickly; with enterprise exposure and compliance frameworks he could move toward detection engineering in 2 years.",
    cv: {
      education: [
        { institution: "Asia Pacific University (APU)", qualification: "BSc Cyber Security", period: "2021 – 2024", result: "CGPA 3.55" },
      ],
      experience: [
        "Security Operations Intern at a local bank — triaged SIEM alerts and documented incident runbooks.",
        "Built a home lab SOC with Splunk to practise detection engineering.",
        "Captain of the university CTF team (top 5 nationally).",
      ],
      skills: ["Network Security", "Threat Detection", "Incident Response", "Vulnerability Assessment", "Linux"],
      tools: ["Wireshark", "Splunk", "Nmap", "Burp Suite", "Kali Linux"],
    },
    projects: [
      {
        name: "Home SOC Lab",
        description: "A self-built security operations lab streaming logs into Splunk with custom detection rules.",
        skills: ["Splunk", "Threat Detection", "Linux"],
        outcome: "Wrote 14 detection rules; documented true/false-positive tuning for brute-force attempts.",
      },
      {
        name: "PhishCheck",
        description: "A small toolkit and checklist to analyse suspicious emails for phishing indicators.",
        skills: ["Incident Response", "Networking"],
        outcome: "Used in a campus awareness workshop attended by ~120 students.",
      },
    ],
    whyHire: [
      "Genuinely hands-on with detection — built and tuned a real SIEM lab, not just theory.",
      "Holds CompTIA Security+ and competes in CTFs, showing self-driven learning.",
      "Documents clearly (runbooks, tuning notes) — valuable in a SOC.",
    ],
    credentials: [
      "BSc Cyber Security, Asia Pacific University — CGPA 3.55",
      "CompTIA Security+",
    ],
    thinkingProof: [
      "Documented true/false-positive tuning for his detection rules.",
      "Wrote incident runbooks during his bank internship.",
    ],
    socialProof: [
      "Captain of a top-5 national CTF team",
      "Ran a phishing-awareness workshop for ~120 students",
    ],
    possibleGaps: [
      "Limited enterprise-scale exposure (large estates, compliance frameworks).",
      "Offensive/pen-testing depth is basic compared to blue-team strength.",
    ],
    interviewFocus: [
      "How did you reduce false positives in your Splunk detection rules?",
      "Walk me through triaging a suspected brute-force alert.",
      "What would you check first in a reported phishing email?",
    ],
    email: "arjun.subramaniam@example.com",
    phone: "+60 17-554 9023",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "wei-jie-tan",
    name: "Wei Jie Tan",
    initials: "WT",
    headline: "Finance / Business Analyst · modelling & valuation",
    evidencedClaim: "Built a 3-statement model for a real SME client and flagged a cash-flow risk in the aggressive scenario.",
    location: "Kuala Lumpur",
    availability: "Available in 3 weeks",
    preferredRoles: ["Finance Graduate Analyst", "Business Analyst", "Investment Analyst", "Financial Analyst"],
    matchKeywords: ["finance", "business analyst", "financial modelling", "valuation", "accounting", "forecasting", "excel"],
    skills: ["Financial Modelling", "Valuation", "Forecasting", "Accounting", "Business Analysis"],
    tools: ["Excel", "PowerPoint", "SQL", "Bloomberg Terminal", "Power BI"],
    industries: ["Investment Banking", "Consulting", "Corporate Finance"],
    salaryExpectation: "RM 3,000 – RM 3,600 / month",
    curatedRank: 6,
    intentSignal: "Open to offers",
    readiness: "Interview-ready",
    cvSummary:
      "Finance graduate from Universiti Teknologi MARA with strong Excel modelling and a CFA Level I pass. Comfortable translating financial data into clear recommendations for non-finance stakeholders.",
    summaryBullets: [
      "Clean financial modelling with scenario and sensitivity analysis, not static sheets.",
      "CFA Level I plus real client modelling work — commitment and capability.",
      "Translates financial insight for non-finance audiences clearly.",
    ],
    growthPath:
      "Ready for a graduate analyst role; broadening his data tooling beyond Excel would set him up for a senior analyst seat within a few years.",
    cv: {
      education: [
        { institution: "Universiti Teknologi MARA (UiTM)", qualification: "BBA Finance", period: "2020 – 2024", result: "CGPA 3.60" },
      ],
      experience: [
        "Finance Intern at a consulting firm — built a 3-statement model for an SME client's expansion plan.",
        "Treasurer of the university investment club (managed a RM 20k mock portfolio).",
        "Passed CFA Level I.",
      ],
      skills: ["Financial Modelling", "Valuation", "Forecasting", "Accounting", "Business Analysis"],
      tools: ["Excel", "PowerPoint", "SQL", "Bloomberg Terminal", "Power BI"],
    },
    projects: [
      {
        name: "SME Expansion Model",
        description: "A 3-statement financial model with scenario analysis for a retail SME considering a second outlet.",
        skills: ["Financial Modelling", "Forecasting", "Excel"],
        outcome: "Recommended a phased rollout; flagged a cash-flow risk in the aggressive scenario.",
      },
      {
        name: "Bursa Valuation Deck",
        description: "A DCF and comparables valuation of a Bursa Malaysia-listed consumer company.",
        skills: ["Valuation", "Business Analysis"],
        outcome: "Presented a buy/hold thesis with a clear sensitivity table to the investment club.",
      },
    ],
    whyHire: [
      "Strong, clean financial modelling — scenario and sensitivity analysis, not just static sheets.",
      "CFA Level I plus real client modelling work shows commitment and capability.",
      "Communicates financial insight to non-finance audiences clearly.",
    ],
    credentials: [
      "BBA Finance, Universiti Teknologi MARA — CGPA 3.60",
      "CFA Level I (passed)",
    ],
    thinkingProof: [
      "Flagged a cash-flow risk in his SME model's aggressive scenario rather than just presenting upside.",
      "Defends valuation assumptions with a clear sensitivity table.",
    ],
    socialProof: [
      "Treasurer of the university investment club (RM 20k mock portfolio)",
      "Client model used in a real SME expansion decision",
    ],
    possibleGaps: [
      "Limited SQL/data tooling depth beyond Excel.",
      "No exposure to large-scale corporate finance transactions yet.",
    ],
    interviewFocus: [
      "Walk me through the key assumptions in your SME Expansion Model.",
      "How did you handle the cash-flow risk you flagged?",
      "Defend the discount rate in your Bursa valuation.",
    ],
    email: "weijie.tan@example.com",
    phone: "+60 12-908 7765",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "sofea-aziz",
    name: "Sofea Aziz",
    initials: "SA",
    headline: "Frontend Developer · React, Next.js & accessible UI",
    evidencedClaim: "Rebuilt a marketing site in Next.js and pushed its Lighthouse performance score to 98.",
    location: "Shah Alam",
    availability: "Available immediately",
    preferredRoles: ["Frontend Developer", "Software Engineer Intern", "Web Developer", "Full-Stack Engineer"],
    matchKeywords: ["frontend", "react", "web", "ui", "javascript", "typescript", "responsive", "accessibility"],
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Accessibility"],
    tools: ["Git", "Figma", "Vite", "Vercel", "Storybook"],
    industries: ["SaaS", "E-commerce", "Media"],
    salaryExpectation: "RM 2,900 – RM 3,500 / month",
    curatedRank: 2,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Universiti Teknologi Malaysia graduate who builds fast, accessible web interfaces with React and Next.js. Cares about performance budgets and shipping polished, responsive UIs.",
    summaryBullets: [
      "Ships polished, fast UIs — measurable wins like Lighthouse 98.",
      "Takes accessibility seriously (WCAG AA), which many juniors overlook.",
      "Available immediately with public, reviewable code.",
    ],
    growthPath:
      "Immediately productive on frontend; pairing her with backend mentorship could grow her into a well-rounded full-stack engineer within 18 months.",
    cv: {
      education: [
        { institution: "Universiti Teknologi Malaysia (UTM)", qualification: "BSc Software Engineering", period: "2021 – 2024", result: "CGPA 3.70" },
      ],
      experience: [
        "Frontend Intern at a SaaS startup — rebuilt the marketing site in Next.js, improving Lighthouse performance to 98.",
        "Built and maintained a personal component library used across 3 side projects.",
        "Mentored juniors in a campus web-dev bootcamp.",
      ],
      skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Accessibility"],
      tools: ["Git", "Figma", "Vite", "Vercel", "Storybook"],
    },
    projects: [
      {
        name: "Warung Web",
        description: "A responsive ordering site for a local food stall, built with Next.js and Tailwind.",
        skills: ["Next.js", "TypeScript", "Tailwind CSS"],
        outcome: "Loads in under 1s on 3G; the stall now takes pre-orders through it.",
        link: "https://github.com/sofeaaziz/warung-web",
      },
      {
        name: "A11y Audit Kit",
        description: "A checklist and set of reusable accessible React components (modals, menus, forms).",
        skills: ["React", "Accessibility"],
        outcome: "Passed WCAG AA checks; reused across her portfolio projects.",
      },
    ],
    whyHire: [
      "Ships polished, fast UIs — measurable performance wins (Lighthouse 98).",
      "Takes accessibility seriously, which many junior devs overlook.",
      "Available immediately with public, reviewable code.",
    ],
    credentials: [
      "BSc Software Engineering, Universiti Teknologi Malaysia — CGPA 3.70",
      "Meta Front-End Developer Certificate",
    ],
    thinkingProof: [
      "Works to explicit performance budgets and proves the result (Lighthouse 98).",
      "Built reusable accessible components rather than one-off fixes.",
    ],
    socialProof: [
      "Mentored juniors at a campus web-dev bootcamp",
      "Warung Web in real use by a local stall for pre-orders",
    ],
    possibleGaps: [
      "Backend/API experience is light — primarily a frontend specialist.",
      "Limited experience with state management at large scale.",
    ],
    interviewFocus: [
      "How did you get Warung Web to load under 1s on 3G?",
      "Walk me through making a custom modal accessible.",
      "When would you reach for a state library vs. local state?",
    ],
    email: "sofea.aziz@example.com",
    phone: "+60 13-441 2298",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "kavin-raj",
    name: "Kavin Raj",
    initials: "KR",
    headline: "Machine Learning enthusiast · Python & applied ML",
    evidencedClaim: "Built a defect-classification prototype reaching 92% validation accuracy on real factory images.",
    location: "Penang",
    availability: "Available in 1 month",
    preferredRoles: ["Machine Learning Intern", "Data Scientist", "AI Engineer", "Data Analyst"],
    matchKeywords: ["machine learning", "ml", "ai", "python", "data science", "model", "nlp", "deep learning"],
    skills: ["Python", "Machine Learning", "pandas", "scikit-learn", "NLP", "Statistics"],
    tools: ["Jupyter", "TensorFlow", "Hugging Face", "Git", "Google Colab"],
    industries: ["AI / ML", "Manufacturing", "Healthcare"],
    salaryExpectation: "RM 3,000 – RM 3,800 / month",
    curatedRank: 7,
    intentSignal: "Open to offers",
    readiness: "Building portfolio",
    cvSummary:
      "Universiti Sains Malaysia graduate applying machine learning to real problems. Strong Python foundations with applied projects in classification and NLP.",
    summaryBullets: [
      "Applies ML to concrete local problems (Malay NLP, factory defects) — not toy datasets.",
      "Solid Python and scikit-learn/TensorFlow foundation.",
      "Self-driven learner active in the local data community.",
    ],
    growthPath:
      "A strong applied-ML hire who'd benefit from MLOps mentorship; could own model deployment pipelines as he gains production exposure.",
    cv: {
      education: [
        { institution: "Universiti Sains Malaysia (USM)", qualification: "BSc Computer Science (AI)", period: "2021 – 2024", result: "CGPA 3.62" },
      ],
      experience: [
        "ML Intern at a manufacturing firm — built a defect-classification prototype on production-line images.",
        "Research assistant on an NLP sentiment project for Malay-language reviews.",
        "Active in local Kaggle and PyData meetups.",
      ],
      skills: ["Python", "Machine Learning", "pandas", "scikit-learn", "NLP", "Statistics"],
      tools: ["Jupyter", "TensorFlow", "Hugging Face", "Git", "Google Colab"],
    },
    projects: [
      {
        name: "DefectVision",
        description: "An image-classification prototype that flags defective parts from production-line photos.",
        skills: ["Python", "Machine Learning", "TensorFlow"],
        outcome: "Reached 92% validation accuracy on a small labelled dataset; demoed to the plant team.",
      },
      {
        name: "RasaBM Sentiment",
        description: "A sentiment classifier for Malay-language product reviews using a fine-tuned transformer.",
        skills: ["NLP", "Python", "Hugging Face"],
        outcome: "Handled code-switching (Malay/English) better than a baseline bag-of-words model.",
      },
    ],
    whyHire: [
      "Applies ML to concrete, local problems (Malay NLP, factory defects) — not just toy datasets.",
      "Solid Python and scikit-learn/TensorFlow foundation.",
      "Self-driven learner active in the local data community.",
    ],
    credentials: [
      "BSc Computer Science (AI), Universiti Sains Malaysia — CGPA 3.62",
      "DeepLearning.AI TensorFlow Developer Certificate",
    ],
    thinkingProof: [
      "Validated DefectVision carefully given a small dataset, noting the limitation.",
      "Compared his transformer against a bag-of-words baseline to prove the gain.",
    ],
    socialProof: [
      "Active in local Kaggle and PyData meetups",
      "Defect prototype demoed to a real plant team",
    ],
    possibleGaps: [
      "Limited MLOps / model-deployment experience (mostly notebooks).",
      "Small datasets so far — needs exposure to production data scale.",
    ],
    interviewFocus: [
      "How did you validate DefectVision given the small dataset?",
      "What broke when handling Malay/English code-switching?",
      "How would you deploy one of your models into production?",
    ],
    email: "kavin.raj@example.com",
    phone: "+60 11-2087 6610",
    meetingSlots: DEFAULT_SLOTS,
  },
  {
    id: "hui-ying-lim",
    name: "Hui Ying Lim",
    initials: "HL",
    headline: "Digital Marketing & Growth Analyst · SEO and content",
    evidencedClaim: "Grew an e-commerce store's organic traffic 40% in 3 months with an SEO content plan.",
    location: "Johor Bahru",
    availability: "Available in 2 weeks",
    preferredRoles: ["Digital Marketing Executive", "Growth Analyst", "Marketing Associate", "Content Strategist"],
    matchKeywords: ["marketing", "digital marketing", "seo", "growth", "content", "social media", "campaign", "analytics"],
    skills: ["SEO", "Content Strategy", "Marketing Analytics", "Copywriting", "Social Media"],
    tools: ["Google Analytics", "Meta Ads", "Canva", "Mailchimp", "Google Search Console"],
    industries: ["E-commerce", "F&B", "Startups"],
    salaryExpectation: "RM 2,600 – RM 3,200 / month",
    curatedRank: 8,
    intentSignal: "Open to offers",
    readiness: "Portfolio-ready",
    cvSummary:
      "Taylor's University graduate who grows audiences with data-led content and SEO. Has run real campaigns with tracked results for small local brands.",
    summaryBullets: [
      "Marketing with receipts — tracks real results (40% organic growth), not vanity metrics.",
      "Comfortable across SEO, content and paid social on real budgets.",
      "Ties content decisions back to Google Analytics data.",
    ],
    growthPath:
      "Fits a growth/marketing associate role now; with bigger budgets and full-funnel attribution she could grow into a performance-marketing lead.",
    cv: {
      education: [
        { institution: "Taylor's University", qualification: "BA Marketing", period: "2021 – 2024", result: "CGPA 3.58" },
      ],
      experience: [
        "Marketing Intern at an e-commerce brand — grew organic traffic 40% in 3 months via an SEO content plan.",
        "Ran Meta ad campaigns for a local F&B outlet on a small budget.",
        "Built and grew a niche Instagram page to 12k followers.",
      ],
      skills: ["SEO", "Content Strategy", "Marketing Analytics", "Copywriting", "Social Media"],
      tools: ["Google Analytics", "Meta Ads", "Canva", "Mailchimp", "Google Search Console"],
    },
    projects: [
      {
        name: "Organic Growth Sprint",
        description: "A 3-month SEO + content plan for an e-commerce store, from keyword research to publishing.",
        skills: ["SEO", "Content Strategy", "Marketing Analytics"],
        outcome: "Organic sessions up 40%; two articles ranked on page 1 for target keywords.",
      },
      {
        name: "Kopi Campaign",
        description: "A low-budget Meta ads + content campaign for a local coffee shop.",
        skills: ["Social Media", "Copywriting"],
        outcome: "Doubled weekend foot traffic during the campaign window (owner-reported).",
      },
    ],
    whyHire: [
      "Marketing with receipts — tracks results (40% organic growth) rather than vanity metrics.",
      "Comfortable across SEO, content and paid social on real budgets.",
      "Analytical: ties content decisions back to Google Analytics data.",
    ],
    credentials: [
      "BA Marketing, Taylor's University — CGPA 3.58",
      "Google Analytics & HubSpot Content Marketing certificates",
    ],
    thinkingProof: [
      "Chose keywords from research data rather than guesswork, and tracked the outcome.",
      "Measures whether content actually works via Google Analytics, not impressions alone.",
    ],
    socialProof: [
      "Grew a niche Instagram page to 12k followers",
      "Two articles ranked on page 1 for target keywords",
    ],
    possibleGaps: [
      "Limited experience with large ad budgets / performance marketing at scale.",
      "Has not owned full marketing-funnel attribution.",
    ],
    interviewFocus: [
      "How did you choose keywords for the Organic Growth Sprint?",
      "What would you do differently with a 10x bigger ad budget?",
      "How do you measure whether content is actually working?",
    ],
    email: "huiying.lim@example.com",
    phone: "+60 18-332 0094",
    meetingSlots: DEFAULT_SLOTS,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic search / ranking — NO numeric score is ever produced.
//
// Order is decided under the hood by:
//   1. skill relevance to the query (more matched skills first),
//   2. manual curation (curatedRank, for the first demos),
//   3. proof density (projects + credentials + proof artifacts).
// The ranking is stable for a given query (no randomness).
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "with", "and", "the", "for", "a", "an", "of", "in", "to", "or", "looking", "who", "can",
]);

export const DEFAULT_ROLE = "Software Engineer Intern";

/** Every skill that exists across the pool — used to recognise "skill tokens". */
const KNOWN_SKILLS: string[] = Array.from(
  new Set(CANDIDATES.flatMap((c) => [...c.skills, ...c.tools]))
).map((s) => s.toLowerCase());

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function tokenMatchesLabel(token: string, label: string): boolean {
  const l = label.toLowerCase();
  return l.includes(token) || token.includes(l);
}

/** Skills proven by at least one project (no self-declared-only skills). */
export function provenSkills(candidate: EmployerCandidate): string[] {
  const fromProjects = new Set(candidate.projects.flatMap((p) => p.skills));
  // Keep the candidate's declared order, but only those backed by a project.
  return candidate.skills.filter((s) => fromProjects.has(s));
}

/** The project that proves a given skill, if any (for skill→artifact links). */
export function artifactForSkill(
  candidate: EmployerCandidate,
  skill: string
): CandidateProject | null {
  return candidate.projects.find((p) => p.skills.includes(skill)) ?? null;
}

/** Internal: a rough count of evidence artifacts. Never shown as a number. */
function proofDensity(candidate: EmployerCandidate): number {
  const linkedProjects = candidate.projects.filter((p) => p.link).length;
  return (
    candidate.projects.length * 2 +
    linkedProjects +
    candidate.credentials.length +
    candidate.thinkingProof.length +
    candidate.socialProof.length
  );
}

export function rankCandidates(rawQuery: string): CandidateSearchResult[] {
  const query = rawQuery.trim() || DEFAULT_ROLE;
  const tokens = tokenize(query);

  // Which query tokens are recognisable skills? Those are the "must-haves".
  const skillTokens = tokens.filter((t) => KNOWN_SKILLS.some((s) => tokenMatchesLabel(t, s)));

  const results = CANDIDATES.map((candidate) => {
    const allLabels = [
      ...candidate.preferredRoles,
      ...candidate.matchKeywords,
      ...candidate.skills,
      ...candidate.tools,
      ...candidate.projects.flatMap((p) => [p.name, ...p.skills]),
    ];

    // Relevance: how many query tokens this candidate hits anywhere.
    const relevance = tokens.filter((t) => allLabels.some((l) => tokenMatchesLabel(t, l))).length;

    // Display tags: declared skills that matched the query (fall back to top skills).
    const matchedSkills = candidate.skills.filter((s) =>
      tokens.some((t) => tokenMatchesLabel(t, s))
    );

    // Must-have check: does the candidate cover every recognised skill token?
    const meetsAllMustHaves =
      skillTokens.length > 0 &&
      skillTokens.every((t) => candidate.skills.some((s) => tokenMatchesLabel(t, s)));

    return {
      candidate,
      matchedSkills: matchedSkills.length ? matchedSkills : candidate.skills.slice(0, 4),
      meetsAllMustHaves,
      _relevance: relevance,
    };
  });

  // Sort: relevance desc → curatedRank asc → proof density desc → name.
  results.sort(
    (a, b) =>
      b._relevance - a._relevance ||
      a.candidate.curatedRank - b.candidate.curatedRank ||
      proofDensity(b.candidate) - proofDensity(a.candidate) ||
      a.candidate.name.localeCompare(b.candidate.name)
  );

  return results.map((r) => ({
    candidate: r.candidate,
    matchedSkills: r.matchedSkills,
    meetsAllMustHaves: r.meetsAllMustHaves,
  }));
}

/** Curated highlight reel for "Top candidates this month" — ordered, no scores. */
export function curatedTopCandidates(limit = 10): EmployerCandidate[] {
  return [...CANDIDATES].sort((a, b) => a.curatedRank - b.curatedRank).slice(0, limit);
}

/** Qualitative fit label — never a number. */
export function fitLabel(result: CandidateSearchResult): string {
  if (result.meetsAllMustHaves) return "Meets all must-have skills";
  if (result.matchedSkills.length >= 2) return "Strong skills overlap";
  return result.candidate.readiness;
}

/** Build a plain-text CV for download (deterministic, no backend). */
export function buildCandidateCvText(candidate: EmployerCandidate): string {
  const line = "─".repeat(56);
  const section = (title: string) => `\n${title.toUpperCase()}\n${line}`;

  const parts: string[] = [
    candidate.name,
    candidate.headline,
    `${candidate.location} · ${candidate.email} · ${candidate.phone}`,
    section("Summary"),
    candidate.cvSummary,
    section("Education"),
    ...candidate.cv.education.map(
      (ed) => `${ed.qualification} — ${ed.institution} (${ed.period})${ed.result ? ` · ${ed.result}` : ""}`
    ),
    section("Experience"),
    ...candidate.cv.experience.map((x) => `• ${x}`),
    section("Projects"),
    ...candidate.projects.flatMap((p) => [
      `${p.name}${p.link ? ` (${p.link})` : ""}`,
      `  ${p.description}`,
      `  Outcome: ${p.outcome}`,
    ]),
    section("Credentials"),
    ...candidate.credentials.map((c) => `• ${c}`),
    section("Skills"),
    candidate.cv.skills.join(", "),
    section("Tools"),
    candidate.cv.tools.join(", "),
    `\n${line}\nGenerated by Tenun · prototype data, fictional candidate.`,
  ];

  return parts.join("\n");
}

/** Build a simulated request-to-connect note (no real send). */
export function buildConnectMessage(candidate: EmployerCandidate, role: string): string {
  const firstName = candidate.name.split(" ")[0];
  const project = candidate.projects[0];
  const roleText = role.trim() || DEFAULT_ROLE;
  return [
    `Hi ${firstName}, we're hiring for a ${roleText} role at [Your Company].`,
    `Your ${project.name} project and your evidenced work stood out to us.`,
    `Would you be open to connecting?`,
  ].join(" ");
}
