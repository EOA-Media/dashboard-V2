import { supabase } from './supabase';
import type { DbCall, DbBooking, DbLead } from './db.types';
import type { Call, Booking, ChartDataPoint } from '../types';

function mapDbCall(row: DbCall): Call {
  const outcome = row.outcome ?? '';
  const isBooked = outcome.toLowerCase().includes('book') || outcome.toLowerCase().includes('appoint');

  return {
    id: row.id,
    caller: {
      name: row.caller_name ?? 'Unknown',
      phone: row.phone ?? '',
    },
    timestamp: row.timestamp,
    duration: row.duration ?? 0,
    status: row.duration === 0 ? 'missed' : 'completed',
    leadStatus: isBooked ? 'qualified' : 'unqualified',
    issue: row.summary ?? 'No summary available',
    outcome: row.outcome ?? 'No outcome recorded',
  };
}

function mapDbBooking(row: DbBooking): Booking {
  const status = (row.status ?? 'pending') as Booking['status'];
  return {
    id: row.id,
    callId: '',
    leadId: row.lead_id ?? undefined,
    caller: {
      name: row.name ?? 'Unknown',
      phone: row.phone ?? '',
    },
    service: row.notes ?? 'Appointment',
    scheduledAt: row.booking_time,
    status: ['confirmed', 'pending', 'cancelled', 'completed'].includes(status)
      ? status
      : 'pending',
    notes: row.notes ?? undefined,
  };
}

export async function fetchCalls(userIds?: string[] | null): Promise<Call[]> {
  let query = supabase
    .from('calls')
    .select('id, phone, caller_name, timestamp, duration, summary, outcome')
    .order('timestamp', { ascending: false });

  if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching calls:', error.message);
    return [];
  }

  return (data as DbCall[]).map(mapDbCall);
}

export async function fetchBookings(userIds?: string[] | null): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select('id, lead_id, name, phone, booking_time, status, notes')
    .order('booking_time', { ascending: false });

  if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings:', error.message);
    return [];
  }

  return (data as DbBooking[]).map(mapDbBooking);
}

export interface LiveLead {
  name: string;
  phone: string;
  issue: string | null;
  address: string | null;
}

export interface LiveBookingDetail {
  id: string;
  service: string;
  scheduledAt: string;
  status: Booking['status'];
  notes: string | null;
}

export interface LiveCallDetail {
  call: Call;
  transcript: string | null;
  lead: LiveLead | null;
  booking: LiveBookingDetail | null;
  leadId: string | null;
}

