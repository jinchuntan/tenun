// ─────────────────────────────────────────────────────────────────────────────
// Mock candidate pool for the employer dashboard prototype.
//
// This is fictional demo data — no real people, no database, no privacy logic.
// It exists purely to demonstrate the "Tenun explains WHY a candidate fits"
// flow on /employers/dashboard. All candidates are styled after Malaysian
// students / fresh graduates.
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
  location: string;
  availability: string;
  preferredRoles: string[];
  matchKeywords: string[];
  skills: string[];
  tools: string[];
  industries: string[];
  salaryExpectation: string;
  /** Baseline fit (0–100) before query keyword overlap is added. */
  fitScoreBase: number;
  intentSignal: string;
  readiness: string;
  cvSummary: string;
  cv: CandidateCV;
  projects: CandidateProject[];
  whyHire: string[];
  possibleGaps: string[];
  interviewFocus: string[];
  email: string;
  phone: string;
  meetingSlots: MeetingSlot[];
}

export interface CandidateSearchResult {
  candidate: EmployerCandidate;
  score: number;
  matchedTerms: string[];
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
    location: "Kuala Lumpur",
    availability: "Available in 1 month",
    preferredRoles: ["Backend Developer", "Software Engineer Intern", "Full-Stack Engineer", "Platform Engineer"],
    matchKeywords: ["backend", "api", "microservices", "rest", "graphql", "distributed systems", "cloud", "deployment"],
    skills: ["Node.js", "TypeScript", "Python", "Go", "REST APIs", "GraphQL", "PostgreSQL", "Docker"],
    tools: ["AWS", "GitHub Actions", "Postman", "Redis", "Kubernetes"],
    industries: ["Fintech", "SaaS", "E-commerce"],
    salaryExpectation: "RM 3,200 – RM 4,000 / month",
    fitScoreBase: 84,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Final-year Computer Science student at Universiti Malaya with hands-on experience building production-style REST and GraphQL APIs. Comfortable across Node.js, Python and Go, with a focus on clean, well-tested services and cloud deployment.",
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
        link: "github.com/aisharahman/payledger",
      },
      {
        name: "GoFetch",
        description: "A concurrent web-scraping CLI in Go with rate limiting and retry/backoff.",
        skills: ["Go", "Concurrency", "REST APIs"],
        outcome: "1.2k GitHub stars; used as a teaching example for goroutines at a campus workshop.",
        link: "github.com/aisharahman/gofetch",
      },
    ],
    whyHire: [
      "Real production-style API experience — not just coursework — across Node.js, Python and Go.",
      "Strong portfolio evidence: two deployed projects with measurable outcomes and public GitHub code.",
      "Demonstrated ownership of deployment and CI (AWS, Docker, GitHub Actions), reducing onboarding cost.",
      "Intent signal is high — actively looking and available within a month.",
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
    location: "Petaling Jaya",
    availability: "Available immediately",
    preferredRoles: ["Data Analyst Intern", "Business Intelligence Analyst", "Data Analyst"],
    matchKeywords: ["data", "analytics", "sql", "dashboard", "reporting", "visualisation", "statistics", "insights"],
    skills: ["SQL", "Python", "pandas", "Data Visualisation", "Statistics", "Excel"],
    tools: ["Power BI", "Tableau", "Google Sheets", "Jupyter", "BigQuery"],
    industries: ["Retail", "FMCG", "Banking"],
    salaryExpectation: "RM 2,800 – RM 3,400 / month",
    fitScoreBase: 81,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Data-focused fresh graduate from Sunway University who turns messy spreadsheets into clear dashboards. Strong SQL and Python, with several end-to-end analytics projects covering sales and operations data.",
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
    location: "Cyberjaya",
    availability: "Available in 2 weeks",
    preferredRoles: ["Product Associate", "UX Designer", "Product/UX Associate", "Associate Product Manager"],
    matchKeywords: ["product", "ux", "ui", "design", "user research", "prototyping", "wireframe", "usability"],
    skills: ["User Research", "Wireframing", "Prototyping", "Usability Testing", "UX Writing"],
    tools: ["Figma", "Maze", "Notion", "Miro", "FigJam"],
    industries: ["EdTech", "HealthTech", "Consumer apps"],
    salaryExpectation: "RM 2,900 – RM 3,500 / month",
    fitScoreBase: 78,
    intentSignal: "Open to offers",
    readiness: "Portfolio-ready",
    cvSummary:
      "Multimedia University graduate who blends user research with clean, accessible interface design. Has run real usability sessions and shipped redesigns backed by evidence rather than opinion.",
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
    location: "Kuala Lumpur",
    availability: "Available in 1 month",
    preferredRoles: ["Cybersecurity Analyst", "SOC Analyst", "IT Security Intern", "Information Security Analyst"],
    matchKeywords: ["cybersecurity", "security", "soc", "threat", "siem", "networking", "incident", "vulnerability", "it"],
    skills: ["Network Security", "Threat Detection", "Incident Response", "Vulnerability Assessment", "Linux"],
    tools: ["Wireshark", "Splunk", "Nmap", "Burp Suite", "Kali Linux"],
    industries: ["Banking", "Telco", "Government"],
    salaryExpectation: "RM 3,000 – RM 3,800 / month",
    fitScoreBase: 77,
    intentSignal: "Actively looking",
    readiness: "Interview-ready",
    cvSummary:
      "Asia Pacific University graduate focused on defensive security. Hands-on with packet analysis, SIEM dashboards and basic penetration testing, plus a CompTIA Security+ certification.",
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
    location: "Kuala Lumpur",
    availability: "Available in 3 weeks",
    preferredRoles: ["Finance Graduate Analyst", "Business Analyst", "Investment Analyst", "Financial Analyst"],
    matchKeywords: ["finance", "business analyst", "financial modelling", "valuation", "accounting", "forecasting", "excel"],
    skills: ["Financial Modelling", "Valuation", "Forecasting", "Accounting", "Business Analysis"],
    tools: ["Excel", "PowerPoint", "SQL", "Bloomberg Terminal", "Power BI"],
    industries: ["Investment Banking", "Consulting", "Corporate Finance"],
    salaryExpectation: "RM 3,000 – RM 3,600 / month",
    fitScoreBase: 76,
    intentSignal: "Open to offers",
    readiness: "Interview-ready",
    cvSummary:
      "Finance graduate from Universiti Teknologi MARA with strong Excel modelling and a CFA Level I pass. Comfortable translating financial data into clear recommendations for non-finance stakeholders.",
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
    location: "Shah Alam",
    availability: "Available immediately",
    preferredRoles: ["Frontend Developer", "Software Engineer Intern", "Web Developer", "Full-Stack Engineer"],
    matchKeywords: ["frontend", "react", "web", "ui", "javascript", "typescript", "responsive", "accessibility"],
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Accessibility"],
    tools: ["Git", "Figma", "Vite", "Vercel", "Storybook"],
    industries: ["SaaS", "E-commerce", "Media"],
    salaryExpectation: "RM 2,900 – RM 3,500 / month",
    fitScoreBase: 79,
    intentSignal: "Actively looking",
    readiness: "Portfolio-ready",
    cvSummary:
      "Universiti Teknologi Malaysia graduate who builds fast, accessible web interfaces with React and Next.js. Cares about performance budgets and shipping polished, responsive UIs.",
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
        link: "github.com/sofeaaziz/warung-web",
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
    location: "Penang",
    availability: "Available in 1 month",
    preferredRoles: ["Machine Learning Intern", "Data Scientist", "AI Engineer", "Data Analyst"],
    matchKeywords: ["machine learning", "ml", "ai", "python", "data science", "model", "nlp", "deep learning"],
    skills: ["Python", "Machine Learning", "pandas", "scikit-learn", "NLP", "Statistics"],
    tools: ["Jupyter", "TensorFlow", "Hugging Face", "Git", "Google Colab"],
    industries: ["AI / ML", "Manufacturing", "Healthcare"],
    salaryExpectation: "RM 3,000 – RM 3,800 / month",
    fitScoreBase: 75,
    intentSignal: "Open to offers",
    readiness: "Building portfolio",
    cvSummary:
      "Universiti Sains Malaysia graduate applying machine learning to real problems. Strong Python foundations with applied projects in classification and NLP.",
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
    location: "Johor Bahru",
    availability: "Available in 2 weeks",
    preferredRoles: ["Digital Marketing Executive", "Growth Analyst", "Marketing Associate", "Content Strategist"],
    matchKeywords: ["marketing", "digital marketing", "seo", "growth", "content", "social media", "campaign", "analytics"],
    skills: ["SEO", "Content Strategy", "Marketing Analytics", "Copywriting", "Social Media"],
    tools: ["Google Analytics", "Meta Ads", "Canva", "Mailchimp", "Google Search Console"],
    industries: ["E-commerce", "F&B", "Startups"],
    salaryExpectation: "RM 2,600 – RM 3,200 / month",
    fitScoreBase: 73,
    intentSignal: "Open to offers",
    readiness: "Portfolio-ready",
    cvSummary:
      "Taylor's University graduate who grows audiences with data-led content and SEO. Has run real campaigns with tracked results for small local brands.",
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
// Deterministic search / ranking.
//
// Tokenise the query, then score each candidate by a base fit plus weighted
// overlap against their roles, keywords, skills, tools and project evidence.
// The ranking is stable for a given query (no randomness).
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "with", "and", "the", "for", "a", "an", "of", "in", "to", "or", "looking", "who", "can",
]);

