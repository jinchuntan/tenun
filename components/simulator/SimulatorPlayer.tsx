"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadGame, startGame, submitStep, advance } from "@/store/slices/simulatorSlice";
import { StepRenderer } from "@/components/simulator/steps/StepRenderer";
import { ResultsRecap } from "@/components/simulator/ResultsRecap";
import { BESPOKE_PLAYERS } from "@/components/simulator/bespoke";
import type { Game } from "@/lib/simulator/types";

export function SimulatorPlayer({ game }: { game: Game }) {
  const dispatch = useAppDispatch();
  const { phase, stepIndex, lastResult, results } = useAppSelector((s) => s.simulator);
  const loadedId = useAppSelector((s) => s.simulator.game?.id);

  // Load (and reset) whenever a different game mounts.
  useEffect(() => {
    if (loadedId !== game.id) dispatch(loadGame(game));
  }, [game, loadedId, dispatch]);

  // Guard the first render before loadGame settles, or after a reset elsewhere.
  if (loadedId !== game.id) return null;

  const BespokeSurface = BESPOKE_PLAYERS[game.id];

  if (phase === "intro") {
    const summary = game.playSummary ?? `${game.steps.length} moments`;
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-beige-200 bg-white p-7 shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-3xl">
          {game.icon}
        </span>
        <h1 className="mt-4 font-display text-2xl text-navy-900">{game.role}</h1>
        <p className="mt-3 leading-relaxed text-navy-600">{game.intro}</p>
        <p className="mt-4 text-sm text-navy-400">
          {summary} · about {game.minutes} minutes
        </p>
        <Button className="mt-6" size="lg" onClick={() => dispatch(startGame())}>
          Start the day →
        </Button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="mx-auto max-w-2xl">
        <ResultsRecap game={game} />
      </div>
    );
  }

  // Bespoke games (SWE/HR/Creative) own the playing phase entirely.
  if (BespokeSurface) {
    return <BespokeSurface game={game} />;
  }

  // playing / reveal — generic step renderer (games not yet migrated)
  const step = game.steps[stepIndex];
  const total = game.steps.length;
  const progress = Math.round((results.length / total) * 100);

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-navy-400">
          <span>
            Step {stepIndex + 1} of {total}
          </span>
          <span className="capitalize">{step.kind.replace("-", " ")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-beige-200">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-beige-200 bg-white p-6 shadow-sm">
        {step.brief && (
          <div className="mb-4 rounded-xl border-l-4 border-navy-300 bg-navy-50/60 px-4 py-3 text-sm text-navy-700">
            {step.brief}
          </div>
        )}
        <h2 className="mb-4 text-lg font-semibold text-navy-900">{step.prompt}</h2>

        <StepRenderer
          step={step}
          revealed={phase === "reveal" ? lastResult : null}
          onSubmit={(answer) => dispatch(submitStep(answer))}
        />

        {phase === "reveal" && (
          <div className="mt-5 flex justify-end">
            <Button variant="secondary" onClick={() => dispatch(advance())}>
              {stepIndex >= total - 1 ? "See your results →" : "Continue →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
