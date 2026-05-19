import { UserProfile, CareerHub, PersonalizedHub } from "./types";

/**
 * Personalize career hubs based on a user's profile.
 * Calculates match scores using skill overlap, industry alignment,
 * interest proximity, and preference matching.
 */
export function personalizeAtlas(
  profile: UserProfile,
  hubs: CareerHub[]
): PersonalizedHub[] {
  return hubs
    .map((hub) => personalize(profile, hub))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function personalize(profile: UserProfile, hub: CareerHub): PersonalizedHub {
  const userSkills = new Set(profile.skills.map((s) => s.toLowerCase()));
  const userIndustries = new Set(
    profile.preferredIndustries.map((i) => i.toLowerCase())
  );
  const userInterests = new Set(
    profile.interests.map((i) => i.toLowerCase())
  );

  // ── Skill match (0–100, weight 35%) ──
  const matchingSkills = hub.demandSkills.filter((s) =>
    userSkills.has(s.toLowerCase())
  );
  const skillGaps = hub.demandSkills.filter(
    (s) => !userSkills.has(s.toLowerCase())
  );
  const skillScore =
    hub.demandSkills.length > 0
      ? (matchingSkills.length / hub.demandSkills.length) * 100
      : 50;

  // ── Industry match (0–100, weight 25%) ──
  const industryMatches = hub.industries.filter((ind) =>
    userIndustries.has(ind.toLowerCase())
  );
  const industryScore =
    hub.industries.length > 0
      ? (industryMatches.length / hub.industries.length) * 100
      : 30;

  // ── Interest alignment (0–100, weight 20%) ──
  // Map hub attributes to interest-like concepts
  const hubConcepts = [
    ...hub.industries,
    ...hub.suitableRoles,
    hub.hubType,
  ].map((c) => c.toLowerCase());

  let interestHits = 0;
  userInterests.forEach((interest) => {
    if (hubConcepts.some((c) => c.includes(interest) || interest.includes(c))) {
      interestHits++;
    }
  });
  // Broader keyword matching
  const interestKeywords: Record<string, string[]> = {
    "product management": ["product manager", "product", "growth"],
    "data science": ["data", "analytics", "ml", "machine learning"],
    "software engineering": ["software", "developer", "engineer", "full-stack"],
    "ux design": ["ux", "design", "figma", "user experience"],
    consulting: ["consulting", "consultant", "strategy"],
    finance: ["finance", "fintech", "financial"],
    "climate technology": ["climate", "sustainability", "green", "esg"],
    healthcare: ["health", "medical", "biotech"],
    education: ["education", "edtech", "learning"],
    "ai/ml": ["ai", "machine learning", "artificial intelligence", "ml"],
    cybersecurity: ["security", "cyber"],
    marketing: ["marketing", "growth", "brand"],
    entrepreneurship: ["startup", "builder", "venture", "founder"],
    "social impact": ["social", "impact", "nonprofit", "ngo"],
    gaming: ["gaming", "game", "entertainment"],
  };
  const hubText = hubConcepts.join(" ");
  userInterests.forEach((interest) => {
    const keywords = interestKeywords[interest] || [];
    if (keywords.some((kw) => hubText.includes(kw))) {
      interestHits++;
    }
  });
  const interestScore = Math.min(
    100,
    userInterests.size > 0
      ? (interestHits / Math.max(userInterests.size, 1)) * 70 + 15
      : 40
  );

  // ── Preference fit (0–100, weight 10%) ──
  let prefScore = 50;
  // Location mention
  const locationLower = (profile.locationPreference || "").toLowerCase();
  if (
    locationLower.includes(hub.city.toLowerCase()) ||
    locationLower.includes("remote")
  ) {
    prefScore += 30;
  }
  // Lifestyle alignment
  if (
    profile.lifestylePreference === "flexibility" &&
    hub.workModes.includes("Remote")
  ) {
    prefScore += 10;
  }
  if (
    profile.lifestylePreference === "fast-growth" &&
    hub.pathwayTags.includes("Startup / Builder")
  ) {
    prefScore += 10;
  }
  if (
    profile.lifestylePreference === "stability" &&
    hub.pathwayTags.includes("Stable Growth")
  ) {
    prefScore += 10;
  }
  prefScore = Math.min(100, prefScore);

  // ── Accessibility bonus (0–100, weight 10%) ──
  const mobilityMap = { Low: 90, Medium: 60, High: 30 };
  const accessScore = mobilityMap[hub.mobilityDifficulty];

  // ── Weighted total ──
  const rawScore =
    skillScore * 0.35 +
    industryScore * 0.25 +
    interestScore * 0.2 +
    prefScore * 0.1 +
    accessScore * 0.1;

  // Clamp to 40-98 range for realistic feel
  const matchScore = Math.round(Math.max(40, Math.min(98, rawScore)));

  // Build match reasons
  const matchReasons: string[] = [];
  if (matchingSkills.length >= 3) {
    matchReasons.push(
      `${matchingSkills.length} of your skills are in demand here`
    );
  } else if (matchingSkills.length > 0) {
    matchReasons.push(
      `Your ${matchingSkills.join(", ")} skills are valued in ${hub.city}`
    );
  }
  if (industryMatches.length > 0) {
    matchReasons.push(
      `Strong in ${industryMatches.slice(0, 2).join(" and ")} — industries you're targeting`
    );
  }
  if (
    locationLower.includes(hub.city.toLowerCase()) ||
    locationLower.includes(hub.country.toLowerCase())
  ) {
    matchReasons.push("Matches your location preferences");
  }
  if (hub.mobilityDifficulty === "Low") {
    matchReasons.push("Relatively accessible visa/mobility pathway");
  }
  if (hub.workModes.includes("Remote")) {
    matchReasons.push("Offers remote work options");
  }
  if (matchReasons.length === 0) {
    matchReasons.push(
      `Emerging opportunities in ${hub.industries[0] || hub.hubType}`
    );
  }

  return {
    ...hub,
    matchScore,
    matchingSkills,
    skillGaps,
    matchReasons,
  };
}
