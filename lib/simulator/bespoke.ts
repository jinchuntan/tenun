// Server-safe list of games that use a bespoke play surface (their own
// mechanics) instead of the generic step renderer. Kept JSX-free so server
// components (the player page) can import it to widen the layout. The actual
// component registry lives in components/simulator/bespoke (client-only).
export const BESPOKE_GAME_IDS = new Set<string>(["swe-pr-review", "hr-inbox", "creative-social-post"]);

export function isBespoke(gameId: string): boolean {
  return BESPOKE_GAME_IDS.has(gameId);
}
