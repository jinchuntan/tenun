/**
 * Controlled knowledge base for the Tenun Guide mascot chatbot.
 *
 * This is the ONLY source of truth the site-guide model is allowed to answer
 * from (alongside the current page context and the visible conversation). It is
 * intentionally hand-written and conservative — if a fact is not in here, the
 * guide must not invent it and should escalate to the Tenun team instead.
 *
 * Keep this file free of secrets, internal implementation details, pricing, and
 * partnership claims. It is serialized into the system prompt on every request.
 */

export type GuideAction = {
  label: string;
  href: string;
};

export type GuideTopic = {
  /** Short id used for grouping/debugging. */
  id: string;
  /** Plain-language summary the model can paraphrase from. */
  summary: string;
  /** Optional suggested actions tied to this topic. */
  actions?: GuideAction[];
};

/**
 * Canonical suggested actions. The model is told to reuse these hrefs verbatim
 * so we never end up with broken or invented links.
 */
export const GUIDE_ACTIONS = {
  searchCareers: { label: "Search careers", href: "/#hero-search" },
  uploadCv: { label: "Upload CV / Portfolio", href: "/profile?upload=true&from=guide" },
  openDashboard: { label: "Open dashboard", href: "/dashboard" },
  buildCv: { label: "Build my CV", href: "/dashboard/cv/new?upload=true" },
  employerPage: { label: "Go to employer page", href: "/employers" },
  postRole: { label: "Post a role", href: "/employers#employer-form" },
} as const satisfies Record<string, GuideAction>;

export const SITE_GUIDE_KNOWLEDGE: {
  productName: string;
  oneLiner: string;
  topics: GuideTopic[];
  doNot: string[];
} = {
  productName: "Tenun",
  oneLiner:
    "Tenun is a career discovery and CV/profile platform for students, fresh graduates, and early-career users — and it now has an employer-facing side too.",

  topics: [
    {
      id: "what-is-tenun",
      summary:
        "Tenun helps students, fresh graduates, and early-career users discover career paths even when they don't know the exact job title. You describe what you enjoy, and Tenun maps that to possible job titles. It gives role suggestions, salary ranges, day-to-day descriptions, required skills, and next steps. Tenun does NOT guarantee employment outcomes.",
      actions: [GUIDE_ACTIONS.searchCareers],
    },
    {
      id: "what-is-a-weaver",
      summary:
        "A 'Weaver' is the Tenun way of describing a user weaving their own career path. On the Weaver landing page you type what you enjoy into the hero search bar, and Tenun returns 6 different role suggestions. Clicking a role opens a detailed breakdown, and later you can build your profile and upload a CV.",
      actions: [GUIDE_ACTIONS.searchCareers],
    },
    {
      id: "career-search",
      summary:
        "To search for careers, go to the home page and type what you enjoy doing into the hero search bar (for example 'I like working with data' or 'helping people'). You don't need to know a job title. Tenun returns 6 genuinely different role suggestions you can explore.",
      actions: [GUIDE_ACTIONS.searchCareers],
    },
    {
      id: "search-bar-tips",
      summary:
        "The career search bar works best when you describe activities you enjoy or are curious about, not a job title. Plain everyday language is fine. Tenun then suggests matching roles for you to compare.",
      actions: [GUIDE_ACTIONS.searchCareers],
    },
    {
      id: "job-suggestions",
      summary:
        "Job suggestions are possible career paths that match what you described — they are starting points to explore, not guarantees. Each suggestion can be opened for a fuller breakdown of what the role involves and what it takes to get there.",
      actions: [GUIDE_ACTIONS.searchCareers],
    },
    {
      id: "job-detail-page",
      summary:
        "A job detail page shows the required skills, nice-to-have skills, the role's 'secret sauce', fit questions, common candidate gaps, and entry paths. Its main call-to-action points you toward building your profile/CV so you're ready to pursue the role.",
      actions: [GUIDE_ACTIONS.buildCv],
    },
    {
      id: "profile-upload",
      summary:
        "On the profile/upload page you can upload your CV, resume, or portfolio document, which helps pre-fill your career profile. You can also fill in details manually instead. If you arrive via /profile?upload=true, the upload section is highlighted for you.",
      actions: [GUIDE_ACTIONS.uploadCv],
    },
    {
      id: "dashboard",
      summary:
        "The dashboard shows your career weave, pathways, skills, opportunities, atlas, mentors, outreach, and CV/portfolio sections. The 'Upload CV / Portfolio' button takes you back to the upload page, and the 'CV / Portfolio' section lets you build or import a CV.",
      actions: [GUIDE_ACTIONS.openDashboard, GUIDE_ACTIONS.uploadCv],
    },
    {
      id: "cv-builder",
      summary:
        "In the CV builder you can create a new CV, choose a style, upload an existing CV, and edit each section. You can also add portfolio sections inside the CV builder.",
      actions: [GUIDE_ACTIONS.buildCv],
    },
    {
      id: "employer-page",
      summary:
        "On the employer page, employers can learn how Tenun helps them find better-fit early-career candidates. It includes a candidate preview, a comparison versus traditional job boards, and a role intake form. Employers submit a role through the employer onboarding form.",
      actions: [GUIDE_ACTIONS.employerPage, GUIDE_ACTIONS.postRole],
    },
    {
      id: "employer-post-role",
      summary:
        "To post a role as an employer, go to the employer page and fill in the employer onboarding form (the role intake form). Submitting that form is how a role is sent to the Tenun team.",
      actions: [GUIDE_ACTIONS.postRole],
    },
    {
      id: "where-next",
      summary:
        "If you're unsure where to go next: start with career search on the home page, open a role you like to read its breakdown, then upload your CV or build one from your dashboard. Employers should head to the employer page.",
      actions: [
        GUIDE_ACTIONS.searchCareers,
        GUIDE_ACTIONS.uploadCv,
        GUIDE_ACTIONS.employerPage,
      ],
    },
  ],

  doNot: [
    "Do not guarantee career or hiring outcomes.",
    "Do not give legal, financial, medical, or immigration advice.",
    "Do not invent pages, features, partnerships, pricing, or policies.",
    "Do not claim a form was submitted unless the user clearly did so.",
    "Do not ask for or store sensitive personal information or full CV contents.",
    "Do not mention internal implementation details.",
    "Do not answer questions unrelated to Tenun beyond a gentle redirect.",
  ],
};

