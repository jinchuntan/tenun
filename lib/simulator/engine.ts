// Job Simulator — scenario engine.
// Pure functions: validate a player's answer for a step and compute scores.
// Kept free of React/Redux so it can be unit-tested and reused by the slice.

import type {
  AnswerCheck,
  Step,
  StepResult,
  GameResult,
  Game,
  InterestSignal,
} from "./types";

/** Lowercase, collapse whitespace, strip most punctuation for forgiving matching. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Run a free-type answer against an AnswerCheck. Returns pass/fail. */
export function checkAnswer(raw: string, check: AnswerCheck): boolean {
  const value = normalize(raw);
  if (!value) return false;

  if (check.pattern) {
    try {
      if (!new RegExp(check.pattern).test(raw.trim())) return false;
    } catch {
      // A malformed authored regex should not hard-fail the player.
    }
  }
  if (check.mustInclude?.some((t) => !value.includes(normalize(t)))) return false;
  if (check.mustNotInclude?.some((t) => value.includes(normalize(t)))) return false;
  if (
    check.mustIncludeAny &&
    check.mustIncludeAny.length > 0 &&
    !check.mustIncludeAny.some((t) => value.includes(normalize(t)))
  ) {
    return false;
  }
  if (check.mustIncludeAnyOf) {
    for (const group of check.mustIncludeAnyOf) {
      if (group.length > 0 && !group.some((t) => value.includes(normalize(t)))) {
        return false;
      }
    }
  }
  return true;
}

/** Same set, ignoring order — used by spot-issue line selection. */
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

/**
 * Grade one step against the player's answer. Each primitive interprets its
 * own answer shape, so the player components stay simple and the grading lives
 * in one place.
 */
export function gradeStep(step: Step, answer: unknown): StepResult {
  let correct = false;

  switch (step.kind) {
    case "decision": {
      const picked = step.options.find((o) => o.id === answer);
      correct = !!picked?.correct;
      break;
    }
    case "spot-issue": {
      const ids = Array.isArray(answer) ? (answer as string[]) : [];
      correct = sameSet(ids, step.buggyLineIds);
      break;
    }
    case "edit":
    case "name-it":
    case "compose": {
      correct = typeof answer === "string" && checkAnswer(answer, step.check);
      break;
    }
    case "checklist": {
      const done = new Set(Array.isArray(answer) ? (answer as string[]) : []);
      // All required tasks must be checked; missing one is the escalation lesson.
      correct = step.tasks.filter((t) => t.required).every((t) => done.has(t.id));
      break;
    }
    case "ship": {
      // Shipping is the act of completing the flow — always "correct".
      correct = true;
      break;
    }
  }

  return {
    stepId: step.id,
    kind: step.kind,
    correct,
    awarded: correct ? step.points : 0,
    max: step.points,
    answer,
  };
}

export function scoreResults(
  game: Game,
  steps: StepResult[],
  interest: InterestSignal | null
): GameResult {
  const awarded = steps.reduce((sum, s) => sum + s.awarded, 0);
  const max = steps.reduce((sum, s) => sum + s.max, 0);
  return {
    gameId: game.id,
    role: game.role,
    steps,
    awarded,
    max,
    percent: max === 0 ? 0 : Math.round((awarded / max) * 100),
    interest,
    completedAt: new Date().toISOString(),
  };
}

/** Qualitative band for the recap (Tenun avoids bare numbers in places). */
export function performanceBand(percent: number): string {
  if (percent >= 90) return "Ship-ready";
  if (percent >= 70) return "Solid, with notes";
  if (percent >= 50) return "Getting the hang of it";
  return "Early days";
}
