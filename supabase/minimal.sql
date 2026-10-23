-- Minimum schema for Vercel production (document store + public uploads bucket).
-- Run this in the Supabase SQL Editor if you only need the live app data layer.

CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

-- Deny anon/authenticated access; service_role bypasses RLS.
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny all app_state" ON app_state;
-- No policies = no access for non-service roles.

-- Public uploads bucket (ignore error if Storage is unavailable; create via Dashboard).
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('uploads', 'uploads', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Create Storage bucket "uploads" (Public) in the Dashboard if this failed.';
END $$;

-- Public read of uploaded objects; writes go through service_role (bypasses RLS).
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
  CREATE POLICY "Public read uploads"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'uploads');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Add Storage policies for bucket uploads in the Dashboard if this failed.';
END $$;
