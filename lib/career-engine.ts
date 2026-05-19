import {
  UserProfile,
  CareerThread,
  PathwayCard,
  CareerWeaveResult,
  SkillGap,
  Opportunity,
} from "./types";
import { mockOpportunities } from "./mock-opportunities";

// ---------- helpers ----------

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function score(base: number, noise = 5) {
  return clamp(base + Math.floor(Math.random() * noise * 2 - noise));
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
          : "Continue building depth — consider advanced certifications or specialized tools in your strongest areas.",
      color: "#4164b4",
    },
    {
      id: "experience",
      name: "Experience Thread",
      icon: "Briefcase",
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
      score: score(70, 8),
      explanation: `Your salary expectations of ${profile.salaryExpectation} appear ${profile.riskAppetite === "high" ? "conservative relative to your risk tolerance — you may have room to target higher-paying opportunities" : "well-calibrated for entry to mid-level roles in your target industries"}. Market research and negotiation skills can help optimize your compensation.`,
      improvement:
        "Research specific salary bands for your target roles on Glassdoor and Levels.fyi. Develop negotiation skills — even a 10% improvement in initial offers compounds significantly over a career.",
      color: "#00b894",
    },
    {
      id: "lifestyle",
      name: "Lifestyle Thread",
      icon: "Sun",
      score: score(
        profile.lifestylePreference === "flexibility" ? 76 : 70,
        5
      ),
      explanation: `Your preference for ${profile.lifestylePreference.replace("-", " ")} shapes which pathways and organizations will be the best fit. ${profile.lifestylePreference === "flexibility" ? "Many tech and consulting roles now offer strong flexibility, especially in remote-friendly companies." : profile.lifestylePreference === "stability" ? "Look for established companies with clear career tracks and strong benefits." : profile.lifestylePreference === "fast-growth" ? "High-growth startups and scale-ups typically offer accelerated learning and responsibility." : "Mission-driven organizations and social enterprises align well with purpose-driven preferences."}`,
      improvement:
        "Be explicit about lifestyle requirements in your job search. Companies increasingly compete on work-life balance, remote policies, and culture — use this to your advantage.",
      color: "#fdcb6e",
    },
    {
      id: "employer",
      name: "Employer Fit Thread",
      icon: "Building2",
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
        "A steady progression through established organizations with clear promotion tracks. This pathway prioritizes job security, consistent skill development, and predictable salary growth.",
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
        "May feel constrained by organizational pace",
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
        "Success depends on transferable skills being recognized",
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
        "Build and ship a small product (weekend project) to practice the full build-launch-iterate cycle",
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
        "Focused on developing people management, strategic thinking, and organizational leadership skills. This pathway builds toward director and VP-level roles.",
      roles: [
        "Team Lead → Manager → Director of Analytics",
        "Senior PM → Group PM → VP Product",
        "Principal Consultant → Practice Lead → Partner",
      ],
      requiredSkills: [
        "People Management",
        "Strategic Planning",
        "Budget Management",
        "Organizational Design",
        "Executive Presence",
      ],
      tradeoffs: [
        "Longer timeline to reach senior positions",
        "Less hands-on technical work over time",
        "High impact on team and organizational outcomes",
        "Strong compensation at senior levels",
      ],
      risks: [
        "Management isn't for everyone — test it before committing",
        "Political navigation becomes more important",
        "Risk of becoming disconnected from technical foundations",
      ],
      nextActions: [
        "Volunteer to lead a team project or initiative in your current organization",
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
      gaps.push({
        skill,
        currentLevel: Math.floor(Math.random() * 25) + 10,
        requiredLevel: 60 + Math.floor(Math.random() * 25),
        priority: count >= 3 ? "high" : count >= 2 ? "medium" : "low",
        resources: getResources(skill),
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

function getResources(skill: string): string[] {
  const resourceMap: Record<string, string[]> = {
    "Machine Learning Fundamentals": [
      "fast.ai — Practical Deep Learning",
      "Andrew Ng's ML Specialization on Coursera",
      "Kaggle Learn tutorials",
    ],
    "Product Thinking": [
      "Reforge — Product Management Fundamentals",
      "Lenny's Newsletter & Podcast",
      "Inspired by Marty Cagan (book)",
    ],
    "Full-Stack Development": [
      "The Odin Project (free)",
      "Next.js official tutorial",
      "freeCodeCamp Full Stack Certification",
    ],
    "People Management": [
      "The Manager's Path by Camille Fournier",
      "High Output Management by Andy Grove",
      "ADPList leadership mentors",
    ],
    "A/B Testing": [
      "Udacity A/B Testing Course (free)",
      "Trustworthy Online Controlled Experiments (book)",
      "Optimizely Academy",
    ],
  };

  return (
    resourceMap[skill] || [
      `Search "${skill} course" on Coursera`,
      `YouTube tutorials for ${skill}`,
      `Practice ${skill} through hands-on projects`,
    ]
  );
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
  };
}
