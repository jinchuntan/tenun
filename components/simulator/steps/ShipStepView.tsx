"use client";

import { Button } from "@/components/ui/button";
import { FeedbackCallout } from "@/components/simulator/FeedbackCallout";
import type { ShipStep, StepResult } from "@/lib/simulator/types";

interface Props {
  step: ShipStep;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

/** The satisfying final action — merge / send / submit. Always succeeds; it's
 *  the act of shipping that completes the flow. */
export function ShipStepView({ step, revealed, onSubmit }: Props) {
  const locked = revealed !== null;

  return (
    <div className="space-y-3">
      {!locked && (
        <Button variant="secondary" size="lg" onClick={() => onSubmit("shipped")}>
          {step.action} →
        </Button>
      )}

      {locked && (
        <FeedbackCallout correct>
          <p>{step.successNote}</p>
        </FeedbackCallout>
      )}
    </div>
  );
}
