/*
  # Fix Security Issues: Indexes, RLS Policies, and Duplicate Policies

  ## Summary
  This migration addresses multiple security and performance issues:

  1. **Missing Foreign Key Indexes**
     - Add indexes on bookings.lead_id, bookings.user_id
     - Add indexes on calls.lead_id, calls.user_id
     - Add indexes on leads.user_id
     These prevent sequential scans when joining/filtering on foreign keys.

  2. **RLS Auth Function Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This causes auth.uid() to be evaluated once per query instead of once per row,
       significantly improving performance at scale.

  3. **Remove Duplicate/Overly Permissive Policies**
     - Drop the broad "Enable insert for authenticated users only" and
       "Enable read access for all users" policies that conflict with
       the tighter ownership-based policies.
     - These were also flagged as "always true" (no row ownership check).

  4. **Tables affected**: calls, leads, bookings, profiles
*/

-- ─── Foreign Key Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bookings_lead_id ON public.bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id    ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id    ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id    ON public.leads(user_id);

-- ─── Drop duplicate / overly-permissive policies ──────────────────────────

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.calls;
DROP POLICY IF EXISTS "Enable read access for all users"           ON public.calls;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for all users"           ON public.leads;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users"           ON public.bookings;

-- ─── Drop existing ownership policies (will recreate with optimized auth.uid()) ──

DROP POLICY IF EXISTS "Users can view own calls"    ON public.calls;
DROP POLICY IF EXISTS "Users can insert own calls"  ON public.calls;
DROP POLICY IF EXISTS "Users can update own calls"  ON public.calls;

DROP POLICY IF EXISTS "Users can view own leads"    ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads"  ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads"  ON public.leads;

DROP POLICY IF EXISTS "Users can view own bookings"   ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can view own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;

-- ─── Recreate calls policies with (select auth.uid()) ─────────────────────

CREATE POLICY "Users can view own calls"
  ON public.calls FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own calls"
  ON public.calls FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own calls"
  ON public.calls FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── Recreate leads policies with (select auth.uid()) ─────────────────────

CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── Recreate bookings policies with (select auth.uid()) ──────────────────

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── Recreate profiles policies with (select auth.uid()) ──────────────────

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
