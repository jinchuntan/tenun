-- ============================================================
-- Tenun: Portfolio / project evidence
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
--
-- OPTIONAL future persistence layer for the CV Generator's portfolio /
-- project evidence. The app currently keeps this data client-side
-- (localStorage, via lib/portfolio-store.ts) to stay consistent with the
-- session-based profile. Apply this migration when you are ready to persist
-- portfolio evidence per user; lib/portfolio-store.ts is the single place to
-- swap the localStorage calls for Supabase reads/writes.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  role           TEXT,
  tools          TEXT[],
  outcome        TEXT,
  url            TEXT,
  source         TEXT DEFAULT 'manual',
  extracted_text TEXT,
  file_name      TEXT,
  file_type      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS portfolio_items_user_id_idx
  ON public.portfolio_items (user_id);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS: each user can only see and mutate their own portfolio items.
CREATE POLICY "Users can read own portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio items"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio items"
  ON public.portfolio_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio items"
  ON public.portfolio_items FOR DELETE
  USING (auth.uid() = user_id);

-- Reuse the shared updated_at trigger from the core schema migration.
DROP TRIGGER IF EXISTS set_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER set_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
