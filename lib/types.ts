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
  targetJob?: string;
}

export interface JobSuggestion {
  title: string;
  explanation: string;
  resumeSkills: string[];
  dayToDay: string;
  salaryRange?: string;
  industries?: string[];
}

export interface JobIntentResult {
  overview: string;
  didYouMean: string[];
  suggestions: JobSuggestion[];
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
  targetJob?: string;
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

// ── Global Career Atlas ──

export type AtlasRegion =
  | "Southeast Asia"
  | "East Asia"
  | "Middle East"
  | "Europe"
  | "North America"
  | "Oceania";

export type MobilityDifficulty = "Low" | "Medium" | "High";
export type CostOfLiving = "Low" | "Medium" | "High" | "Very High";
export type WorkMode = "Remote" | "Hybrid" | "On-site";

export interface CareerHub {
  id: string;
  city: string;
  country: string;
  region: AtlasRegion;
  coordinates: [number, number]; // [longitude, latitude]
  hubType: string;
  tagline: string;
  industries: string[];
  demandSkills: string[];
  suitableRoles: string[];
  salaryRange: { min: number; max: number; currency: string };
  workModes: WorkMode[];
  mobilityDifficulty: MobilityDifficulty;
  costOfLiving: CostOfLiving;
  opportunities: { title: string; type: string; organization: string }[];
  recommendedActions: string[];
  pathwayTags: string[];
}

export interface PersonalizedHub extends CareerHub {
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  matchReasons: string[];
}

// ── Mentor Bridge ──

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  expertise: string[];
  bio: string;
  imageInitials: string;
  suggestedQuestions: string[];
  pathwayTags: string[];
}

export interface PersonalizedMentor extends Mentor {
  matchScore: number;
  matchReasons: string[];
}

// ── Outreach Studio ──

export type OutreachMessageType =
  | "cold-email"
  | "linkedin-message"
  | "mentorship-request"
  | "follow-up"
  | "self-intro"
  | "why-good-fit";

export interface OutreachDraft {
  id: string;
  type: OutreachMessageType;
  subject?: string;
  body: string;
  recipientContext: string;
}

// ── Course & Portfolio Recommendations ──

export type RecommendationType =
  | "course"
  | "certification"
  | "portfolio-project"
  | "community"
  | "hackathon"
  | "internship";

export interface CourseRecommendation {
  id: string;
  title: string;
  type: RecommendationType;
  provider: string;
  duration?: string;
  cost?: string;
  url?: string;
  skillGapsClosed: string[];
  whyItMatters: string;
  pathwayImprovement: string;
  relevantPathways: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface PersonalizedCourseRecommendation extends CourseRecommendation {
  relevanceScore: number;
  matchingGaps: string[];
}
