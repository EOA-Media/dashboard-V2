export type CallStatus = 'completed' | 'missed' | 'voicemail';
export type LeadStatus = 'qualified' | 'unqualified' | 'callback';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Caller {
  name: string;
  phone: string;
}

export interface TranscriptMessage {
  role: 'agent' | 'caller';
  text: string;
  time: string;
}

export interface Call {
  id: string;
  caller: Caller;
  timestamp: string;
  duration: number;
  status: CallStatus;
  leadStatus: LeadStatus;
  issue: string;
  outcome: string;
  bookingId?: string;
  transcript?: TranscriptMessage[];
  extractedInfo?: Record<string, string>;
}

export interface Booking {
  id: string;
  callId: string;
  leadId?: string;
  caller: Caller;
  service: string;
  scheduledAt: string;
  status: BookingStatus;
  notes?: string;
  duration?: number;
}

export interface ChartDataPoint {
  date: string;
  label: string;
  calls: number;
  bookings: number;
}

export type Page = 'dashboard' | 'calls' | 'bookings' | 'call-details';

export interface NavState {
  page: Page;
  callId?: string;
}
