-- ============================================================
-- Tenun: Employer job postings (roles)
-- The structured JD that drives Best-fit candidates + Compare.
-- The prototype persists roles client-side (localStorage); this table
-- is the server-side home for when the employer backend is wired in.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  level               TEXT NOT NULL DEFAULT 'Entry'
                        CHECK (level IN ('Internship', 'Entry', 'Mid', 'Senior')),
  location            TEXT,
  work_mode           TEXT NOT NULL DEFAULT 'On-site'
                        CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
  must_have_skills    TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have_skills TEXT[] NOT NULL DEFAULT '{}',
  salary_min          INTEGER,
  salary_max          INTEGER,
  context             TEXT,
  stage               TEXT NOT NULL DEFAULT 'Posted'
                        CHECK (stage IN ('Posted', 'Reviewing', 'Contacted', 'Interviewing')),
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Owner-only access: an employer sees and edits only their own roles.
CREATE POLICY "owner reads roles"  ON public.roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner inserts roles" ON public.roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates roles" ON public.roles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes roles" ON public.roles FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS roles_user_id_idx ON public.roles (user_id);

DROP TRIGGER IF EXISTS set_roles_updated_at ON public.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
