import {
  UserProfile,
  CareerThread,
  PathwayCard,
  CareerWeaveResult,
  SkillGap,
  Opportunity,
  CareerArchetype,
} from "./types";
import { mockOpportunities } from "./mock-opportunities";
import { getCoursesForSkill } from "./course-data";

// ---------- helpers ----------

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function score(base: number, noise = 5) {
  return clamp(base + Math.floor(Math.random() * noise * 2 - noise));
}

function detectDegree(education: string): string {
  const t = education.toLowerCase();
  if (t.includes("phd") || t.includes("doctorate")) return "PhD level";
  if (t.includes("master") || t.includes("msc") || t.includes("mba")) return "Master's";
  if (t.includes("bachelor") || t.includes("bsc") || t.includes("beng") || t.includes(" ba ") || t.includes("b.a") || t.includes("b.sc")) return "Bachelor's";
  if (t.includes("diploma")) return "Diploma";
  if (education.length > 30) return "Tertiary";
  return "Academic";
}

function detectExperienceLabel(experience: string): string {
  const t = experience.toLowerCase();
  if (t.includes("5 year") || t.includes("6 year") || t.includes("7 year") || t.includes("8 year")) return "5+ yrs exp";
  if (t.includes("3 year") || t.includes("4 year")) return "3–4 yrs exp";
  if (t.includes("2 year")) return "2 yrs exp";
  if (t.includes("1 year")) return "~1 yr exp";
  if (t.includes("intern")) return "Internship exp";
  if (experience.length > 300) return "Rich background";
  if (experience.length > 80) return "Some experience";
  return "Early stage";
}

// ---------- Thread extraction ----------