export const DEFAULT_ROLE = "Software Engineer Intern";

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// Each field category contributes a different weight when a query token hits it.
const FIELD_WEIGHTS: { key: keyof EmployerCandidate | "projects"; points: number }[] = [
  { key: "preferredRoles", points: 8 },
  { key: "matchKeywords", points: 6 },
  { key: "skills", points: 5 },
  { key: "tools", points: 4 },
  { key: "projects", points: 3 },
];

function labelsForField(candidate: EmployerCandidate, key: string): string[] {
  if (key === "projects") {
    return candidate.projects.flatMap((p) => [p.name, ...p.skills]);
  }
  return (candidate[key as keyof EmployerCandidate] as string[]) ?? [];
}

function tokenMatchesLabel(token: string, label: string): boolean {
  const l = label.toLowerCase();
  return l.includes(token) || token.includes(l);
}

export function rankCandidates(rawQuery: string): CandidateSearchResult[] {
  const query = rawQuery.trim() || DEFAULT_ROLE;
  const tokens = tokenize(query);

  const results = CANDIDATES.map((candidate) => {
    let score = candidate.fitScoreBase;
    const matched = new Set<string>();

    for (const token of tokens) {
      // For each token take the highest-weighted category it hits, so a token
      // isn't double-counted, but record the human-readable matched label.
      let bestPoints = 0;
      let bestLabel: string | null = null;

      for (const { key, points } of FIELD_WEIGHTS) {
        const hit = labelsForField(candidate, key).find((label) => tokenMatchesLabel(token, label));
        if (hit && points > bestPoints) {
          bestPoints = points;
          bestLabel = hit;
        }
      }

      if (bestLabel) {
        score += bestPoints;
        matched.add(bestLabel);
      }
    }

    return {
      candidate,
      score: Math.min(99, Math.round(score)),
      matchedTerms: Array.from(matched).slice(0, 6),
    };
  });

  // Sort by score desc; tie-break by base fit then name for stability.
  return results.sort(
    (a, b) =>
      b.score - a.score ||
      b.candidate.fitScoreBase - a.candidate.fitScoreBase ||
      a.candidate.name.localeCompare(b.candidate.name)
  );
}

/** Build a simulated WhatsApp-style intro message (no real send). */
export function buildIntroMessage(
  candidate: EmployerCandidate,
  role: string,
  slotLabel?: string | null
): string {
  const firstName = candidate.name.split(" ")[0];
  const project = candidate.projects[0];
  const topSkills = candidate.skills.slice(0, 2).join(" / ");
  const roleText = role.trim() || DEFAULT_ROLE;
  const closing = slotLabel
    ? `Are you open to a 20-minute chat on ${slotLabel}?`
    : "Are you open to a quick 20-minute intro chat this week?";

  return [
    `Hi ${firstName}, I'm from the hiring team at [Your Company].`,
    `Tenun matched you to our ${roleText} role because of your ${project.name} project, your ${topSkills} experience, and your portfolio evidence.`,
    closing,
  ].join(" ");
}
