import { UserProfile, PathwayCard, PersonalizedMentor } from "./types";
import { mockMentors } from "./mock-mentors";
import { clamp } from "./utils";

export function personalizeMentors(
  profile: UserProfile,
  pathways: PathwayCard[]
): PersonalizedMentor[] {
  const topPathwayIds = pathways
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => p.id);

  return mockMentors
    .map((mentor) => {
      const reasons: string[] = [];

      // ── Expertise overlap with user skills + interests (40%) ──
      const userTags = [
        ...profile.skills.map((s) => s.toLowerCase()),
        ...profile.interests.map((i) => i.toLowerCase()),
      ];
      const expertiseMatches = mentor.expertise.filter((e) =>
        userTags.some(
          (t) => t.includes(e.toLowerCase()) || e.toLowerCase().includes(t)
        )
      );
      const expertiseScore =
        mentor.expertise.length > 0
          ? (expertiseMatches.length / mentor.expertise.length) * 100
          : 0;
      if (expertiseMatches.length > 0) {
        reasons.push(
          `Expertise in ${expertiseMatches.slice(0, 2).join(" and ")} aligns with your profile`
        );
      }

      // ── Industry match (20%) ──
      const industryMatch = profile.preferredIndustries.some(
        (ind) =>
          ind.toLowerCase() === mentor.industry.toLowerCase() ||
          mentor.industry.toLowerCase().includes(ind.toLowerCase())
      );
      const industryScore = industryMatch ? 100 : 30;
      if (industryMatch) {
        reasons.push(`Works in ${mentor.industry}, one of your preferred industries`);
      }

      // ── Location match (15%) ──
      const locationMatch =
        profile.locationPreference
          .toLowerCase()
          .includes(mentor.location.toLowerCase()) ||
        mentor.location.toLowerCase().includes("remote");
      const locationScore = locationMatch ? 100 : 40;
      if (locationMatch) {
        reasons.push(`Based in ${mentor.location}, matching your location preference`);
      }

      // ── Pathway alignment (25%) ──
      const pathwayMatches = mentor.pathwayTags.filter((tag) =>
        topPathwayIds.includes(tag)
      );
      const pathwayScore =
        mentor.pathwayTags.length > 0
          ? (pathwayMatches.length / mentor.pathwayTags.length) * 100
          : 0;
      if (pathwayMatches.length > 0) {
        reasons.push(
          `Relevant to your top career pathways`
        );
      }

      // ── Weighted final score ──
      const raw =
        expertiseScore * 0.4 +
        industryScore * 0.2 +
        locationScore * 0.15 +
        pathwayScore * 0.25;

      const matchScore = clamp(Math.round(raw), 35, 98);

      // Ensure at least one reason
      if (reasons.length === 0) {
        reasons.push(
          `${mentor.role} at ${mentor.company} can offer valuable career perspective`
        );
      }

      return {
        ...mentor,
        matchScore,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