function extractThreads(profile: UserProfile): CareerThread[] {
  const skillCount = profile.skills.length;
  const hasStrongTech =
    profile.skills.some((s) =>
      ["Python", "SQL", "JavaScript", "TypeScript", "React", "Git"].includes(s)
    );
  const hasDesign = profile.skills.some((s) =>
    ["Figma", "Design", "UX", "UI"].includes(s)
  );
  const hasSoftSkills = profile.skills.some((s) =>
    ["Public Speaking", "Leadership", "Project Management", "Communication"].includes(s)
  );
  const experienceLength = profile.experience.length;
  const hasInternship =
    profile.experience.toLowerCase().includes("intern");
  const hasLeadership =
    profile.experience.toLowerCase().includes("led") ||
    profile.experience.toLowerCase().includes("lead") ||
    profile.experience.toLowerCase().includes("managed");
  const educationLength = profile.education.length;
  const interestCount = profile.interests.length;
  const hasClimate =
    profile.interests.some((i) => i.toLowerCase().includes("climate")) ||
    profile.experience.toLowerCase().includes("climate");

  return [
    {
      id: "skill",
      name: "Skill Thread",
      icon: "Cpu",
      contextLabel: `${skillCount} skills`,
      score: score(
        skillCount >= 8 ? 82 : skillCount >= 5 ? 68 : 50,
        6
      ),
      explanation:
        skillCount >= 8
          ? `You bring a diverse set of ${skillCount} skills spanning technical and interpersonal domains. ${hasStrongTech ? "Your technical foundation in programming and data is particularly strong." : ""} ${hasDesign ? "Your design skills add a valuable cross-functional dimension." : ""}`
          : `You have ${skillCount} listed skills. Building depth in a few key areas and broadening into adjacent skills could strengthen this thread significantly.`,
      improvement:
        hasStrongTech && !hasDesign
          ? "Consider adding UX/UI design skills to complement your technical profile and unlock product-oriented roles."
          : !hasStrongTech
          ? "Deepening technical skills (e.g., Python, SQL, or a modern framework) would open more career pathways."
          : "Continue building depth — consider advanced certifications or specialised tools in your strongest areas.",
      color: "#4164b4",
    },
    {
      id: "experience",
      name: "Experience Thread",
      icon: "Briefcase",
      contextLabel: detectExperienceLabel(profile.experience),
      score: score(
        hasInternship && hasLeadership
          ? 78
          : hasInternship
          ? 65
          : experienceLength > 100
          ? 55
          : 40,
        5
      ),
      explanation: hasInternship
        ? `Your internship experience provides foundational professional exposure. ${hasLeadership ? "Leadership roles in projects and teams add significant weight to your profile." : "Seeking leadership opportunities in future roles could accelerate your growth."}`
        : "While your current experience is building, adding structured professional experiences like internships or co-ops would significantly strengthen this thread.",
      improvement: hasLeadership
        ? "Seek cross-functional project leadership or roles with P&L responsibility to deepen your experience thread."
        : "Look for opportunities to lead initiatives — even small team projects or volunteer coordination demonstrates leadership potential.",
      color: "#d4a017",
    },
    {
      id: "education",
      name: "Education Thread",
      icon: "GraduationCap",
      contextLabel: detectDegree(profile.education),
      score: score(educationLength > 80 ? 75 : 60, 5),
      explanation:
        "Your educational background provides a solid academic foundation. " +
        (profile.education.toLowerCase().includes("computer science") ||
        profile.education.toLowerCase().includes("engineering")
          ? "A STEM degree is well-positioned for technology and analytical career paths."
          : "Complementing your studies with technical certifications could open additional doors."),
      improvement:
        "Consider targeted online certifications (Google, AWS, or domain-specific) to complement your degree and signal continuous learning.",
      color: "#2d8a4e",
    },
    {
      id: "interest",
      name: "Interest Thread",
      icon: "Heart",
      contextLabel: `${interestCount} interests`,
      score: score(
        interestCount >= 4 ? 80 : interestCount >= 2 ? 65 : 50,
        5
      ),
      explanation: `You've identified ${interestCount} areas of interest${hasClimate ? ", including climate technology which shows purpose-driven motivation" : ""}. Clear interests help focus your career exploration and make your applications more compelling.`,
      improvement:
        "Deepen one or two interests through side projects, writing, or community involvement. Demonstrated passion is more compelling than stated interest.",
      color: "#c44569",
    },
    {
      id: "market",
      name: "Market Demand Thread",
      icon: "TrendingUp",
      contextLabel: hasStrongTech ? "High demand" : "Growing field",
      score: score(
        hasStrongTech ? 85 : hasDesign ? 72 : 58,
        5
      ),
      explanation: hasStrongTech
        ? "Your technical skills align well with current market demand. Data analytics, Python, and SQL remain among the most sought-after skills across industries."
        : "The market values a mix of technical and analytical capabilities. Strengthening your technical toolkit would improve alignment with high-demand roles.",
      improvement:
        "Stay current with market trends — skills like cloud computing, AI/ML fundamentals, and data engineering are seeing growing demand across sectors.",
      color: "#6c5ce7",
    },
    {
      id: "salary",
      name: "Salary Thread",
      icon: "DollarSign",
      contextLabel: profile.salaryExpectation ? profile.salaryExpectation.split(" ")[0] + " target" : "Market rate",
      score: score(70, 8),
      explanation: `Your salary expectations of ${profile.salaryExpectation} appear ${profile.riskAppetite === "high" ? "conservative relative to your risk tolerance — you may have room to target higher-paying opportunities" : "well-calibrated for entry to mid-level roles in your target industries"}. Market research and negotiation skills can help optimise your compensation.`,
      improvement:
        "Research specific salary bands for your target roles on Glassdoor and Levels.fyi. Develop negotiation skills — even a 10% improvement in initial offers compounds significantly over a career.",
      color: "#00b894",
    },
    {
      id: "lifestyle",
      name: "Lifestyle Thread",
      icon: "Sun",
      contextLabel: profile.lifestylePreference.replace("-", " "),
      score: score(
        profile.lifestylePreference === "flexibility" ? 76 : 70,
        5
      ),
      explanation: `Your preference for ${profile.lifestylePreference.replace("-", " ")} shapes which pathways and organisations will be the best fit. ${profile.lifestylePreference === "flexibility" ? "Many tech and consulting roles now offer strong flexibility, especially in remote-friendly companies." : profile.lifestylePreference === "stability" ? "Look for established companies with clear career tracks and strong benefits." : profile.lifestylePreference === "fast-growth" ? "High-growth startups and scale-ups typically offer accelerated learning and responsibility." : "Mission-driven organisations and social enterprises align well with purpose-driven preferences."}`,
      improvement:
        "Be explicit about lifestyle requirements in your job search. Companies increasingly compete on work-life balance, remote policies, and culture — use this to your advantage.",
      color: "#fdcb6e",
    },
    {
      id: "employer",
      name: "Employer Fit Thread",
      icon: "Building2",
      contextLabel: `${profile.preferredIndustries.length} industries`,
      score: score(
        profile.preferredIndustries.length >= 3 ? 74 : 60,
        5
      ),
      explanation: `You're targeting ${profile.preferredIndustries.join(", ")} — ${profile.preferredIndustries.length >= 3 ? "a healthy range of industries that provides multiple career options while maintaining focus" : "a focused set of industries. Consider whether adjacent sectors might also align with your goals"}.`,
      improvement:
        "Build relationships in your target industries through events, LinkedIn outreach, and informational interviews. Industry knowledge and network are often the deciding factors in hiring.",
      color: "#e17055",
    },
  ];
}

