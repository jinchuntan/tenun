-- ============================================================
-- Tenun: Job Simulator results
-- One row per completed play-through. Doubles as a portfolio signal:
-- candidates own their results, and employers can read them (so a strong
-- "Software Engineer" simulation run shows up as evidence on a profile).
--
-- The app persists results client-side (localStorage) when Supabase isn't
-- configured (mirrors the roles/portfolio prototype pattern); this table is the
-- server-side home. See lib/simulator/persist.ts.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.simulator_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id       TEXT NOT NULL,
  role          TEXT NOT NULL,
  awarded       INTEGER NOT NULL DEFAULT 0,
  max           INTEGER NOT NULL DEFAULT 0,
  percent       INTEGER NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
  interest      TEXT CHECK (interest IN ('loved', 'liked', 'neutral', 'disliked')),
  steps         JSONB NOT NULL DEFAULT '[]',
  completed_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.simulator_results ENABLE ROW LEVEL SECURITY;

-- Candidates own their results.
CREATE POLICY "owner reads sim results"
  ON public.simulator_results FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "owner inserts sim results"
  ON public.simulator_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes sim results"
  ON public.simulator_results FOR DELETE
  USING (auth.uid() = user_id);

-- Employers can read everyone's results — simulator runs are portfolio evidence
-- they're meant to see. Gated on the requester being an employer in profiles.
CREATE POLICY "employers read all sim results"
  ON public.simulator_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.account_type = 'employer'
    )
  );

-- Filter/sort hot paths: a candidate's own history and per-game leaderboards.
CREATE INDEX IF NOT EXISTS simulator_results_user_id_idx
  ON public.simulator_results (user_id);
CREATE INDEX IF NOT EXISTS simulator_results_game_id_idx
  ON public.simulator_results (game_id);
