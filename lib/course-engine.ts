import {
  UserProfile,
  SkillGap,
  PathwayCard,
  PersonalizedCourseRecommendation,
} from "./types";
import { mockCourseRecommendations } from "./mock-courses";
import { clamp } from "./utils";

export function personalizeCourses(
  profile: UserProfile,
  skillGaps: SkillGap[],
  pathways: PathwayCard[],
  recommendedPathway: string
): PersonalizedCourseRecommendation[] {
  const gapSkills = skillGaps.map((g) => g.skill.toLowerCase());
  const highPriorityGaps = skillGaps
    .filter((g) => g.priority === "high")
    .map((g) => g.skill.toLowerCase());

  const topPathwayIds = pathways
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => p.id);

  return mockCourseRecommendations
    .map((rec) => {
      // ── Skill gap match (50%) ──
      const matchingGaps = rec.skillGapsClosed.filter((skill) =>
        gapSkills.some(
          (g) => g.includes(skill.toLowerCase()) || skill.toLowerCase().includes(g)
        )
      );
      const highPriorityMatches = rec.skillGapsClosed.filter((skill) =>
        highPriorityGaps.some(
          (g) => g.includes(skill.toLowerCase()) || skill.toLowerCase().includes(g)
        )
      );
      const gapScore =
        rec.skillGapsClosed.length > 0
          ? (matchingGaps.length / rec.skillGapsClosed.length) * 70 +
            highPriorityMatches.length * 10
          : 0;

      // ── Pathway alignment (30%) ──
      const pathwayMatches = rec.relevantPathways.filter((p) =>
        topPathwayIds.includes(p)
      );
      let pathwayScore =
        rec.relevantPathways.length > 0
          ? (pathwayMatches.length / rec.relevantPathways.length) * 80
          : 0;
      // Bonus if it matches the recommended pathway
      if (rec.relevantPathways.includes(recommendedPathway)) {
        pathwayScore += 20;
      }

      // ── Interest alignment (20%) ──
      const interestKeywords = profile.interests.map((i) => i.toLowerCase());
      const titleWords = rec.title.toLowerCase();
      const providerWords = rec.provider.toLowerCase();
      const interestHits = interestKeywords.filter(
        (i) =>
          titleWords.includes(i) ||
          providerWords.includes(i) ||
          rec.skillGapsClosed.some((s) => s.toLowerCase().includes(i))
      );
      const interestScore = interestHits.length > 0 ? 60 + interestHits.length * 15 : 30;

      // ── Weighted final score ──
      const raw = gapScore * 0.5 + pathwayScore * 0.3 + interestScore * 0.2;
      const relevanceScore = clamp(Math.round(raw), 20, 98);

      return {
        ...rec,
        relevanceScore,
        matchingGaps,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
