import { createClient } from "@/lib/supabase/client";
import type { GameResult } from "./types";

// Persists a completed play-through. Supabase is the source of truth when it's
// configured and the player is signed in; otherwise we fall back to
// localStorage so the simulator is fully playable in the prototype (mirrors the
// roles/portfolio pattern). Results are portfolio evidence employers can read.

const LS_KEY = "tenun.simulator.results";

export type SaveOutcome = "saved" | "local" | "error";

function readLocal(): GameResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as GameResult[];
  } catch {
    return [];
  }
}

function writeLocal(results: GameResult[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(results));
  } catch {
    // Storage full / disabled — nothing actionable; the run still completed.
  }
}

/** All of this browser's locally-stored runs (used as a fallback history). */
export function getLocalResults(): GameResult[] {
  return readLocal();
}

export async function saveResult(result: GameResult): Promise<SaveOutcome> {
  // Always keep a local copy so a run is never lost, even when signed out.
  writeLocal([result, ...readLocal()].slice(0, 50));

  const supabase = createClient();
  if (!supabase) return "local";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "local"; // Anonymous play — local-only, prompt to sign in.

    const { error } = await supabase.from("simulator_results").insert({
      user_id: user.id,
      game_id: result.gameId,
      role: result.role,
      awarded: result.awarded,
      max: result.max,
      percent: result.percent,
      interest: result.interest,
      steps: result.steps,
      completed_at: result.completedAt,
    });
    if (error) throw error;
    return "saved";
  } catch {
    return "error";
  }
}
