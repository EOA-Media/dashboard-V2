/*
  # Allow admins to read all profiles

  ## Summary
  Adds a SELECT policy on profiles so admin users can fetch all client profiles
  for the user filter dropdown. Clients can still only read their own profile.

  ## Changes
  - `profiles` table: adds admin-read policy
*/

DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());
