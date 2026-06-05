// Shared types for the AI Mock Interview feature (dedicated interview-practice
// workspace — unrelated to the chatbot / Tenun Guide).

export type InterviewType = "general" | "behavioural" | "technical" | "cv_based";
export type Difficulty = "easy" | "medium" | "challenging";
export type Locale = "en" | "ms";

export interface Feedback {
  score: number;
  summary: string;
  whatWentWell: string[];
  toImprove: string[];
  sampleAnswer: string;
}

export interface HistoryItem {
  question: string;
  answer?: string;
  feedback?: Feedback;
}

export interface FinalReport {
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  recommendedPractice: string[];
}

export interface InterviewConfig {
  targetRole: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  cvContext: string;
}
