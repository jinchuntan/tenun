"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeedbackCallout } from "@/components/simulator/FeedbackCallout";
import type { EditStep, NameItStep, ComposeStep, StepResult } from "@/lib/simulator/types";

type FreeTypeStep = EditStep | NameItStep | ComposeStep;

interface Props {
  step: FreeTypeStep;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

function isEdit(step: FreeTypeStep): step is EditStep {
  return step.kind === "edit";
}

/** Powers the three free-type primitives: edit (rewrite code/copy),
 *  name-it (file/branch name), and compose (message/email). */
export function FreeTypeStepView({ step, revealed, onSubmit }: Props) {
  const [value, setValue] = useState(isEdit(step) ? step.starterText : "");
  const locked = revealed !== null;
  const submitted = locked ? ((revealed!.answer as string) ?? "") : value;
  const multiline = step.kind === "compose" || (isEdit(step) && step.multiline !== false);

  const placeholder =
    step.kind === "name-it"
      ? step.placeholder ?? "type the name…"
      : step.kind === "compose"
        ? step.placeholder ?? "write your message…"
        : undefined;

  const sharedClass = cn(
    "w-full rounded-xl border-2 bg-white px-4 py-3 font-mono text-sm text-navy-900",
    "focus:outline-none focus:ring-2 focus:ring-navy-300",
    locked ? "border-beige-200 opacity-80" : "border-beige-200 focus:border-navy-400"
  );

  return (
    <div className="space-y-3">
      {step.kind === "name-it" && step.hint && !locked && (
        <p className="text-xs text-navy-500">Hint: {step.hint}</p>
      )}

      {multiline ? (
        <textarea
          value={submitted}
          disabled={locked}
          rows={isEdit(step) ? Math.max(4, step.starterText.split("\n").length + 1) : 5}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className={cn(sharedClass, "resize-y leading-relaxed")}
        />
      ) : (
        <input
          type="text"
          value={submitted}
          disabled={locked}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className={sharedClass}
        />
      )}

      {!locked && (
        <Button disabled={value.trim().length === 0} onClick={() => onSubmit(value)}>
          Submit
        </Button>
      )}

      {locked && (
        <FeedbackCallout correct={revealed!.correct}>
          <p className="mb-2">{step.feedback}</p>
          <p className="rounded-lg bg-white/60 px-3 py-2 font-mono text-xs text-navy-800">
            <span className="font-sans font-semibold text-navy-600">Reference: </span>
            {step.exemplar}
          </p>
        </FeedbackCallout>
      )}
    </div>
  );
}
