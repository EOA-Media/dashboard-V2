/*
  # Add role support to profiles and update RLS policies

  ## Summary
  Adds admin/client role system to the dashboard.

  ## Changes

  ### Modified Tables
  - `profiles`
    - New column: `role` (text, default 'client') — values: 'client' | 'admin'

  ### RLS Policy Updates
  - `calls` — admin users can read all calls; clients still see only their own
  - `bookings` — admin users can read all bookings; clients still see only their own
  - `leads` — admin users can read all leads; clients still see only their own

  ## Notes
  1. Existing rows default to 'client' role
  2. Admin check uses a helper function `is_admin()` for clean, reusable policy logic
  3. No data is dropped or deleted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'client';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Authenticated users can read own calls" ON calls;
DROP POLICY IF EXISTS "Users can read own calls" ON calls;
DROP POLICY IF EXISTS "Admin can read all calls" ON calls;

CREATE POLICY "Users can read own calls"
  ON calls FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Authenticated users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can read all bookings" ON bookings;

CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Authenticated users can read own leads" ON leads;
DROP POLICY IF EXISTS "Users can read own leads" ON leads;
DROP POLICY IF EXISTS "Admin can read all leads" ON leads;

CREATE POLICY "Users can read own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());
