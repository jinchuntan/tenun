-- ============================================================
-- Tenun: Core schema + Row-Level Security
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    One row per user. Created automatically on sign-up via trigger.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. CVS
--    A user can have multiple saved CVs.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cvs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'Untitled CV',
  style         TEXT NOT NULL CHECK (style IN ('harvard', 'creative')) DEFAULT 'harvard',
  format        TEXT NOT NULL CHECK (format IN ('resume', 'cv')) DEFAULT 'resume',
  target_job    TEXT,
  is_draft      BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own CVs"
  ON public.cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON public.cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs"
  ON public.cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs"
  ON public.cvs FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 3. CV BLOCKS
--    The individual Lego pieces within a CV.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cv_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id       UUID NOT NULL REFERENCES public.cvs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,    -- e.g. 'work_experience', 'education', 'skills'
  content     JSONB NOT NULL DEFAULT '{}',
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.cv_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own CV blocks"
  ON public.cv_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV blocks"
  ON public.cv_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CV blocks"
  ON public.cv_blocks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV blocks"
  ON public.cv_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 4. updated_at auto-update trigger (applies to all tables)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_cvs_updated_at ON public.cvs;
CREATE TRIGGER set_cvs_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_cv_blocks_updated_at ON public.cv_blocks;
CREATE TRIGGER set_cv_blocks_updated_at
  BEFORE UPDATE ON public.cv_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
