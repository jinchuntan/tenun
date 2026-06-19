import type { ComponentType } from "react";
import type { Game } from "@/lib/simulator/types";
import { SwePlayer } from "./SwePlayer";
import { HrPlayer } from "./HrPlayer";
import { CreativePlayer } from "./CreativePlayer";

// Registry of bespoke play surfaces, keyed by game id. A game listed here runs
// its own mechanic during the "playing" phase; the shared frame (intro, recap,
// persistence) still wraps it.
export const BESPOKE_PLAYERS: Record<string, ComponentType<{ game: Game }>> = {
  "swe-pr-review": SwePlayer,
  "hr-inbox": HrPlayer,
  "creative-social-post": CreativePlayer,
};