// ---------- Archetype computation ----------

function computeArchetype(threads: CareerThread[], profile: UserProfile): CareerArchetype {
  const byId = Object.fromEntries(threads.map(t => [t.id, t.score]));
  const skillScore = byId["skill"] || 50;
  const expScore = byId["experience"] || 50;
  const interestScore = byId["interest"] || 50;
  const marketScore = byId["market"] || 50;

  const hasClimate = profile.interests.some(i => i.toLowerCase().includes("climate") || i.toLowerCase().includes("sustainability"));
  const hasLeadership = profile.experience.toLowerCase().includes("led") || profile.experience.toLowerCase().includes("managed");
  const hasTech = profile.skills.some(s => ["Python", "SQL", "JavaScript", "TypeScript", "React"].includes(s));
  const hasPM = profile.interests.some(i => i.toLowerCase().includes("product"));
  const isHighRisk = profile.riskAppetite === "high";
  const isPurpose = profile.lifestylePreference === "purpose-driven";
  const isFastGrowth = profile.lifestylePreference === "fast-growth";

  if (hasClimate && (isPurpose || interestScore > 70)) {
    return {
      title: "The Change Maker",
      emoji: "🌱",
      tagline: "Purpose-driven and impact-oriented",
      description: "You're not just building a career — you're building a better world. Your profile shows a rare combination of technical capability and genuine drive to create meaningful impact. You are most energised when your work aligns with a bigger mission beyond personal gain.",
      strengths: ["Mission alignment", "Intrinsic motivation", "Cross-sector thinking", "Long-term vision"],
      growthAreas: ["Commercial awareness", "Network building in impact spaces", "Translating impact into business metrics"],
      keywords: ["purpose-driven", "impact-oriented", "collaborative", "systemic thinker"],
      color: "#2d8a4e",
      figures: [
        { name: "Nelson Mandela", trait: "Turned adversity into lasting change", emoji: "✊", color: "#2d8a4e" },
        { name: "Malala Yousafzai", trait: "Used voice to shift global narrative", emoji: "📚", color: "#00b894" },
      ],
    };
  }

  if (hasLeadership && expScore > 68) {
    return {
      title: "The Orchestrator",
      emoji: "🎯",
      tagline: "Natural leader with strategic clarity",
      description: "You have a gift for bringing people together and moving teams toward shared goals. Your experience leading others signals readiness for roles with increasing organisational responsibility. You thrive in complexity and see the 'why' behind the 'what'.",
      strengths: ["Team motivation", "Strategic thinking", "Organisational clarity", "Accountability"],
      growthAreas: ["Technical upskilling", "Data-driven decision making", "Executive presence in senior settings"],
      keywords: ["leadership-oriented", "team player", "decisive", "strategically minded"],
      color: "#e17055",
      figures: [
        { name: "Steve Jobs", trait: "Turned vision into products people love", emoji: "💡", color: "#e17055" },
        { name: "Barack Obama", trait: "Built coalitions through clarity of purpose", emoji: "🗣️", color: "#d4a017" },
      ],
    };
  }

  if (hasTech && skillScore > 73 && marketScore > 73) {
    return {
      title: "The Technologist",
      emoji: "⚡",
      tagline: "Deep technical expertise meets market relevance",
      description: "Your technical profile is genuinely strong and well-aligned with what the market values most right now. You bring depth that many generalists lack. The key opportunity is to pair this technical foundation with stronger business storytelling and stakeholder influence.",
      strengths: ["Technical depth", "Problem solving", "Analytical rigour", "Market relevance"],
      growthAreas: ["Business communication", "Stakeholder influence", "Cross-functional collaboration"],
      keywords: ["technical", "analytical", "detail-oriented", "systematic"],
      color: "#4164b4",
      figures: [
        { name: "Nikola Tesla", trait: "Reimagined what electricity could do", emoji: "⚡", color: "#4164b4" },
        { name: "Alan Turing", trait: "Built the foundation of modern computing", emoji: "🧮", color: "#6c5ce7" },
      ],
    };
  }

  if (hasPM && interestScore > 68) {
    return {
      title: "The Connector",
      emoji: "🔗",
      tagline: "Bridges users, teams, and business outcomes",
      description: "You have a natural interest in understanding people and connecting dots across disciplines. Product-oriented roles suit you well because you're curious about the 'why' behind user behaviour and motivated by outcomes, not just outputs.",
      strengths: ["Empathy for users", "Cross-functional curiosity", "Big-picture thinking", "Communication"],
      growthAreas: ["Data fluency", "Technical vocabulary", "Prioritisation frameworks"],
      keywords: ["collaborative", "user-focused", "outcome-driven", "curious"],
      color: "#6c5ce7",
      figures: [
        { name: "Oprah Winfrey", trait: "Made millions feel understood and seen", emoji: "🤝", color: "#6c5ce7" },
        { name: "Richard Branson", trait: "Connected bold ideas to real people", emoji: "🚀", color: "#c44569" },
      ],
    };
  }

  if (isHighRisk || isFastGrowth) {
    return {
      title: "The Builder",
      emoji: "🔨",
      tagline: "Energised by creation and fast iteration",
      description: "You're wired for speed and ownership. The idea of building something from scratch — whether a product, a team, or a business — genuinely excites you. You do your best work when given autonomy and a problem worth solving.",
      strengths: ["Bias for action", "Entrepreneurial mindset", "Adaptability", "Ownership mentality"],
      growthAreas: ["Strategic patience", "Deep expertise in one domain", "Sustainable work patterns"],
      keywords: ["entrepreneurial", "action-oriented", "adaptable", "self-driven"],
      color: "#d4a017",
      figures: [
        { name: "Thomas Edison", trait: "Failed 1,000 times to get to the light", emoji: "💡", color: "#d4a017" },
        { name: "Henry Ford", trait: "Built systems that changed how the world moves", emoji: "⚙️", color: "#e17055" },
      ],
    };
  }

  if (profile.lifestylePreference === "stability" && skillScore > 65) {
    return {
      title: "The Specialist",
      emoji: "🔬",
      tagline: "Deep expertise in a focused domain",
      description: "You value mastery over breadth. Your profile suggests a preference for becoming truly excellent in your chosen area rather than spreading thin across many disciplines. This depth often leads to outsized impact and a strong professional reputation over time.",
      strengths: ["Domain depth", "Reliability", "Quality-focused", "Long-term perspective"],
      growthAreas: ["Adaptability to change", "Broadening adjacent skills", "Visibility and self-promotion"],
      keywords: ["expert", "reliable", "focused", "quality-driven"],
      color: "#00b894",
      figures: [
        { name: "Albert Einstein", trait: "Went deeper than anyone thought possible", emoji: "🧠", color: "#00b894" },
        { name: "Marie Curie", trait: "Mastered her field and changed science forever", emoji: "⚗️", color: "#2d8a4e" },
      ],
    };
  }

  return {
    title: "The Generalist",
    emoji: "🌐",
    tagline: "Versatile and adaptable across contexts",
    description: "Your profile reflects a wide range of capabilities and interests — a genuine strength in a world that increasingly values people who can operate across disciplines. Your challenge is choosing focus points that let you demonstrate depth alongside your natural breadth.",
    strengths: ["Adaptability", "Cross-functional thinking", "Broad context awareness", "Versatility"],
    growthAreas: ["Developing a signature specialisation", "Depth in one technical area", "Clear professional narrative"],
    keywords: ["adaptable", "versatile", "curious", "broad-thinker"],
    color: "#d4a017",
    figures: [
      { name: "Leonardo da Vinci", trait: "Artist, scientist, engineer — all at once", emoji: "🎨", color: "#d4a017" },
      { name: "Benjamin Franklin", trait: "Writer, inventor, diplomat, philosopher", emoji: "📜", color: "#6c5ce7" },
    ],
  };
}

