-- ============================================================
-- Tenun: Account type (candidate vs employer)
-- Adds a role to profiles so we can route + gate the two
-- dashboards. Run in Supabase SQL editor after the base schema.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Add account_type to profiles
--    Existing rows default to 'candidate' (the original audience).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'candidate'
  CHECK (account_type IN ('candidate', 'employer'));

-- Index so middleware/role lookups stay fast as the table grows.
CREATE INDEX IF NOT EXISTS profiles_account_type_idx
  ON public.profiles (account_type);

-- ────────────────────────────────────────────────────────────
-- 2. Persist account_type on sign-up
--    The client passes account_type in the sign-up metadata
--    (raw_user_meta_data); copy it into the profile row.
--    Falls back to 'candidate' when absent.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'account_type', ''), 'candidate')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