export async function fetchCallDetails(callId: string): Promise<LiveCallDetail | null> {
  const { data: callRow, error: callError } = await supabase
    .from('calls')
    .select('id, phone, caller_name, lead_id, timestamp, duration, summary, transcript, outcome')
    .eq('id', callId)
    .maybeSingle();

  if (callError || !callRow) {
    console.error('Error fetching call:', callError?.message);
    return null;
  }

  const row = callRow as DbCall & { lead_id: string | null; transcript: string | null };

  const call: Call = {
    id: row.id,
    caller: {
      name: row.caller_name ?? 'Unknown',
      phone: row.phone ?? '',
    },
    timestamp: row.timestamp,
    duration: row.duration ?? 0,
    status: row.duration === 0 ? 'missed' : 'completed',
    leadStatus: (() => {
      const o = (row.outcome ?? '').toLowerCase();
      return o.includes('book') || o.includes('appoint') ? 'qualified' : 'unqualified';
    })(),
    issue: row.summary ?? 'No summary available',
    outcome: row.outcome ?? 'No outcome recorded',
  };

  if (!row.lead_id) {
    return { call, transcript: row.transcript ?? null, lead: null, booking: null, leadId: null };
  }

  const [leadResult, bookingResult] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, phone, issue, address')
      .eq('id', row.lead_id)
      .maybeSingle(),
    supabase
      .from('bookings')
      .select('id, name, booking_time, status, notes')
      .eq('lead_id', row.lead_id)
      .order('booking_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const leadRow = leadResult.data as DbLead | null;
  const bookingRow = bookingResult.data as (DbBooking & { booking_time: string }) | null;

  const lead: LiveLead | null = leadRow
    ? {
        name: leadRow.name ?? 'Unknown',
        phone: leadRow.phone ?? '',
        issue: leadRow.issue,
        address: leadRow.address,
      }
    : null;

  const booking: LiveBookingDetail | null = bookingRow
    ? {
        id: bookingRow.id,
        service: bookingRow.notes ?? 'Appointment',
        scheduledAt: bookingRow.booking_time,
        status: (['confirmed', 'pending', 'cancelled', 'completed'].includes(bookingRow.status ?? '')
          ? bookingRow.status
          : 'pending') as Booking['status'],
        notes: bookingRow.notes,
      }
    : null;

  return { call, transcript: row.transcript ?? null, lead, booking, leadId: row.lead_id };
}

export async function fetchCallIdByLeadId(leadId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('calls')
    .select('id')
    .eq('lead_id', leadId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

export interface LiveMetrics {
  totalCalls: number;
  qualifiedLeads: number;
  bookings: number;
  bookingRate: number;
  missedCalls: number;
  avgDuration: number;
}

export async function fetchMetrics(userIds?: string[] | null): Promise<LiveMetrics> {
  let callsQuery = supabase.from('calls').select('id, duration, outcome');
  let bookingsQuery = supabase.from('bookings').select('id');
  let leadsQuery = supabase.from('leads').select('id');

  if (userIds && userIds.length > 0) {
    callsQuery = callsQuery.in('user_id', userIds);
    bookingsQuery = bookingsQuery.in('user_id', userIds);
    leadsQuery = leadsQuery.in('user_id', userIds);
  }

  const [callsResult, bookingsResult, leadsResult] = await Promise.all([
    callsQuery,
    bookingsQuery,
    leadsQuery,
  ]);

  const calls = (callsResult.data ?? []) as Array<{ id: string; duration: number | null; outcome: string | null }>;
  const bookingCount = bookingsResult.data?.length ?? 0;
  const leadCount = leadsResult.data?.length ?? 0;

  const totalCalls = calls.length;
  const missedCalls = calls.filter((c) => !c.duration || c.duration === 0).length;

  const bookedOutcomes = calls.filter((c) => {
    const o = (c.outcome ?? '').toLowerCase();
    return o.includes('book') || o.includes('appoint') || o.includes('lead');
  }).length;

  const qualifiedLeads = leadCount > 0 ? leadCount : bookedOutcomes;

  const durations = calls.map((c) => c.duration ?? 0).filter((d) => d > 0);
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const bookingRate = totalCalls > 0 ? Math.round((bookingCount / totalCalls) * 100 * 10) / 10 : 0;

  return {
    totalCalls,
    qualifiedLeads,
    bookings: bookingCount,
    bookingRate,
    missedCalls,
    avgDuration,
  };
}

export interface UpdateCallPayload {
  caller_name?: string;
  phone?: string;
  summary?: string;
  outcome?: string;
  transcript?: string;
}

export async function updateCall(callId: string, payload: UpdateCallPayload): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('calls')
    .update(payload)
    .eq('id', callId);
  return { error: error?.message ?? null };
}

export interface UpdateLeadPayload {
  name?: string;
  phone?: string;
  issue?: string;
  address?: string;
}

export async function updateLead(leadId: string, payload: UpdateLeadPayload): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', leadId);
  return { error: error?.message ?? null };
}

export interface UpdateBookingPayload {
  name?: string;
  notes?: string;
  booking_time?: string;
  status?: string;
}

export async function updateBooking(bookingId: string, payload: UpdateBookingPayload): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('bookings')
    .update(payload)
    .eq('id', bookingId);
  return { error: error?.message ?? null };
}

export async function fetchChartData(userIds?: string[] | null): Promise<ChartDataPoint[]> {
  const days: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ date: dateStr, label, calls: 0, bookings: 0 });
  }

  const startDate = days[0].date + 'T00:00:00.000Z';

  let callsQuery = supabase
    .from('calls')
    .select('timestamp')
    .gte('timestamp', startDate);

  let bookingsQuery = supabase
    .from('bookings')
    .select('booking_time')
    .gte('booking_time', startDate);

  if (userIds && userIds.length > 0) {
    callsQuery = callsQuery.in('user_id', userIds);
    bookingsQuery = bookingsQuery.in('user_id', userIds);
  }

  const [callsResult, bookingsResult] = await Promise.all([callsQuery, bookingsQuery]);

  for (const row of callsResult.data ?? []) {
    const dateStr = (row as { timestamp: string }).timestamp.slice(0, 10);
    const point = days.find((d) => d.date === dateStr);
    if (point) point.calls++;
  }

  for (const row of bookingsResult.data ?? []) {
    const dateStr = (row as { booking_time: string }).booking_time.slice(0, 10);
    const point = days.find((d) => d.date === dateStr);
    if (point) point.bookings++;
  }

  return days;
}