// ---------- Pathway generation ----------

function generatePathways(
  profile: UserProfile,
  threads: CareerThread[]
): PathwayCard[] {
  const avgScore =
    threads.reduce((sum, t) => sum + t.score, 0) / threads.length;
  const hasAnalytics =
    profile.skills.some((s) => ["Python", "SQL", "Tableau", "Data Visualization", "R"].includes(s));
  const hasPM =
    profile.interests.some((i) => i.toLowerCase().includes("product"));
  const hasClimate =
    profile.interests.some((i) => i.toLowerCase().includes("climate"));
  const hasLeadership =
    profile.experience.toLowerCase().includes("led") ||
    profile.experience.toLowerCase().includes("managed");

  return [
    {
      id: "stable-growth",
      name: "Stable Growth Path",
      icon: "TrendingUp",
      score: score(hasAnalytics ? 82 : 70, 5),
      timeline: "3-5 years to mid-level",
      description:
        "A steady progression through established organisations with clear promotion tracks. This pathway prioritises job security, consistent skill development, and predictable salary growth.",
      roles: [
        "Junior Data Analyst → Data Analyst → Senior Data Analyst",
        "Business Analyst → Senior BA → Analytics Manager",
        "Associate Consultant → Consultant → Senior Consultant",
      ],
      requiredSkills: [
        "Advanced SQL",
        "Statistical Analysis",
        "Business Communication",
        "Stakeholder Management",
        "Domain Expertise",
      ],
      tradeoffs: [
        "Slower salary growth compared to startup paths",
        "Less variety in day-to-day work",
        "May feel constrained by organisational pace",
        "Strong work-life balance and benefits",
      ],
      risks: [
        "Industry downturns can slow promotion cycles",
        "Risk of skill stagnation without proactive learning",
        "May need to switch companies for significant salary jumps",
      ],
      nextActions: [
        "Apply to graduate analytics programs at Deloitte, PwC, or similar firms where you have existing relationships",
        "Complete the Google Data Analytics Certificate to strengthen your credentials",
        "Build a portfolio of 3-4 data projects showcasing business impact",
      ],
      matchingOpportunities: ["opp-2", "opp-3", "opp-5"],
      color: "#4164b4",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      id: "high-salary",
      name: "High Salary Path",
      icon: "DollarSign",
      score: score(hasAnalytics && hasPM ? 78 : 65, 5),
      timeline: "2-4 years to six figures",
      description:
        "Targets the highest-paying roles in tech and finance by combining technical skills with business acumen. Requires aggressive skill-building and strategic company selection.",
      roles: [
        "Product Analyst → Product Manager → Senior PM",
        "Data Scientist → Senior DS → ML Engineering Lead",
        "Management Consultant → Strategy → Tech Leadership",
      ],
      requiredSkills: [
        "Machine Learning Fundamentals",
        "Product Analytics",
        "A/B Testing",
        "Cloud Platforms (AWS/GCP)",
        "Executive Communication",
      ],
      tradeoffs: [
        "Requires significant upfront investment in skill-building",
        "Higher stress and performance pressure",
        "May need to relocate to major tech hubs",
        "Potentially less work-life balance in early years",
      ],
      risks: [
        "Tech industry layoffs can disrupt trajectories",
        "Burnout risk if work-life balance isn't managed",
        "Compensation expectations may outpace actual market in downturns",
      ],
      nextActions: [
        "Target APM programs at Canva, Atlassian, or Google — they offer the strongest salary trajectories in the region",
        "Learn ML fundamentals through fast.ai or Andrew Ng's courses to unlock data science roles",
        "Practice case interviews and product sense questions for PM applications",
      ],
      matchingOpportunities: ["opp-1", "opp-3", "opp-6"],
      color: "#d4a017",
      gradient: "from-amber-500 to-amber-700",
    },
    {
      id: "skill-pivot",
      name: "Skill Pivot Path",
      icon: "Shuffle",
      score: score(hasPM || hasClimate ? 80 : 68, 5),
      timeline: "1-2 years to transition",
      description:
        "Leverages your existing skills as a bridge into a different domain. This pathway is ideal if your strongest interests don't align perfectly with your current skill set.",
      roles: [
        "Data Analyst → Product Manager (analytics-driven PM)",
        "CS Graduate → UX Researcher (tech + research hybrid)",
        "Analyst → Climate Tech Specialist (domain pivot)",
      ],
      requiredSkills: [
        "User Research Methods",
        "Product Thinking",
        "Domain Knowledge (target field)",
        "Storytelling with Data",
        "Cross-functional Collaboration",
      ],
      tradeoffs: [
        "Temporary step back in seniority during transition",
        "Need to rebuild credibility in new domain",
        "Exciting learning curve and fresh challenges",
        "Opens entirely new career possibilities",
      ],
      risks: [
        "Transition period may involve salary plateau",
        "Imposter syndrome in new domain is common",
        "Success depends on transferable skills being recognised",
      ],
      nextActions: [
        "Identify 2-3 people who've made a similar pivot and request informational interviews",
        "Build a bridge project that combines your current skills with your target domain",
        "Join communities in your target field (e.g., Mind the Product for PM, Climate Salad for climate tech)",
      ],
      matchingOpportunities: ["opp-1", "opp-7", "opp-9"],
      color: "#6c5ce7",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      id: "startup-builder",
      name: "Startup / Builder Path",
      icon: "Rocket",
      score: score(
        profile.riskAppetite === "high"
          ? 75
          : profile.riskAppetite === "medium"
          ? 68
          : 55,
        5
      ),
      timeline: "1-3 years to launch",
      description:
        "For those who want to build something of their own. This pathway trades stability for autonomy, creative freedom, and potentially outsized impact and returns.",
      roles: [
        "Technical Co-founder (climate tech / data tools)",
        "Solo Builder → Indie Product Creator",
        "Startup Early Employee → Head of Product/Data",
      ],
      requiredSkills: [
        "Full-Stack Development",
        "MVP Design",
        "Business Model Canvas",
        "Fundraising Basics",
        "Sales & Marketing",
      ],
      tradeoffs: [
        "High financial uncertainty, especially in early stages",
        "Maximum learning and personal growth",
        "Complete autonomy over what you build",
        "Potential for outsized financial returns",
      ],
      risks: [
        "90%+ of startups fail — financial safety net is important",
        "Isolation and decision fatigue without co-founders",
        "Opportunity cost of not building corporate experience",
      ],
      nextActions: [
        "Join EnergyLab or a climate-tech accelerator to immerse yourself in the startup ecosystem",
        "Build and ship a small product (weekend project) to practise the full build-launch-iterate cycle",
        "Find a potential co-founder through hackathons, startup communities, or your university network",
      ],
      matchingOpportunities: ["opp-4", "opp-7", "opp-11"],
      color: "#e17055",
      gradient: "from-orange-500 to-orange-700",
    },
    {
      id: "leadership",
      name: "Leadership Path",
      icon: "Crown",
      score: score(hasLeadership ? 74 : 60, 5),
      timeline: "5-8 years to management",
      description:
        "Focused on developing people management, strategic thinking, and organisational leadership skills. This pathway builds toward director and VP-level roles.",
      roles: [
        "Team Lead → Manager → Director of Analytics",
        "Senior PM → Group PM → VP Product",
        "Principal Consultant → Practice Lead → Partner",
      ],
      requiredSkills: [
        "People Management",
        "Strategic Planning",
        "Budget Management",
        "Organisational Design",
        "Executive Communication",
      ],
      tradeoffs: [
        "Longer timeline to reach senior positions",
        "Less hands-on technical work over time",
        "High impact on team and organisational outcomes",
        "Strong compensation at senior levels",
      ],
      risks: [
        "Management isn't for everyone — test it before committing",
        "Political navigation becomes more important",
        "Risk of becoming disconnected from technical foundations",
      ],
      nextActions: [
        "Volunteer to lead a team project or initiative in your current organisation",
        "Find a leadership mentor through ADPList or your alumni network",
        "Read 'The Manager's Path' by Camille Fournier to understand the leadership track in tech",
      ],
      matchingOpportunities: ["opp-9", "opp-6", "opp-10"],
      color: "#2d8a4e",
      gradient: "from-emerald-500 to-emerald-700",
    },
  ];
}

