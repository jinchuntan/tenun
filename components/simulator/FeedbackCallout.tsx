import { cn } from "@/lib/utils";

interface FeedbackCalloutProps {
  correct: boolean;
  children: React.ReactNode;
}

/** Shown after a step is graded — green for a good call, amber for a miss. */
export function FeedbackCallout({ correct, children }: FeedbackCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 text-sm leading-relaxed",
        correct
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-amber-300 bg-amber-50 text-amber-900"
      )}
    >
      <p className="mb-1 font-semibold">
        {correct ? "Good call." : "Not quite — here's the seasoned take."}
      </p>
      {children}
    </div>
  );
}
