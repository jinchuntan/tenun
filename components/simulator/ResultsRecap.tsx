"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadGame, setInterest, setSaveStatus } from "@/store/slices/simulatorSlice";
import { performanceBand } from "@/lib/simulator/engine";
import { saveResult } from "@/lib/simulator/persist";
import type { Game, InterestSignal } from "@/lib/simulator/types";

const INTEREST_OPTIONS: { value: InterestSignal; emoji: string; label: string }[] = [
  { value: "loved", emoji: "😍", label: "Loved it" },
  { value: "liked", emoji: "🙂", label: "Liked it" },
  { value: "neutral", emoji: "😐", label: "Meh" },
  { value: "disliked", emoji: "😕", label: "Not for me" },
];

export function ResultsRecap({ game }: { game: Game }) {
  const dispatch = useAppDispatch();
  const { finalResult, interest, saveStatus } = useAppSelector((s) => s.simulator);
  const [outcome, setOutcome] = useState<"saved" | "local" | "error" | null>(null);

  // Persist the run as soon as it completes (keeps a local copy regardless, and
  // writes to Supabase when signed in — that's the employer-visible portfolio row).
  useEffect(() => {
    if (!finalResult) return;
    dispatch(setSaveStatus("saving"));
    saveResult(finalResult).then((res) => {
      setOutcome(res);
      dispatch(setSaveStatus(res === "error" ? "error" : "saved"));
    });
    // Re-run when the interest signal changes so it's captured in the saved row.
  }, [finalResult, interest, dispatch]);

  if (!finalResult) return null;
  const band = performanceBand(finalResult.percent);
  const correctCount = finalResult.steps.filter((s) => s.correct).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-navy-100 bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">
          {game.role} · Run complete
        </p>
        <p className="mt-3 font-display text-4xl text-navy-900">{band}</p>
        <p className="mt-1 text-sm text-navy-500">
          You made the right call on {correctCount} of {finalResult.steps.length} moments
          {" · "}
          {finalResult.percent}% overall
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {finalResult.steps.map((s, i) => (
            <span
              key={s.stepId}
              title={`Step ${i + 1}`}
              className={cn(
                "h-2.5 w-8 rounded-full",
                s.correct ? "bg-emerald-400" : "bg-amber-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* The Tenun payoff: did you actually enjoy the work? */}
      <div className="rounded-2xl border-2 border-beige-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-navy-900">{game.interestPrompt}</h3>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => dispatch(setInterest(opt.value))}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm transition-all",
                interest === opt.value
                  ? "border-navy-700 bg-navy-50"
                  : "border-beige-200 bg-white hover:border-navy-300"
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium text-navy-700">{opt.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-navy-400">
          {saveStatus === "saving" && "Saving your run…"}
          {outcome === "saved" && "Saved to your portfolio — employers can see this run."}
          {outcome === "local" && (
            <>
              Saved on this device.{" "}
              <Link href="/login" className="font-semibold text-navy-700 underline">
                Sign in
              </Link>{" "}
              to add it to your portfolio so employers can see it.
            </>
          )}
          {outcome === "error" && "Saved locally — we'll retry syncing to your portfolio later."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => dispatch(loadGame(game))}>Play again</Button>
        <Button asChild variant="outline">
          <Link href="/simulator">Try another job</Link>
        </Button>
      </div>
    </div>
  );
}