// ---------- Skill gaps ----------

function identifySkillGaps(
  profile: UserProfile,
  pathways: PathwayCard[]
): SkillGap[] {
  const userSkills = new Set(profile.skills.map((s) => s.toLowerCase()));

  const allRequired = new Map<string, number>();
  for (const p of pathways) {
    for (const s of p.requiredSkills) {
      allRequired.set(s, (allRequired.get(s) || 0) + 1);
    }
  }

  const gaps: SkillGap[] = [];
  for (const [skill, count] of allRequired) {
    const has = userSkills.has(skill.toLowerCase());
    if (!has) {
      const courses = getCoursesForSkill(skill);
      gaps.push({
        skill,
        currentLevel: Math.floor(Math.random() * 25) + 10,
        requiredLevel: 60 + Math.floor(Math.random() * 25),
        priority: count >= 3 ? "high" : count >= 2 ? "medium" : "low",
        resources: courses.map(c => `${c.name} by ${c.provider} on ${c.platform} — ${c.duration}`),
        courses,
      });
    }
  }

  return gaps
    .sort((a, b) => {
      const pri = { high: 3, medium: 2, low: 1 };
      return pri[b.priority] - pri[a.priority];
    })
    .slice(0, 10);
}

// ---------- Opportunity matching ----------

