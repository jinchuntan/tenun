import type { Game } from "@/lib/simulator/types";
import { swePrGame } from "./swe-workflow";
import { creativeClientGame } from "./creative-client";
import { hrInboxGame } from "./hr-inbox";

// The gallery's registry. Add a game here and it appears in /simulator
// automatically. Order: SWE · Creative · HR.
export const GAMES: Game[] = [swePrGame, creativeClientGame, hrInboxGame];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
