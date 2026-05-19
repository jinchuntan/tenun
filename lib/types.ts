export interface UserProfile {
  name: string;
  currentRole: string;
  education: string;
  experience: string;
  skills: string[];
  interests: string[];
  preferredIndustries: string[];
  salaryExpectation: string;
  riskAppetite: "low" | "medium" | "high";
  lifestylePreference: "stability" | "flexibility" | "fast-growth" | "purpose-driven";
  locationPreference: string;
  resumeText?: string;
}

export interface CareerThread {
  id: string;
  name: string;
  icon: string;
  score: number;
  explanation: string;
  improvement: string;
  color: string;
}

export interface PathwayCard {
  id: string;
  name: string;
  icon: string;
  score: number;
  timeline: string;
  description: string;
  roles: string[];
  requiredSkills: string[];
  tradeoffs: string[];
  risks: string[];
  nextActions: string[];
  matchingOpportunities: string[];
  color: string;
  gradient: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: "job" | "internship" | "course" | "project" | "mentor" | "challenge";
  organization: string;
  matchPercentage: number;
  whyMatch: string;
  skillsDeveloped: string[];
  description: string;
  location?: string;
  duration?: string;
}

export interface CareerWeaveResult {
  threads: CareerThread[];
  pathways: PathwayCard[];
  opportunities: Opportunity[];
  recommendedPathway: string;
  summary: string;
  skillGaps: SkillGap[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
  resources: string[];
}

export interface RadarDataPoint {
  thread: string;
  score: number;
  fullMark: 100;
}