function matchOpportunities(
  profile: UserProfile,
  pathways: PathwayCard[]
): Opportunity[] {
  const pathwayOppIds = new Set(
    pathways.flatMap((p) => p.matchingOpportunities)
  );

  return mockOpportunities
    .map((o) => ({
      ...o,
      matchPercentage: pathwayOppIds.has(o.id)
        ? o.matchPercentage
        : Math.max(50, o.matchPercentage - 15),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ---------- Main engine ----------

export function generateCareerWeave(profile: UserProfile): CareerWeaveResult {
  const threads = extractThreads(profile);
  const pathways = generatePathways(profile, threads);
  const skillGaps = identifySkillGaps(profile, pathways);
  const opportunities = matchOpportunities(profile, pathways);
  const archetype = computeArchetype(threads, profile);

  const recommended = pathways.reduce((best, p) =>
    p.score > best.score ? p : best
  );

  const avgThread =
    Math.round(threads.reduce((s, t) => s + t.score, 0) / threads.length);

  const summary = `Based on your profile, ${profile.name}, your career threads weave together a profile that appears well-suited for roles at the intersection of ${profile.interests.slice(0, 2).join(" and ")}. Your overall thread strength is ${avgThread}/100. The "${recommended.name}" currently shows the strongest alignment with your profile (score: ${recommended.score}/100), though ${pathways.length - 1} other pathways also present viable directions. Key areas for growth include ${skillGaps.slice(0, 3).map((g) => g.skill).join(", ")}. Remember — these pathways represent possibilities based on your current profile, not predictions. Your choices, effort, and circumstances will shape your actual journey.`;

  return {
    threads,
    pathways,
    opportunities,
    recommendedPathway: recommended.id,
    summary,
    skillGaps,
    archetype,
  };
}
