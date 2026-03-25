import type { CallStatus, LeadStatus, BookingStatus } from '../types';

interface CallStatusBadgeProps {
  status: CallStatus;
}

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function CallStatusBadge({ status }: CallStatusBadgeProps) {
  const map = {
    completed: { label: 'Completed', class: 'text-eoa-blue bg-eoa-blue/10 border border-eoa-blue/15' },
    missed: { label: 'Missed', class: 'text-eoa-red bg-eoa-red/10' },
    voicemail: { label: 'Voicemail', class: 'text-eoa-amber bg-eoa-amber/10' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.class}`}>
      {s.label}
    </span>
  );
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const map = {
    qualified: { label: 'Qualified', class: 'text-eoa-purple bg-eoa-purple/10 border border-eoa-purple/15' },
    unqualified: { label: 'Unqualified', class: 'text-eoa-text-secondary bg-eoa-text-muted/20' },
    callback: { label: 'Callback', class: 'text-eoa-amber bg-eoa-amber/10' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.class}`}>
      {s.label}
    </span>
  );
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const map = {
    confirmed: { label: 'Confirmed', class: 'text-eoa-green bg-eoa-green/10' },
    pending: { label: 'Pending', class: 'text-eoa-amber bg-eoa-amber/10' },
    cancelled: { label: 'Cancelled', class: 'text-eoa-red bg-eoa-red/10' },
    completed: { label: 'Completed', class: 'text-eoa-text-secondary bg-eoa-text-muted/20' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.class}`}>
      {s.label}
    </span>
  );
}
