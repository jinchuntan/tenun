"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeedbackCallout } from "@/components/simulator/FeedbackCallout";
import type { ChecklistStep, StepResult } from "@/lib/simulator/types";

interface Props {
  step: ChecklistStep;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

export function ChecklistStepView({ step, revealed, onSubmit }: Props) {
  const [done, setDone] = useState<string[]>([]);
  const locked = revealed !== null;
  const checked = locked ? ((revealed!.answer as string[]) ?? []) : done;
  const missedRequired = step.tasks.filter((t) => t.required && !checked.includes(t.id));

  function toggle(id: string) {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {step.tasks.map((task) => {
          const isChecked = checked.includes(task.id);
          const isMissed = locked && task.required && !isChecked;
          return (
            <button
              key={task.id}
              type="button"
              disabled={locked}
              onClick={() => toggle(task.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all disabled:cursor-default",
                isChecked && "border-emerald-300 bg-emerald-50",
                !isChecked && !isMissed && "border-beige-200 bg-white hover:border-navy-300",
                isMissed && "border-amber-400 bg-amber-50"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold text-white",
                  isChecked ? "border-emerald-500 bg-emerald-500" : "border-navy-300 bg-white"
                )}
              >
                {isChecked ? "✓" : ""}
              </span>
              <span className="text-navy-800">{task.label}</span>
              {task.required && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!locked && (
        <Button onClick={() => onSubmit(done)}>Confirm checklist</Button>
      )}

      {locked && (
        <FeedbackCallout correct={revealed!.correct}>
          {missedRequired.length > 0 ? (
            <p>{step.escalationNote}</p>
          ) : (
            <p>Every required step done — the new hire is set up and nothing slips through.</p>
          )}
        </FeedbackCallout>
      )}
    </div>
  );
}
