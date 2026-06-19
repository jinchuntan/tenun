"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeedbackCallout } from "@/components/simulator/FeedbackCallout";
import type { DecisionStep, StepResult } from "@/lib/simulator/types";

interface Props {
  step: DecisionStep;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

export function DecisionStepView({ step, revealed, onSubmit }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const locked = revealed !== null;
  const chosenId = (revealed?.answer as string) ?? picked;
  const chosen = step.options.find((o) => o.id === chosenId);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {step.options.map((opt) => {
          const isPicked = chosenId === opt.id;
          const showCorrect = locked && opt.correct;
          const showWrong = locked && isPicked && !opt.correct;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={locked}
              onClick={() => setPicked(opt.id)}
              className={cn(
                "w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition-all",
                "disabled:cursor-default",
                showCorrect && "border-emerald-400 bg-emerald-50",
                showWrong && "border-amber-400 bg-amber-50",
                !locked && isPicked && "border-navy-700 bg-navy-50",
                !locked && !isPicked && "border-beige-200 bg-white hover:border-navy-300",
                locked && !showCorrect && !showWrong && "border-beige-200 bg-white opacity-60"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {!locked && (
        <Button disabled={!picked} onClick={() => onSubmit(picked)}>
          Lock in answer
        </Button>
      )}

      {locked && chosen && (
        <FeedbackCallout correct={revealed!.correct}>
          <p>{chosen.feedback}</p>
        </FeedbackCallout>
      )}
    </div>
  );
}
