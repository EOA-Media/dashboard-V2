/*
  # Add UPDATE RLS policies for calls, leads, and bookings

  ## Summary
  Allows authenticated users to update their own records. Admins can update any record.
  Uses the existing is_admin() helper function for consistent permission logic.

  ## Changes

  ### Security
  - `calls`: New UPDATE policy — owner or admin
  - `leads`: New UPDATE policy — owner or admin
  - `bookings`: New UPDATE policy — owner or admin

  ## Notes
  1. No data is dropped
  2. Clients can only update records they own (user_id = auth.uid())
  3. Admins can update any record via is_admin()
*/

DROP POLICY IF EXISTS "Users can update own calls" ON calls;
CREATE POLICY "Users can update own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Users can update own leads" ON leads;
CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());