/**
 * Resolve the support email at runtime. Exposed as a NEXT_PUBLIC_ var so both
 * the API route and the client widget can show the same address.
 *
 * TODO(dev): set NEXT_PUBLIC_TENUN_SUPPORT_EMAIL in your environment. Until then
 * the UI falls back to this safe placeholder rather than a real personal email.
 */
export const SUPPORT_EMAIL_PLACEHOLDER = "support@tenun.example";

export function getSupportEmail(): string {
  const fromEnv = process.env.NEXT_PUBLIC_TENUN_SUPPORT_EMAIL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : SUPPORT_EMAIL_PLACEHOLDER;
}

/** Serialize the knowledge base for embedding into the system prompt. */
export function knowledgeAsPromptText(): string {
  const lines: string[] = [];
  lines.push(`PRODUCT: ${SITE_GUIDE_KNOWLEDGE.productName}`);
  lines.push(`SUMMARY: ${SITE_GUIDE_KNOWLEDGE.oneLiner}`);
  lines.push("");
  lines.push("KNOWLEDGE TOPICS:");
  for (const topic of SITE_GUIDE_KNOWLEDGE.topics) {
    lines.push(`- [${topic.id}] ${topic.summary}`);
    if (topic.actions?.length) {
      const actions = topic.actions.map((a) => `"${a.label}" -> ${a.href}`).join("; ");
      lines.push(`  suggestedActions: ${actions}`);
    }
  }
  lines.push("");
  lines.push("HARD CONSTRAINTS:");
  for (const rule of SITE_GUIDE_KNOWLEDGE.doNot) {
    lines.push(`- ${rule}`);
  }
  return lines.join("\n");
}
