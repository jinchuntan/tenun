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
  contextLabel: string;
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
  salary?: string;
  level?: "entry" | "mid" | "senior" | "executive";
  externalLink?: string;
}

export interface CourseResource {
  name: string;
  provider: string;
  platform: "Coursera" | "Udemy" | "edX" | "LinkedIn Learning" | "YouTube" | "Other";
  description: string;
  duration: string;
  url: string;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
  resources: string[];
  courses: CourseResource[];
}

export interface FamousFigure {
  name: string;
  trait: string;
  emoji: string;
  color: string;
}

export interface CareerArchetype {
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  keywords: string[];
  color: string;
  figures: FamousFigure[];
}

export interface CareerWeaveResult {
  threads: CareerThread[];
  pathways: PathwayCard[];
  opportunities: Opportunity[];
  recommendedPathway: string;
  summary: string;
  skillGaps: SkillGap[];
  archetype: CareerArchetype;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  organization: string;
  expertise: string[];
  background: string;
  matchReason: string;
  location: string;
  responseTime: string;
  linkedinUrl?: string;
  email?: string;
}

export interface MentorContact {
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  sentAt: string;
  followUps: string[];
  status: "sent" | "replied" | "no-response";
  subject: string;
  body: string;
}

export interface RadarDataPoint {
  thread: string;
  score: number;
  fullMark: 100;
}
