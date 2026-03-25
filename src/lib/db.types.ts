export interface DbCall {
  id: string;
  phone: string;
  caller_name: string | null;
  lead_id: string | null;
  timestamp: string;
  duration: number | null;
  summary: string | null;
  transcript: string | null;
  outcome: string | null;
}

export interface DbBooking {
  id: string;
  lead_id: string | null;
  name: string | null;
  phone: string | null;
  booking_time: string;
  status: string | null;
  notes: string | null;
}

export interface DbLead {
  id: string;
  name: string | null;
  phone: string | null;
  issue: string | null;
  address: string | null;
}
