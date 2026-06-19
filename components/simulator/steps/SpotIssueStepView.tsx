"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeedbackCallout } from "@/components/simulator/FeedbackCallout";
import type { SpotIssueStep, StepResult } from "@/lib/simulator/types";

interface Props {
  step: SpotIssueStep;
  revealed: StepResult | null;
  onSubmit: (answer: unknown) => void;
}

export function SpotIssueStepView({ step, revealed, onSubmit }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const locked = revealed !== null;
  const picked = locked ? ((revealed!.answer as string[]) ?? []) : selected;
  const buggy = new Set(step.buggyLineIds);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-navy-800 bg-navy-900 font-mono text-[13px] leading-relaxed text-slate-100">
        {step.lines.map((line, i) => {
          const isPicked = picked.includes(line.id);
          const isBuggy = buggy.has(line.id);
          return (
            <button
              key={line.id}
              type="button"
              disabled={locked}
              onClick={() => toggle(line.id)}
              className={cn(
                "flex w-full items-start gap-3 px-3 py-1 text-left transition-colors",
                !locked && "hover:bg-white/5",
                !locked && isPicked && "bg-gold-500/20 ring-1 ring-inset ring-gold-400",
                locked && isBuggy && "bg-emerald-500/25 ring-1 ring-inset ring-emerald-400",
                locked && isPicked && !isBuggy && "bg-amber-500/25 ring-1 ring-inset ring-amber-400"
              )}
            >
              <span className="select-none pr-2 text-slate-500">{i + 1}</span>
              <code className="whitespace-pre-wrap break-all">{line.text}</code>
            </button>
          );
        })}
      </div>

      {!locked && (
        <Button disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
          Flag selected line{selected.length === 1 ? "" : "s"}
        </Button>
      )}

      {locked && (
        <FeedbackCallout correct={revealed!.correct}>
          <p>{step.explanation}</p>
        </FeedbackCallout>
      )}
    </div>
  );
}
