"use client";

import type { Step, StepResult } from "@/lib/simulator/types";
import { DecisionStepView } from "./DecisionStepView";
import { SpotIssueStepView } from "./SpotIssueStepView";
import { FreeTypeStepView } from "./FreeTypeStepView";
import { ChecklistStepView } from "./ChecklistStepView";
import { ShipStepView } from "./ShipStepView";

interface Props {
  step: Step;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

/** Routes a step to its interaction primitive. New primitives plug in here. */
export function StepRenderer({ step, revealed, onSubmit }: Props) {
  switch (step.kind) {
    case "decision":
      return <DecisionStepView step={step} revealed={revealed} onSubmit={onSubmit} />;
    case "spot-issue":
      return <SpotIssueStepView step={step} revealed={revealed} onSubmit={onSubmit} />;
    case "edit":
    case "name-it":
    case "compose":
      return <FreeTypeStepView step={step} revealed={revealed} onSubmit={onSubmit} />;
    case "checklist":
      return <ChecklistStepView step={step} revealed={revealed} onSubmit={onSubmit} />;
    case "ship":
      return <ShipStepView step={step} revealed={revealed} onSubmit={onSubmit} />;
  }
}
