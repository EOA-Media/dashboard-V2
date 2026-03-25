/*
  # Enable Realtime for calls and bookings tables

  ## Summary
  Enables Supabase Realtime publication on the `calls` and `bookings` tables
  so that INSERT events are broadcast to subscribed clients.

  ## Changes
  - Adds `calls` to the `supabase_realtime` publication
  - Adds `bookings` to the `supabase_realtime` publication
*/

ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
