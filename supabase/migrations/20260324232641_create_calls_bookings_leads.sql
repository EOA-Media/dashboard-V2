/*
  # Create core tables: calls, bookings, leads

  ## Summary
  Sets up the three primary data tables for the EOA Media AI receptionist dashboard.
  These tables receive data from RetellAI (calls/leads) and Cal.com (bookings) via webhooks.

  ## Tables

  ### public.calls
  - Records every inbound call handled by the AI receptionist
  - `id` (uuid, PK) — unique call identifier
  - `phone` (text) — caller's phone number
  - `caller_name` (text, nullable) — extracted caller name
  - `timestamp` (timestamptz) — when the call occurred
  - `duration` (int, nullable) — call length in seconds; 0 or null = missed
  - `summary` (text, nullable) — AI-generated call summary
  - `outcome` (text, nullable) — what happened (e.g., "Appointment booked", "No booking")

  ### public.bookings
  - Records appointments booked via Cal.com or the AI receptionist
  - `id` (uuid, PK)
  - `name` (text, nullable) — customer name
  - `phone` (text, nullable) — customer phone
  - `booking_time` (timestamptz) — scheduled appointment time
  - `status` (text) — one of: confirmed, pending, cancelled, completed
  - `notes` (text, nullable) — service type or notes from the booking

  ### public.leads
  - Records qualified leads captured during calls
  - `id` (uuid, PK)
  - `name` (text, nullable) — lead name
  - `phone` (text, nullable) — lead phone
  - `issue` (text, nullable) — reason for contact / problem description
  - `address` (text, nullable) — service address

  ## Security
  - RLS enabled on all tables
  - Public read-only access allowed (anon key) for dashboard display
  - Insert allowed for anon key to support incoming webhooks
*/

CREATE TABLE IF NOT EXISTS public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL DEFAULT '',
  caller_name text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  duration integer,
  summary text,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  booking_time timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  issue text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read calls"
  ON public.calls FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Webhooks can insert calls"
  ON public.calls FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read bookings"
  ON public.bookings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Webhooks can insert bookings"
  ON public.bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read leads"
  ON public.leads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Webhooks can insert leads"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_calls_timestamp ON public.calls (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_time ON public.bookings (booking_time DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
