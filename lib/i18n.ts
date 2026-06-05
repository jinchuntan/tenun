/**
 * Lightweight internal i18n for Tenun — English (en) and Bahasa Melayu (ms).
 *
 * No heavy i18n package: just a typed dictionary plus a dot-path helper. The
 * English tree (`en`) is the source of truth for the shape; `ms` must mirror it
 * exactly (the `Translations` type enforces this at compile time).
 *
 * Bahasa Melayu here is Malaysian Malay — friendly and clear for students and
 * fresh graduates, not formal government-style. "Tenun" and "Weaver" are kept
 * as product terms.
 */

export type Locale = "en" | "ms";

export const LOCALES: Locale[] = ["en", "ms"];

/** Short label shown in the navbar switcher. */
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", ms: "BM" };

const en = {
  nav: {
    forWeavers: "For Weavers",
    forEmployers: "For Employers",
    signIn: "Sign In",
    signUp: "Sign Up",
    dashboard: "Dashboard",
    signOut: "Sign out",
    language: "Language",
    english: "English",
    malay: "Bahasa Melayu",
    helpFaq: "Help & FAQ",
    notifications: "Notifications",
  },
  home: {
    heroTitleLine1: "Don't know the job title",
    heroTitleLine2: "you're looking for?",
    heroTitleLine3: "We got you, Weaver.",
    heroSubtitle:
      "Whether you're just starting out or ready for your next move, tell us what you enjoy and we'll find the right career path and connect you to real jobs at top Malaysian companies.",
    searchPlaceholder: "e.g. I want to work with data, or I like designing things...",
    explore: "Explore",
    weaving: "Weaving...",
    searchAria: "Describe the kind of work you want to do",
    exampleQueries: [
      "I want to build mobile apps",
      "I like working with data and numbers",
      "I want to do 3D animations",
      "I like designing user interfaces",
      "I want to help people with money",
      "I'm into AI and machine learning",
    ],
    tip: "Tip: describing what you enjoy gets better results, e.g.",
    overviewLabel: "Career space overview",
    alsoExplore: "Also explore:",
    broadPrefix: "is broad. Want more specific results? Try:",
    resultsHeadingPrefix: "6 roles that match",
    resultsHeadingSuffix: ". Click any to see what it takes.",
    emptyTitle: "We couldn't pin down specific roles for that.",
    emptyBody:
      "Try describing what you actually enjoy doing. The more specific, the better the match.",
    errorTitle: "Something went wrong",
    errorGeneric: "Something went wrong.",
    errorFailed: "Failed to get suggestions.",
  },
  threeSteps: {
    eyebrow: "Simple. Fast. No fluff.",
    titleLine1: "From curious to",
    titleLine2: "career-ready in 3 steps.",
    steps: [
      {
        title: "Search in plain language",
        body: "No job title needed. Type what you enjoy — 'I like working with numbers' or 'I want to make things look good.' Tenun maps it to 6 real careers.",
      },
      {
        title: "See what it actually takes",
        body: "Click any role to see the required skills, salary range, the secret sauce that sets top candidates apart, and an honest fit check.",
      },
      {
        title: "Get your personalised path",
        body: "Sign in and upload your CV. We show exactly how you fit, what to improve, and match you to open roles at top Malaysian companies.",
      },
    ],
  },
  partners: {
    eyebrow: "Our proven partners.",
    titleLine1: "We partner with the companies",
    titleLine2: "you want to work for.",
    subtitle:
      "Every candidate is vetted by Tenun before being recommended, so partners know you're more than just another application.",
    browseAll: "Browse all companies",
  },
  companyTicker: {
    label: "Now hiring through Tenun",
    rolesOpen: "roles open",
  },
  employerTicker: {
    label: "Hiring signals through Tenun",
    signals: [
      "Role fit signals",
      "Portfolio evidence",
      "CV readiness",
      "Skill gap clarity",
      "Interview intent",
      "Availability signals",
      "Salary expectation fit",
      "Culture fit context",
      "Career pathway match",
      "Early talent readiness",
    ],
  },
  weaverFeatures: {
    eyebrow: "For Weavers.",
    title: "Built for people who don't know their job title yet.",
    subtitle:
      "Most platforms expect you to already know what you want. Tenun starts from where you actually are.",
    prev: "Previous feature",
    next: "Next feature",
    cards: [
      {
        title: "Job discovery, not just job search",
        body: "Type what you enjoy. Get 6 real job titles you may not have known existed, each with salary ranges, day-to-day breakdowns, and required skills.",
      },
      {
        title: "The secret sauce, not just job descriptions",
        body: "Learn what actually separates candidates who get hired from those who don't, for every role you explore. No generic advice.",
      },
      {
        title: "Your path, not just a list",
        body: "Upload your CV and see what to improve, what to build, and how to position yourself for the roles you actually want.",
      },
    ],
  },
  cvSupport: {
    titleLine1: "Don't stress.",
    titleLine2: "We've got you.",
    paragraph:
      "Most people don't know where to start — and that's completely fine. We build your CV with you, keep it sharp as you grow, and make sure you're always ready when the right door opens.",
    viewSample: "View Sample",
    buildCv: "Build my CV",
    ctaNote: "Ready to build yours? Free for Weavers. No credit card required.",
    stats: [
      {
        stat: "7 sec",
        label: "average recruiter scan time",
        body: "Numbers and keywords are the only things that stop the scroll. Generic descriptions get skipped instantly.",
      },
      {
        stat: "85%",
        label: "of CVs rejected by ATS before a human reads them",
        body: "Tenun matches your skills to exactly what each company's system scans for — so you actually get seen.",
      },
      {
        stat: "3x",
        label: "more callbacks with a targeted summary",
        body: "Your opening line should answer one question: why should I keep reading?",
      },
      {
        stat: "90%",
        label: "of recruiters verify candidates online",
        body: "LinkedIn and GitHub signal confidence and make their job easier. Adding them takes 10 seconds.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions we get a lot.",
    items: [
      {
        q: "What is Tenun?",
        a: "Tenun is a career discovery platform that helps students and fresh graduates find the right job title — even when they don't know what they're looking for. You describe what you enjoy doing, and Tenun maps it to real job titles with salary ranges, required skills, and a step-by-step path to get there. Tenun is powered by TalentBank, Malaysia's leading talent placement platform.",
      },
      {
        q: "How does Tenun find the right job for me?",
        a: "You type what you enjoy in plain language. Tenun uses AI to map your description to 6 real job titles, then explains what each one actually involves — day-to-day tasks, salary ranges, required skills, and the 'secret sauce' that separates good candidates from great ones.",
      },
      {
        q: "Do I need to know my job title to use Tenun?",
        a: "No — that's the whole point. Most job boards assume you already know what to search for. Tenun starts from what you enjoy doing ('I like working with data' or 'I want to design things') and works backwards to find the right career path for you.",
      },
      {
        q: "What companies are hiring through Tenun?",
        a: "Tenun partners with Unilever, Maybank, Petronas, Shell, Lazada, EY, American Express, and Top Glove in Malaysia. These companies post jobs directly through TalentBank's network rather than blindly on LinkedIn, so every candidate they see has been career-matched and vetted.",
      },
      {
        q: "Is Tenun free to use?",
        a: "Yes. Discovering jobs, exploring career paths, and reading full role breakdowns are all free. Creating an account (with Google) lets you save your results, upload your CV, and get matched to live job openings at our partner companies.",
      },
      {
        q: "How is Tenun different from LinkedIn or JobStreet?",
        a: "LinkedIn and JobStreet require you to know your job title. Tenun doesn't. We also give you the full roadmap — what skills you need, what the secret advantage is for each role, and which real companies are hiring. Think of it less like a job board and more like a career GPS.",
      },
    ],
  },
  footer: {
    tagline:
      "Career discovery for students and fresh graduates who don't know their job title yet. Built with TalentBank, Malaysia's leading talent placement platform.",
    forWeavers: "For Weavers",
    forEmployers: "For Employers",
    weaverLinks: ["How it works", "Career discovery", "Build CV", "FAQ"],
    employerLinks: ["Why Tenun?", "Post a role", "Candidate matching", "Recruiter preview"],
    rights: "All rights reserved.",
    disclaimer:
      "Tenun helps you explore possibilities. It does not guarantee employment outcomes.",
  },
  employerHero: {
    badge: "For Employers",
    titlePrefix: "Hire candidates who already know",
    titleHighlight: "why they fit.",
    subtitle:
      "Tenun helps employers discover students and fresh graduates who have explored the role, built a profile, and understand what it takes — before they apply.",
    rolePlaceholder: "What role are you hiring for?",
    findCandidates: "Find matched candidates",
    postRole: "Post a role",
    viewPreview: "View candidate preview",
  },
  employerSteps: {
    eyebrow: "Simple. Faster. Better signal.",
    titleLine1: "From open role to warm",
    titleLine2: "shortlist in 3 steps.",
    steps: [
      {
        title: "Post the role once",
        body: "Tell us the role, required skills, salary range, location, and what a strong candidate actually needs to show.",
      },
      {
        title: "Tenun matches for intent and fit",
        body: "We look beyond keywords by using candidate skills, interests, CV signals, portfolio evidence, and role readiness.",
      },
      {
        title: "Review a warmer shortlist",
        body: "See candidates who have already explored the role, understood the gaps, and prepared a stronger application.",
      },
    ],
  },
  candidateSignal: {
    titleLine1: "Not just CVs. Candidate signal",
    titleLine2: "you can actually use.",
    subtitle:
      "Tenun helps you understand why someone fits before you spend time screening.",
    cards: [
      {
        badge: "82% Role Fit",
        body: "Final-year data student with dashboard projects, SQL experience, and interest in financial services.",
      },
      {
        badge: "Portfolio Ready",
        body: "Includes GitHub, case study, project write-up, and a role-specific CV summary.",
      },
      {
        badge: "Skill Gap Visible",
        body: "Strong in Python and Excel. Still building stakeholder communication and business storytelling.",
      },
      {
        badge: "Interview Signal",
        body: "Candidate has answered role-fit questions and understands the day-to-day expectations.",
      },
      {
        badge: "Ready to Apply",
        body: "Candidate has matched their CV, target role, salary expectation, and availability.",
      },
    ],
  },
  comparison: {
    title: "Why Tenun, not just another job board?",
    subtitle: "Traditional job boards give you volume. Tenun gives you context.",
    jobBoardsTitle: "Traditional job boards",
    jobBoards: [
      "Many cold applicants",
      "Keyword-heavy CVs",
      "Candidates apply blindly",
      "Recruiters screen manually",
      "Weak signal on motivation and fit",
    ],
    tenun: [
      "Smaller, warmer shortlist",
      "Skill, interest, and role-fit context",
      "Candidates understand the role before applying",
      "Candidate signals are structured before review",
      "Better visibility into readiness and gaps",
    ],
  },
  portalPreview: {
    title: "See the shortlist before you start screening.",
    subtitle:
      "Preview candidate fit, portfolio readiness, and skill gaps in one place.",
    openRole: "Open role",
    roleTitle: "Data Analyst Intern",
    matchingLive: "Matching live",
    statLabels: [
      "Matched candidates",
      "Strong matches",
      "Portfolio-ready",
      "Needs review",
    ],
    fitSuffix: "% fit",
    candidateInterests: [
      "Interested in banking",
      "Interested in consulting",
      "Interested in FMCG",
    ],
    note: "Preview only — illustrative candidate data.",
  },
  employerForm: {
    title: "Start with one role. We'll help you find better-fit early talent.",
    subtitle:
      "Submit your hiring need and we'll help you understand what kind of candidates Tenun can surface.",
    successTitle: "Thanks — we've received your role.",
    successBody: "The Tenun team will review it and follow up soon.",
    company: "Company name",
    companyPlaceholder: "e.g. Acme Sdn Bhd",
    name: "Your name",
    namePlaceholder: "e.g. Aisha Lim",
    email: "Work email",
    emailPlaceholder: "you@company.com",
    role: "Role title",
    rolePlaceholder: "e.g. Data Analyst Intern",
    hiringTypeLabel: "Hiring type",
    hiringTypes: ["Internship", "Graduate role", "Entry-level", "Project-based"],
    location: "Location",
    locationPlaceholder: "e.g. Kuala Lumpur / Remote",
    description: "Short role description",
    descriptionPlaceholder:
      "What will this person work on, and what does a strong candidate need to show?",
    prioritiesLabel: "What matters most?",
    priorities: ["Skills", "Portfolio", "Culture fit", "Availability", "Salary fit"],
    submit: "Submit role for matching",
    submitting: "Submitting...",
    errCompany: "Company name is required.",
    errName: "Your name is required.",
    errEmail: "Work email is required.",
    errEmailInvalid: "Enter a valid email.",
    errRole: "Role title is required.",
  },
  employerFaq: {
    eyebrow: "FAQ",
    title: "Questions employers ask us.",
    items: [
      {
        q: "Is Tenun just another job board?",
        a: "No. Tenun helps candidates understand roles before they apply, so employers receive more context-rich applications rather than cold CVs.",
      },
      {
        q: "Can we post internships and graduate roles?",
        a: "Yes. Tenun is especially useful for internships, graduate programmes, entry-level roles, and project-based early-career hiring.",
      },
      {
        q: "How does matching work?",
        a: "Tenun uses candidate profile data, skills, interests, CV signals, portfolio evidence, and role expectations to surface stronger-fit candidates.",
      },
      {
        q: "Do we get access to full candidate details?",
        a: "For the MVP, employers can request access to shortlisted candidates after submitting a role. A full recruiter portal can be added later.",
      },
      {
        q: "Can this support campus hiring?",
        a: "Yes. Tenun is designed for students and fresh graduates, so it works well for campus hiring, graduate roles, and early-career pipelines.",
      },
    ],
  },
  jobDetail: {
    backToResults: "Back to results",
    notFoundTitle: "Job not found",
    notFoundBody:
      "This usually happens if you navigated directly to this page. Search for a job first.",
    backToSearch: "Back to search",
    skillsYouNeed: "Skills you need",
    mustHave: "Must-have",
    niceToHave: "Nice to have",
    secretSauce: "The secret sauce",
    fitTitle: "Are you a good fit? Ask yourself:",
    commonGaps: "What most candidates are missing",
    howToGetThere: "How to get here as a student or fresh grad",
    startWith: "Start with:",
    companiesHiring: "Companies hiring for this role",
    companiesNote:
      "These TalentBank partners are actively looking for qualified candidates.",
    ctaTitle: "See exactly how you fit this role",
    ctaBodyPrefix:
      "Sign in to upload your CV and find out your skill gap, match score, and how to get in front of companies hiring for",
    ctaBodySuffix: ". Free for Weavers — one tap, no forms.",
    buildCvForRole: "Build my CV for this role",
    loadError: "Couldn't load the full breakdown. Try refreshing.",
  },
  guide: {
    header: "Tenun Guide",
    subheader: "Ask me where to go next.",
    placeholder: "Ask me anything about Tenun…",
    needHelp: "Need help? 👋",
    close: "Close Tenun Guide",
    open: "Open Tenun Guide",
    send: "Send message",
    greetings: {
      home: "Hi, I'm your Tenun guide! Tell me what you're trying to do, or I can help you start with career search.",
      jobs: "Looking at a role? I can break down what it means and how to tell if it fits you.",
      profile:
        "You're on the profile page. I can help you upload your CV, fill this manually, or understand what happens next.",
      dashboard:
        "Welcome to your dashboard! I can help you make sense of what you're seeing or get your CV going.",
      employers:
        "You're on the employer page. I can help you post a role or understand how Tenun matches candidates.",
      default:
        "Hi, I'm your Tenun guide! Ask me where to go next and I'll point you the right way.",
    },
    quickActions: {
      home: ["How do I start?", "What should I type?", "Build my CV"],
      jobs: [
        "What does this role mean?",
        "How do I know if I fit?",
        "Build my CV for this role",
      ],
      profile: [
        "How do I upload my CV?",
        "Can I fill this manually?",
        "What happens after this?",
      ],
      dashboard: [
        "What am I looking at?",
        "Where is my skill gap?",
        "Upload CV / Portfolio",
      ],
      employers: [
        "How do employers use Tenun?",
        "How do I post a role?",
        "Show candidate preview",
      ],
      default: ["What is Tenun?", "How do I search careers?", "Build my CV"],
    },
    rateLimited:
      "I'm getting a lot of questions right now — give me a moment and try again.",
    errorWithEmail: "Something went wrong on my end. You can always reach the Tenun team at",
    cannotReach: "I couldn't reach my brain just now. Please try again, or contact the Tenun team at",
  },
};

/** The shape every locale must satisfy (derived from the English source tree). */
export type Translations = typeof en;

const ms: Translations = {
  nav: {
    forWeavers: "Untuk Weavers",
    forEmployers: "Untuk Majikan",
    signIn: "Log Masuk",
    signUp: "Daftar",
    dashboard: "Papan Pemuka",
    signOut: "Log Keluar",
    language: "Bahasa",
    english: "English",
    malay: "Bahasa Melayu",
    helpFaq: "Bantuan & Soalan Lazim",
    notifications: "Pemberitahuan",
  },
  home: {
    heroTitleLine1: "Tak tahu nama kerja",
    heroTitleLine2: "yang anda cari?",
    heroTitleLine3: "Tenun bantu anda, Weaver.",
    heroSubtitle:
      "Sama ada anda baru bermula atau bersedia untuk langkah seterusnya, beritahu kami apa yang anda minat dan kami akan bantu cari laluan kerjaya yang sesuai serta hubungkan anda dengan peluang kerja di syarikat terkemuka Malaysia.",
    searchPlaceholder: "cth. Saya suka bekerja dengan data, atau saya suka mereka bentuk...",
    explore: "Teroka",
    weaving: "Menenun...",
    searchAria: "Terangkan jenis kerja yang anda mahu lakukan",
    exampleQueries: [
      "Saya nak bina aplikasi mudah alih",
      "Saya suka bekerja dengan data dan nombor",
      "Saya nak buat animasi 3D",
      "Saya suka mereka bentuk antara muka pengguna",
      "Saya nak bantu orang uruskan kewangan",
      "Saya minat AI dan pembelajaran mesin",
    ],
    tip: "Petua: ceritakan apa yang anda minat untuk hasil lebih tepat, cth.",
    overviewLabel: "Gambaran ruang kerjaya",
    alsoExplore: "Teroka juga:",
    broadPrefix: "agak luas. Mahu hasil lebih spesifik? Cuba:",
    resultsHeadingPrefix: "6 kerjaya yang sepadan dengan",
    resultsHeadingSuffix: ". Klik mana-mana untuk lihat apa yang diperlukan.",
    emptyTitle: "Kami tak dapat kenal pasti peranan khusus untuk itu.",
    emptyBody:
      "Cuba terangkan apa yang anda betul-betul suka buat. Lebih spesifik, lebih tepat padanannya.",
    errorTitle: "Ada sesuatu yang tidak kena",
    errorGeneric: "Ada sesuatu yang tidak kena.",
    errorFailed: "Gagal mendapatkan cadangan.",
  },
  threeSteps: {
    eyebrow: "Mudah. Pantas. Tiada basa-basi.",
    titleLine1: "Daripada ingin tahu kepada",
    titleLine2: "bersedia berkerjaya dalam 3 langkah.",
    steps: [
      {
        title: "Cari dalam bahasa biasa",
        body: "Tak perlu nama jawatan. Taip apa yang anda minat — 'Saya suka bekerja dengan nombor' atau 'Saya nak buat benda nampak cantik.' Tenun petakan ia kepada 6 kerjaya sebenar.",
      },
      {
        title: "Lihat apa yang sebenarnya diperlukan",
        body: "Klik mana-mana peranan untuk lihat kemahiran diperlukan, julat gaji, rahsia yang membezakan calon terbaik, dan semakan kesesuaian yang jujur.",
      },
      {
        title: "Dapatkan laluan peribadi anda",
        body: "Log masuk dan muat naik CV anda. Kami tunjukkan dengan tepat bagaimana anda sesuai, apa yang perlu diperbaiki, dan padankan anda dengan peranan terbuka di syarikat terkemuka Malaysia.",
      },
    ],
  },
  partners: {
    eyebrow: "Rakan kongsi terbukti kami.",
    titleLine1: "Kami bekerjasama dengan syarikat",
    titleLine2: "yang anda idamkan.",
    subtitle:
      "Setiap calon disaring oleh Tenun sebelum disyorkan, jadi rakan kongsi tahu anda lebih daripada sekadar satu lagi permohonan.",
    browseAll: "Lihat semua syarikat",
  },
  companyTicker: {
    label: "Sedang mengambil calon melalui Tenun",
    rolesOpen: "jawatan dibuka",
  },
  employerTicker: {
    label: "Isyarat pengambilan melalui Tenun",
    signals: [
      "Isyarat kesesuaian peranan",
      "Bukti portfolio",
      "Kesediaan CV",
      "Kejelasan jurang kemahiran",
      "Niat temuduga",
      "Isyarat ketersediaan",
      "Kesesuaian jangkaan gaji",
      "Konteks kesesuaian budaya",
      "Padanan laluan kerjaya",
      "Kesediaan bakat awal",
    ],
  },
  weaverFeatures: {
    eyebrow: "Untuk Weavers.",
    title: "Dibina untuk mereka yang belum tahu nama kerja mereka.",
    subtitle:
      "Kebanyakan platform mahu anda sudah tahu apa yang anda mahu. Tenun bermula daripada tempat anda sebenarnya berada.",
    prev: "Ciri sebelumnya",
    next: "Ciri seterusnya",
    cards: [
      {
        title: "Penemuan kerja, bukan sekadar carian kerja",
        body: "Taip apa yang anda minat. Dapatkan 6 nama jawatan sebenar yang mungkin anda tak tahu wujud, setiap satu dengan julat gaji, gambaran harian, dan kemahiran diperlukan.",
      },
      {
        title: "Rahsia kejayaan, bukan sekadar deskripsi kerja",
        body: "Pelajari apa yang sebenarnya membezakan calon yang diterima bekerja daripada yang tidak, untuk setiap peranan yang anda teroka. Tiada nasihat generik.",
      },
      {
        title: "Laluan anda, bukan sekadar senarai",
        body: "Muat naik CV anda dan lihat apa yang perlu diperbaiki, apa yang perlu dibina, dan cara memposisikan diri untuk peranan yang anda betul-betul mahu.",
      },
    ],
  },
  cvSupport: {
    titleLine1: "Jangan risau.",
    titleLine2: "Kami ada untuk anda.",
    paragraph:
      "Kebanyakan orang tak tahu nak mula di mana — dan itu tak mengapa. Kami bina CV anda bersama anda, kekalkan ia tajam apabila anda berkembang, dan pastikan anda sentiasa bersedia apabila peluang yang betul tiba.",
    viewSample: "Lihat Contoh",
    buildCv: "Bina CV saya",
    ctaNote: "Bersedia untuk bina CV anda? Percuma untuk Weavers. Tiada kad kredit diperlukan.",
    stats: [
      {
        stat: "7 saat",
        label: "purata masa imbasan perekrut",
        body: "Nombor dan kata kunci sahaja yang menghentikan skrol. Deskripsi generik diabaikan serta-merta.",
      },
      {
        stat: "85%",
        label: "CV ditolak oleh ATS sebelum dibaca manusia",
        body: "Tenun padankan kemahiran anda dengan apa yang sistem setiap syarikat imbas — jadi anda betul-betul dilihat.",
      },
      {
        stat: "3x",
        label: "lebih banyak panggilan balik dengan ringkasan disasarkan",
        body: "Ayat pembuka anda perlu menjawab satu soalan: kenapa saya patut terus membaca?",
      },
      {
        stat: "90%",
        label: "perekrut menyemak calon dalam talian",
        body: "LinkedIn dan GitHub menunjukkan keyakinan dan memudahkan kerja mereka. Menambahnya ambil masa 10 saat.",
      },
    ],
  },
  faq: {
    eyebrow: "Soalan Lazim",
    title: "Soalan yang kerap kami terima.",
    items: [
      {
        q: "Apa itu Tenun?",
        a: "Tenun ialah platform penemuan kerjaya yang membantu pelajar dan graduan baharu mencari nama jawatan yang betul — walaupun anda tak tahu apa yang anda cari. Anda terangkan apa yang anda minat, dan Tenun petakan ia kepada nama jawatan sebenar lengkap dengan julat gaji, kemahiran diperlukan, dan laluan langkah demi langkah untuk sampai ke sana. Tenun dikuasakan oleh TalentBank, platform penempatan bakat terkemuka Malaysia.",
      },
      {
        q: "Bagaimana Tenun cari kerja yang sesuai untuk saya?",
        a: "Anda taip apa yang anda minat dalam bahasa biasa. Tenun guna AI untuk petakan deskripsi anda kepada 6 nama jawatan sebenar, kemudian terangkan apa yang setiap satu sebenarnya melibatkan — tugas harian, julat gaji, kemahiran diperlukan, dan 'rahsia kejayaan' yang membezakan calon baik daripada yang hebat.",
      },
      {
        q: "Perlukah saya tahu nama jawatan untuk guna Tenun?",
        a: "Tidak — itulah maksudnya. Kebanyakan papan kerja andaikan anda sudah tahu apa nak cari. Tenun bermula daripada apa yang anda minat ('Saya suka bekerja dengan data' atau 'Saya nak mereka bentuk benda') dan bekerja ke belakang untuk cari laluan kerjaya yang sesuai untuk anda.",
      },
      {
        q: "Syarikat mana yang mengambil pekerja melalui Tenun?",
        a: "Tenun bekerjasama dengan Unilever, Maybank, Petronas, Shell, Lazada, EY, American Express, dan Top Glove di Malaysia. Syarikat ini menyiarkan kerja terus melalui rangkaian TalentBank dan bukannya membuta tuli di LinkedIn, jadi setiap calon yang mereka lihat telah dipadankan kerjaya dan disaring.",
      },
      {
        q: "Adakah Tenun percuma?",
        a: "Ya. Menemui kerja, meneroka laluan kerjaya, dan membaca pecahan penuh peranan semuanya percuma. Membuka akaun (dengan Google) membolehkan anda menyimpan hasil, memuat naik CV, dan dipadankan dengan peluang kerja sebenar di syarikat rakan kongsi kami.",
      },
      {
        q: "Apa beza Tenun dengan LinkedIn atau JobStreet?",
        a: "LinkedIn dan JobStreet memerlukan anda tahu nama jawatan anda. Tenun tidak. Kami juga beri anda peta jalan penuh — kemahiran yang anda perlukan, kelebihan rahsia untuk setiap peranan, dan syarikat sebenar yang sedang mengambil pekerja. Anggap ia kurang seperti papan kerja dan lebih seperti GPS kerjaya.",
      },
    ],
  },
  footer: {
    tagline:
      "Penemuan kerjaya untuk pelajar dan graduan baharu yang belum tahu nama kerja mereka. Dibina bersama TalentBank, platform penempatan bakat terkemuka Malaysia.",
    forWeavers: "Untuk Weavers",
    forEmployers: "Untuk Majikan",
    weaverLinks: ["Cara ia berfungsi", "Penemuan kerjaya", "Bina CV", "Soalan Lazim"],
    employerLinks: ["Kenapa Tenun?", "Siar peranan", "Padanan calon", "Pratonton perekrut"],
    rights: "Hak cipta terpelihara.",
    disclaimer:
      "Tenun membantu anda meneroka kemungkinan. Ia tidak menjamin hasil pekerjaan.",
  },
  employerHero: {
    badge: "Untuk Majikan",
    titlePrefix: "Ambil calon yang sudah tahu",
    titleHighlight: "kenapa mereka sesuai.",
    subtitle:
      "Tenun membantu majikan menemui pelajar dan graduan baharu yang telah meneroka peranan, membina profil, dan memahami apa yang diperlukan — sebelum mereka memohon.",
    rolePlaceholder: "Peranan apa yang anda ingin isi?",
    findCandidates: "Cari calon yang dipadankan",
    postRole: "Siar peranan",
    viewPreview: "Lihat pratonton calon",
  },
  employerSteps: {
    eyebrow: "Mudah. Lebih pantas. Isyarat lebih baik.",
    titleLine1: "Daripada peranan terbuka kepada",
    titleLine2: "senarai pendek mesra dalam 3 langkah.",
    steps: [
      {
        title: "Siar peranan sekali sahaja",
        body: "Beritahu kami peranan, kemahiran diperlukan, julat gaji, lokasi, dan apa yang calon yang kuat perlu tunjukkan.",
      },
      {
        title: "Tenun padankan untuk niat dan kesesuaian",
        body: "Kami lihat lebih daripada kata kunci dengan menggunakan kemahiran calon, minat, isyarat CV, bukti portfolio, dan kesediaan peranan.",
      },
      {
        title: "Semak senarai pendek yang lebih mesra",
        body: "Lihat calon yang telah meneroka peranan, memahami jurang, dan menyediakan permohonan yang lebih kukuh.",
      },
    ],
  },
  candidateSignal: {
    titleLine1: "Bukan sekadar CV. Isyarat calon",
    titleLine2: "yang anda boleh betul-betul guna.",
    subtitle:
      "Tenun membantu anda memahami kenapa seseorang sesuai sebelum anda luangkan masa menyaring.",
    cards: [
      {
        badge: "82% Kesesuaian Peranan",
        body: "Pelajar data tahun akhir dengan projek papan pemuka, pengalaman SQL, dan minat dalam perkhidmatan kewangan.",
      },
      {
        badge: "Portfolio Sedia",
        body: "Termasuk GitHub, kajian kes, laporan projek, dan ringkasan CV khusus peranan.",
      },
      {
        badge: "Jurang Kemahiran Jelas",
        body: "Kuat dalam Python dan Excel. Masih membina komunikasi pihak berkepentingan dan penceritaan perniagaan.",
      },
      {
        badge: "Isyarat Temu Duga",
        body: "Calon telah menjawab soalan kesesuaian peranan dan memahami jangkaan harian.",
      },
      {
        badge: "Sedia Memohon",
        body: "Calon telah memadankan CV, peranan sasaran, jangkaan gaji, dan ketersediaan.",
      },
    ],
  },
  comparison: {
    title: "Kenapa Tenun, bukan sekadar satu lagi papan kerja?",
    subtitle: "Papan kerja tradisional beri anda kuantiti. Tenun beri anda konteks.",
    jobBoardsTitle: "Papan kerja tradisional",
    jobBoards: [
      "Ramai pemohon membuta tuli",
      "CV penuh kata kunci",
      "Calon memohon tanpa memahami",
      "Perekrut menyaring secara manual",
      "Isyarat lemah tentang motivasi dan kesesuaian",
    ],
    tenun: [
      "Senarai pendek yang lebih kecil dan mesra",
      "Konteks kemahiran, minat, dan kesesuaian peranan",
      "Calon memahami peranan sebelum memohon",
      "Isyarat calon distruktur sebelum semakan",
      "Lebih jelas tentang kesediaan dan jurang",
    ],
  },
  portalPreview: {
    title: "Lihat senarai pendek sebelum anda mula menyaring.",
    subtitle:
      "Pratonton kesesuaian calon, kesediaan portfolio, dan jurang kemahiran di satu tempat.",
    openRole: "Peranan terbuka",
    roleTitle: "Pelatih Penganalisis Data",
    matchingLive: "Padanan secara langsung",
    statLabels: [
      "Calon dipadankan",
      "Padanan kuat",
      "Sedia portfolio",
      "Perlu semakan",
    ],
    fitSuffix: "% sesuai",
    candidateInterests: [
      "Berminat dengan perbankan",
      "Berminat dengan perundingan",
      "Berminat dengan FMCG",
    ],
    note: "Pratonton sahaja — data calon ilustrasi.",
  },
  employerForm: {
    title: "Mula dengan satu peranan. Kami bantu anda cari bakat awal yang lebih sesuai.",
    subtitle:
      "Hantar keperluan pengambilan anda dan kami bantu anda memahami jenis calon yang Tenun boleh tonjolkan.",
    successTitle: "Terima kasih — kami telah terima peranan anda.",
    successBody: "Pasukan Tenun akan menyemaknya dan menghubungi anda tidak lama lagi.",
    company: "Nama syarikat",
    companyPlaceholder: "cth. Acme Sdn Bhd",
    name: "Nama anda",
    namePlaceholder: "cth. Aisha Lim",
    email: "E-mel kerja",
    emailPlaceholder: "anda@syarikat.com",
    role: "Nama peranan",
    rolePlaceholder: "cth. Pelatih Penganalisis Data",
    hiringTypeLabel: "Jenis pengambilan",
    hiringTypes: ["Latihan industri", "Peranan graduan", "Peringkat permulaan", "Berasaskan projek"],
    location: "Lokasi",
    locationPlaceholder: "cth. Kuala Lumpur / Jarak jauh",
    description: "Deskripsi ringkas peranan",
    descriptionPlaceholder:
      "Apa yang orang ini akan kerjakan, dan apa yang calon yang kuat perlu tunjukkan?",
    prioritiesLabel: "Apa yang paling penting?",
    priorities: ["Kemahiran", "Portfolio", "Kesesuaian budaya", "Ketersediaan", "Kesesuaian gaji"],
    submit: "Hantar peranan untuk padanan",
    submitting: "Menghantar...",
    errCompany: "Nama syarikat diperlukan.",
    errName: "Nama anda diperlukan.",
    errEmail: "E-mel kerja diperlukan.",
    errEmailInvalid: "Masukkan e-mel yang sah.",
    errRole: "Nama peranan diperlukan.",
  },
  employerFaq: {
    eyebrow: "Soalan Lazim",
    title: "Soalan yang majikan tanya kami.",
    items: [
      {
        q: "Adakah Tenun sekadar satu lagi papan kerja?",
        a: "Tidak. Tenun membantu calon memahami peranan sebelum memohon, jadi majikan menerima permohonan yang lebih kaya konteks berbanding CV membuta tuli.",
      },
      {
        q: "Bolehkah kami siarkan latihan industri dan peranan graduan?",
        a: "Ya. Tenun amat berguna untuk latihan industri, program graduan, peranan peringkat permulaan, dan pengambilan awal kerjaya berasaskan projek.",
      },
      {
        q: "Bagaimana padanan berfungsi?",
        a: "Tenun menggunakan data profil calon, kemahiran, minat, isyarat CV, bukti portfolio, dan jangkaan peranan untuk menonjolkan calon yang lebih sesuai.",
      },
      {
        q: "Adakah kami dapat akses kepada butiran penuh calon?",
        a: "Untuk MVP, majikan boleh meminta akses kepada calon yang disenarai pendek selepas menghantar peranan. Portal perekrut penuh boleh ditambah kemudian.",
      },
      {
        q: "Bolehkah ini menyokong pengambilan kampus?",
        a: "Ya. Tenun direka untuk pelajar dan graduan baharu, jadi ia sesuai untuk pengambilan kampus, peranan graduan, dan saluran awal kerjaya.",
      },
    ],
  },
  jobDetail: {
    backToResults: "Kembali ke hasil",
    notFoundTitle: "Kerja tidak dijumpai",
    notFoundBody:
      "Ini biasanya berlaku jika anda melayari terus ke halaman ini. Cari kerja dahulu.",
    backToSearch: "Kembali ke carian",
    skillsYouNeed: "Kemahiran yang anda perlukan",
    mustHave: "Mesti ada",
    niceToHave: "Baik untuk ada",
    secretSauce: "Rahsia kejayaan",
    fitTitle: "Adakah anda sesuai? Tanya diri anda:",
    commonGaps: "Apa yang kebanyakan calon tertinggal",
    howToGetThere: "Cara sampai ke sini sebagai pelajar atau graduan baharu",
    startWith: "Mula dengan:",
    companiesHiring: "Syarikat yang mengambil untuk peranan ini",
    companiesNote:
      "Rakan kongsi TalentBank ini sedang aktif mencari calon yang berkelayakan.",
    ctaTitle: "Lihat dengan tepat bagaimana anda sesuai dengan peranan ini",
    ctaBodyPrefix:
      "Log masuk untuk muat naik CV anda dan ketahui jurang kemahiran, skor padanan, dan cara tampil di hadapan syarikat yang mengambil untuk",
    ctaBodySuffix: ". Percuma untuk Weavers — satu ketik, tiada borang.",
    buildCvForRole: "Bina CV saya untuk peranan ini",
    loadError: "Tak dapat memuatkan pecahan penuh. Cuba muat semula.",
  },
  guide: {
    header: "Tenun Guide",
    subheader: "Tanya saya ke mana hendak pergi.",
    placeholder: "Tanya saya apa-apa tentang Tenun…",
    needHelp: "Perlukan bantuan? 👋",
    close: "Tutup Tenun Guide",
    open: "Buka Tenun Guide",
    send: "Hantar mesej",
    greetings: {
      home: "Hai, saya pemandu Tenun anda! Beritahu saya apa yang anda cuba lakukan, atau saya boleh bantu anda mula dengan carian kerjaya.",
      jobs: "Sedang lihat sesuatu peranan? Saya boleh terangkan maksudnya dan cara tahu jika ia sesuai dengan anda.",
      profile:
        "Anda berada di halaman profil. Saya boleh bantu anda muat naik CV, isi secara manual, atau faham apa yang berlaku seterusnya.",
      dashboard:
        "Selamat datang ke papan pemuka anda! Saya boleh bantu anda faham apa yang dilihat atau mula dengan CV anda.",
      employers:
        "Anda berada di halaman majikan. Saya boleh bantu anda siarkan peranan atau faham bagaimana Tenun memadankan calon.",
      default:
        "Hai, saya pemandu Tenun anda! Tanya saya ke mana hendak pergi dan saya akan tunjukkan jalannya.",
    },
    quickActions: {
      home: ["Bagaimana nak mula?", "Apa patut saya taip?", "Bina CV saya"],
      jobs: [
        "Apa maksud peranan ini?",
        "Macam mana nak tahu saya sesuai?",
        "Bina CV untuk peranan ini",
      ],
      profile: [
        "Bagaimana nak muat naik CV?",
        "Boleh saya isi secara manual?",
        "Apa berlaku selepas ini?",
      ],
      dashboard: [
        "Apa yang saya lihat ini?",
        "Di mana jurang kemahiran saya?",
        "Muat naik CV / Portfolio",
      ],
      employers: [
        "Bagaimana majikan guna Tenun?",
        "Bagaimana nak siar peranan?",
        "Tunjuk pratonton calon",
      ],
      default: ["Apa itu Tenun?", "Bagaimana nak cari kerjaya?", "Bina CV saya"],
    },
    rateLimited:
      "Saya menerima banyak soalan sekarang — beri saya seketika dan cuba lagi.",
    errorWithEmail: "Ada masalah di pihak saya. Anda sentiasa boleh hubungi pasukan Tenun di",
    cannotReach: "Saya tak dapat sambung ke otak saya sekejap tadi. Sila cuba lagi, atau hubungi pasukan Tenun di",
  },
};

export const translations: Record<Locale, Translations> = { en, ms };

/**
 * Resolve a dot-path (e.g. "home.explore") against a locale tree. Returns the
 * string value, or the key itself if the path doesn't resolve to a string.
 */
export function translate(locale: Locale, path: string): string {
  const parts = path.split(".");
  let node: unknown = translations[locale];
  for (const part of parts) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === "string" ? node : path;
}
