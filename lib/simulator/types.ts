// Job Simulator — shared type system.
//
// A simulator is one Game made of ordered Steps. Each Step is one interaction
// "primitive". Build the primitives once; author new jobs as content. This
// follows the project's deterministic mock-data pattern (no backend to play).

export type JobFamily = "engineering" | "creative" | "people";

export type InteractionKind =
  | "decision" // pick the best option (with consequence feedback)
  | "spot-issue" // click the wrong line/element
  | "edit" // free-type: delete the wrong text, write the correct text
  | "name-it" // free-type input validated against a naming convention
  | "compose" // free-type a message/email, checked for required intent
  | "checklist" // complete/sequence tasks; escalate if a required one is missed
  | "ship"; // the satisfying final action (merge / send / submit)

// ---- Free-type answer validation -------------------------------------------
// All free-type steps (edit/name-it/compose) share one checker. We normalise
// then look for required tokens / forbidden tokens / an optional regex. This is
// forgiving on purpose — we score intent, not exact keystrokes.
export interface AnswerCheck {
  mustInclude?: string[]; // every token must appear (case/space-insensitive)
  mustIncludeAny?: string[]; // at least one must appear
  /** Each group must contribute at least one match (AND of ORs). */
  mustIncludeAnyOf?: string[][];
  mustNotInclude?: string[]; // none may appear
  pattern?: string; // optional regex the whole answer must match
}

interface BaseStep {
  id: string;
  kind: InteractionKind;
  /** Short instruction shown above the interaction. */
  prompt: string;
  /** Optional scene-setting shown as a callout (Slack ping, ticket, etc.). */
  brief?: string;
  /** Points this step contributes to the score. */
  points: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  /** Shown after answering, regardless of correctness. */
  feedback: string;
  correct: boolean;
}

export interface DecisionStep extends BaseStep {
  kind: "decision";
  options: DecisionOption[];
}

export interface CodeLine {
  id: string;
  text: string;
}

export interface SpotIssueStep extends BaseStep {
  kind: "spot-issue";
  /** Rendered as a diff/code surface; user clicks the offending line(s). */
  lines: CodeLine[];
  language?: string;
  buggyLineIds: string[];
  explanation: string;
}

export interface EditStep extends BaseStep {
  kind: "edit";
  /** Pre-filled, editable text the player deletes/rewrites. */
  starterText: string;
  multiline?: boolean;
  check: AnswerCheck;
  /** Reference "good" answer revealed in feedback. */
  exemplar: string;
  feedback: string;
}

export interface NameItStep extends BaseStep {
  kind: "name-it";
  placeholder?: string;
  hint?: string;
  check: AnswerCheck;
  exemplar: string;
  feedback: string;
}

export interface ComposeStep extends BaseStep {
  kind: "compose";
  placeholder?: string;
  check: AnswerCheck;
  exemplar: string;
  feedback: string;
}

export interface ChecklistTask {
  id: string;
  label: string;
  /** Required tasks must be completed; missing one triggers escalation. */
  required: boolean;
}

export interface ChecklistStep extends BaseStep {
  kind: "checklist";
  tasks: ChecklistTask[];
  /** Shown if a required task is left unchecked (the escalation lesson). */
  escalationNote: string;
}

export interface ShipStep extends BaseStep {
  kind: "ship";
  /** Action verb on the button: "Merge", "Send to client", "Submit". */
  action: string;
  successNote: string;
}

export type Step =
  | DecisionStep
  | SpotIssueStep
  | EditStep
  | NameItStep
  | ComposeStep
  | ChecklistStep
  | ShipStep;

export interface Game {
  id: string;
  family: JobFamily;
  /** Card title in the gallery, e.g. "Software Engineer". */
  role: string;
  /** One-line hook for the gallery card. */
  tagline: string;
  /** Emoji/icon key for the card. */
  icon: string;
  /** Estimated play time in minutes. */
  minutes: number;
  /** Longer intro shown on the player's start screen. */
  intro: string;
  /**
   * Subtitle on the start screen. Generic step-games derive it from steps;
   * bespoke games (SWE/HR/Creative) set it explicitly (e.g. "3 PRs to review").
   */
  playSummary?: string;
  /**
   * Ordered steps for generic step-games. Bespoke games run their own play
   * surface and leave this empty (see components/simulator/bespoke).
   */
  steps: Step[];
  /** Post-play reflection — the Tenun "did you enjoy it?" payoff. */
  interestPrompt: string;
}

// ---- Per-play result model -------------------------------------------------
export interface StepResult {
  stepId: string;
  kind: InteractionKind;
  correct: boolean;
  awarded: number;
  max: number;
  /** Serialisable record of what the player did (for review/portfolio). */
  answer: unknown;
}

export type InterestSignal = "loved" | "liked" | "neutral" | "disliked";

export interface GameResult {
  gameId: string;
  role: string;
  steps: StepResult[];
  awarded: number;
  max: number;
  percent: number; // 0–100
  interest: InterestSignal | null;
  completedAt: string; // ISO
}
