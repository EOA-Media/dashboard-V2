import { useState, useEffect } from 'react';
import {
  ArrowLeft, Phone, PhoneMissed, Voicemail, Clock, Calendar,
  ChevronDown, ChevronUp, User, CheckCircle, XCircle, Info, Pencil
} from 'lucide-react';
import { useDemoMode } from '../context/DemoContext';
import { CallStatusBadge, LeadStatusBadge } from '../components/StatusBadge';
import EditCallModal from '../components/EditCallModal';
import EditLeadModal from '../components/EditLeadModal';
import EditBookingModal from '../components/EditBookingModal';
import { fetchCallDetails, type LiveCallDetail, type UpdateCallPayload, type UpdateLeadPayload, type UpdateBookingPayload } from '../lib/dataService';
import type { NavState, Call, Booking } from '../types';

interface CallDetailsProps {
  callId: string;
  onNavigate: (nav: NavState) => void;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatBookingTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function SectionEditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-eoa-text-muted bg-eoa-card border border-eoa-border hover:border-eoa-border-light hover:text-eoa-text-secondary transition-all duration-150 flex-shrink-0"
    >
      <Pencil className="w-3 h-3" strokeWidth={2} />
      Edit
    </button>
  );
}

interface LiveDetail {
  call: LiveCallDetail['call'];
  transcript: string | null;
  lead: LiveCallDetail['lead'];
  booking: LiveCallDetail['booking'];
  leadId: string | null;
}

function LiveCallDetailsView({
  detail,
  callId,
  onNavigate,
}: {
  detail: LiveDetail;
  callId: string;
  onNavigate: (nav: NavState) => void;
}) {
  const [data, setData] = useState(detail);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const [editCallOpen, setEditCallOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [editBookingOpen, setEditBookingOpen] = useState(false);

  const { call, transcript, lead, booking } = data;

  const StatusIcon = call.status === 'missed' ? PhoneMissed : call.status === 'voicemail' ? Voicemail : Phone;
  const statusIconColor = call.status === 'missed' ? 'text-eoa-red' : call.status === 'voicemail' ? 'text-eoa-amber' : 'text-eoa-blue';
  const statusIconBg = call.status === 'missed' ? 'bg-eoa-red/10' : call.status === 'voicemail' ? 'bg-eoa-amber/10' : 'bg-eoa-blue/10';

  type TranscriptMessage = { role: string; text: string; time?: string };

  const parsedTranscript = (() => {
    if (!transcript) return null;
    try {
      const parsed = JSON.parse(transcript);
      if (Array.isArray(parsed)) return parsed as TranscriptMessage[];
    } catch { /* not JSON */ }

    const SPEAKER_RE = /^(AI Agent|Caller)\s*:\s*/i;
    const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
    const messages: TranscriptMessage[] = [];
    let current: TranscriptMessage | null = null;
    for (const line of lines) {
      const match = line.match(SPEAKER_RE);
      if (match) {
        if (current) messages.push(current);
        const role = match[1].toLowerCase() === 'ai agent' ? 'agent' : 'caller';
        current = { role, text: line.slice(match[0].length).trim() };
      } else if (current) {
        current.text = current.text ? `${current.text} ${line}` : line;
      } else {
        messages.push({ role: 'agent', text: line });
      }
    }
    if (current) messages.push(current);
    return messages.length > 0 ? messages : null;
  })();

  const hasTranscriptData = !!transcript && transcript.length > 0;

  function handleCallSaved(updated: UpdateCallPayload) {
    setData((d) => ({
      ...d,
      call: {
        ...d.call,
        caller: {
          name: updated.caller_name ?? d.call.caller.name,
          phone: updated.phone ?? d.call.caller.phone,
        },
        issue: updated.summary ?? d.call.issue,
        outcome: updated.outcome ?? d.call.outcome,
      },
      transcript: updated.transcript !== undefined ? updated.transcript : d.transcript,
    }));
  }

  function handleLeadSaved(updated: UpdateLeadPayload) {
    setData((d) => ({
      ...d,
      lead: d.lead
        ? {
            name: updated.name ?? d.lead.name,
            phone: updated.phone ?? d.lead.phone,
            issue: updated.issue !== undefined ? updated.issue : d.lead.issue,
            address: updated.address !== undefined ? updated.address : d.lead.address,
          }
        : d.lead,
    }));
  }

  function handleBookingSaved(updated: UpdateBookingPayload) {
    setData((d) => ({
      ...d,
      booking: d.booking
        ? {
            ...d.booking,
            service: updated.notes ?? d.booking.service,
            scheduledAt: updated.booking_time ?? d.booking.scheduledAt,
            status: (updated.status as Booking['status']) ?? d.booking.status,
            notes: updated.notes !== undefined ? updated.notes : d.booking.notes,
          }
        : d.booking,
    }));
  }

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => onNavigate({ page: 'calls' })}
        className="flex items-center gap-1.5 text-sm text-eoa-text-secondary hover:text-eoa-text-primary transition-colors mb-5 -ml-1"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Calls
      </button>

      <div className="gradient-border-card rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${statusIconBg} flex items-center justify-center flex-shrink-0`}>
            <StatusIcon className={`w-6 h-6 ${statusIconColor}`} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-eoa-text-primary leading-tight">
                  {call.caller.name === 'Unknown' ? 'Unknown Caller' : call.caller.name}
                </h1>
                <p className="text-sm text-eoa-text-secondary mt-0.5">{call.caller.phone}</p>
              </div>
              <SectionEditButton onClick={() => setEditCallOpen(true)} />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <CallStatusBadge status={call.status} />
              <LeadStatusBadge status={call.leadStatus} />
              {booking && (
                <span className="text-[11px] font-medium text-eoa-purple bg-eoa-purple/10 border border-eoa-purple/15 px-2 py-0.5 rounded-full">
                  Booked
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-eoa-border flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
            {formatDateTime(call.timestamp)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {formatDuration(call.duration)}
          </div>
        </div>
      </div>

      <div className="gradient-border-card rounded-2xl p-5 mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-eoa-text-primary">Summary</h2>
          <SectionEditButton onClick={() => setEditCallOpen(true)} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1">Reason for Call</p>
          <p className="text-sm text-eoa-text-primary">{call.issue}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1">Outcome</p>
          <div className="flex items-start gap-2">
            {booking ? (
              <CheckCircle className="w-4 h-4 text-eoa-purple flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : call.leadStatus === 'qualified' ? (
              <Info className="w-4 h-4 text-eoa-blue flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <XCircle className="w-4 h-4 text-eoa-text-secondary flex-shrink-0 mt-0.5" strokeWidth={2} />
            )}
            <p className="text-sm text-eoa-text-primary">{call.outcome}</p>
          </div>
        </div>
      </div>

      {booking && (
        <div className="gradient-border-card rounded-2xl p-5 mb-4 shadow-glow-brand">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand-soft flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-eoa-purple" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[11px] font-semibold gradient-text uppercase tracking-wider">Appointment Booked</p>
                <SectionEditButton onClick={() => setEditBookingOpen(true)} />
              </div>
              <p className="text-sm font-semibold text-eoa-text-primary">{booking.service}</p>
              <p className="text-sm text-eoa-text-secondary mt-0.5">{formatBookingTime(booking.scheduledAt)}</p>
              {booking.notes && (
                <p className="text-xs text-eoa-text-secondary mt-1.5 italic">{booking.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {lead && (
        <div className="gradient-border-card rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold text-eoa-text-primary">Caller Information</h2>
            <SectionEditButton onClick={() => setEditLeadOpen(true)} />
          </div>
          <div className="space-y-2.5">
            {lead.name && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-eoa-blue mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wide">Name</p>
                  <p className="text-sm text-eoa-text-primary mt-0.5">{lead.name}</p>
                </div>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-eoa-blue mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-eoa-text-primary mt-0.5">{lead.phone}</p>
                </div>
              </div>
            )}
            {lead.issue && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-eoa-blue mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wide">Issue</p>
                  <p className="text-sm text-eoa-text-primary mt-0.5">{lead.issue}</p>
                </div>
              </div>
            )}
            {lead.address && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-eoa-blue mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wide">Address</p>
                  <p className="text-sm text-eoa-text-primary mt-0.5">{lead.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasTranscriptData && (
        <div className="gradient-border-card rounded-2xl overflow-hidden mb-4">
          <button
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-eoa-surface transition-colors"
          >
            <h2 className="text-sm font-semibold text-eoa-text-primary">Call Transcript</h2>
            <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
              {transcriptOpen ? (
                <>Hide <ChevronUp className="w-4 h-4" strokeWidth={2} /></>
              ) : (
                <>Show <ChevronDown className="w-4 h-4" strokeWidth={2} /></>
              )}
            </div>
          </button>

          {transcriptOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-eoa-border pt-4 animate-slide-up">
              {parsedTranscript
                ? parsedTranscript.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role !== 'agent' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'agent' ? 'bg-eoa-blue/10' : 'bg-eoa-text-muted/20'
                      }`}>
                        {msg.role === 'agent'
                          ? <Phone className="w-3.5 h-3.5 text-eoa-blue" strokeWidth={2} />
                          : <User className="w-3.5 h-3.5 text-eoa-text-secondary" strokeWidth={2} />
                        }
                      </div>
                      <div className={`flex-1 ${msg.role !== 'agent' ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          msg.role === 'agent'
                            ? 'bg-eoa-blue/10 text-eoa-text-primary border border-eoa-blue/15'
                            : 'bg-eoa-surface text-eoa-text-primary border border-eoa-border'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-[10px] text-eoa-text-muted mt-1 ${msg.role !== 'agent' ? 'text-right' : ''}`}>
                          {msg.role === 'agent' ? 'AI Agent' : 'Caller'}{msg.time ? ` · ${msg.time}` : ''}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-eoa-blue/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-eoa-blue" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm bg-eoa-blue/10 text-eoa-text-primary border border-eoa-blue/15 whitespace-pre-wrap">
                        {transcript}
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
          )}
        </div>
      )}

      <EditCallModal
        open={editCallOpen}
        onClose={() => setEditCallOpen(false)}
        callId={callId}
        initial={{
          caller_name: call.caller.name === 'Unknown' ? '' : call.caller.name,
          phone: call.caller.phone,
          summary: call.issue,
          outcome: call.outcome,
          transcript: transcript ?? '',
        }}
        onSaved={handleCallSaved}
      />

      {lead && data.leadId && (
        <EditLeadModal
          open={editLeadOpen}
          onClose={() => setEditLeadOpen(false)}
          leadId={data.leadId}
          initial={{
            name: lead.name ?? '',
            phone: lead.phone ?? '',
            issue: lead.issue ?? '',
            address: lead.address ?? '',
          }}
          onSaved={handleLeadSaved}
        />
      )}

      {booking && (
        <EditBookingModal
          open={editBookingOpen}
          onClose={() => setEditBookingOpen(false)}
          bookingId={booking.id}
          initial={{
            name: '',
            notes: booking.notes ?? '',
            booking_time: booking.scheduledAt,
            status: booking.status,
          }}
          onSaved={handleBookingSaved}
        />
      )}
    </div>
  );
}

function DemoCallDetailsView({
  call,
  booking,
  transcript,
  leadInfo,
  onNavigate,
}: {
  call: Call;
  booking: Booking | null;
  transcript?: string | null;
  leadInfo?: Record<string, string> | null;
  onNavigate: (nav: NavState) => void;
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const StatusIcon = call.status === 'missed' ? PhoneMissed : call.status === 'voicemail' ? Voicemail : Phone;
  const statusIconColor = call.status === 'missed' ? 'text-eoa-red' : call.status === 'voicemail' ? 'text-eoa-amber' : 'text-eoa-blue';
  const statusIconBg = call.status === 'missed' ? 'bg-eoa-red/10' : call.status === 'voicemail' ? 'bg-eoa-amber/10' : 'bg-eoa-blue/10';

  type TranscriptMessage = { role: string; text: string; time?: string };

  const parsedTranscript = (() => {
    if (!transcript) return null;
    try {
      const parsed = JSON.parse(transcript);
      if (Array.isArray(parsed)) return parsed as TranscriptMessage[];
    } catch { /* not JSON */ }
    const SPEAKER_RE = /^(AI Agent|Caller)\s*:\s*/i;
    const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
    const messages: TranscriptMessage[] = [];
    let current: TranscriptMessage | null = null;
    for (const line of lines) {
      const match = line.match(SPEAKER_RE);
      if (match) {
        if (current) messages.push(current);
        const role = match[1].toLowerCase() === 'ai agent' ? 'agent' : 'caller';
        current = { role, text: line.slice(match[0].length).trim() };
      } else if (current) {
        current.text = current.text ? `${current.text} ${line}` : line;
      } else {
        messages.push({ role: 'agent', text: line });
      }
    }
    if (current) messages.push(current);
    return messages.length > 0 ? messages : null;
  })();

  const hasTranscript = call.transcript && call.transcript.length > 0;
  const hasLiveTranscript = parsedTranscript && parsedTranscript.length > 0;
  const hasPlainTranscript = transcript && !parsedTranscript;

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => onNavigate({ page: 'calls' })}
        className="flex items-center gap-1.5 text-sm text-eoa-text-secondary hover:text-eoa-text-primary transition-colors mb-5 -ml-1"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Calls
      </button>

      <div className="gradient-border-card rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${statusIconBg} flex items-center justify-center flex-shrink-0`}>
            <StatusIcon className={`w-6 h-6 ${statusIconColor}`} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-eoa-text-primary leading-tight">
              {call.caller.name === 'Unknown' ? 'Unknown Caller' : call.caller.name}
            </h1>
            <p className="text-sm text-eoa-text-secondary mt-0.5">{call.caller.phone}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <CallStatusBadge status={call.status} />
              <LeadStatusBadge status={call.leadStatus} />
              {booking && (
                <span className="text-[11px] font-medium text-eoa-purple bg-eoa-purple/10 border border-eoa-purple/15 px-2 py-0.5 rounded-full">
                  Booked
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-eoa-border flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
            {formatDateTime(call.timestamp)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {formatDuration(call.duration)}
          </div>
        </div>
      </div>

      <div className="gradient-border-card rounded-2xl p-5 mb-4 space-y-3">
        <h2 className="text-sm font-semibold text-eoa-text-primary">Summary</h2>
        <div>
          <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1">Reason for Call</p>
          <p className="text-sm text-eoa-text-primary">{call.issue}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider mb-1">Outcome</p>
          <div className="flex items-start gap-2">
            {booking ? (
              <CheckCircle className="w-4 h-4 text-eoa-purple flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : call.leadStatus === 'qualified' ? (
              <Info className="w-4 h-4 text-eoa-blue flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <XCircle className="w-4 h-4 text-eoa-text-secondary flex-shrink-0 mt-0.5" strokeWidth={2} />
            )}
            <p className="text-sm text-eoa-text-primary">{call.outcome}</p>
          </div>
        </div>
      </div>

      {booking && (
        <div className="gradient-border-card rounded-2xl p-5 mb-4 shadow-glow-brand">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand-soft flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-eoa-purple" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold gradient-text uppercase tracking-wider mb-1">Appointment Booked</p>
              <p className="text-sm font-semibold text-eoa-text-primary">{booking.service}</p>
              <p className="text-sm text-eoa-text-secondary mt-0.5">{formatBookingTime(booking.scheduledAt)}</p>
              {booking.notes && <p className="text-xs text-eoa-text-secondary mt-1.5 italic">{booking.notes}</p>}
            </div>
          </div>
        </div>
      )}

      {leadInfo && Object.keys(leadInfo).length > 0 && (
        <div className="gradient-border-card rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-eoa-text-primary mb-3">Caller Information</h2>
          <div className="space-y-2.5">
            {Object.entries(leadInfo).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-eoa-blue mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wide">{key}</p>
                  <p className="text-sm text-eoa-text-primary mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(hasTranscript || hasLiveTranscript || hasPlainTranscript) && (
        <div className="gradient-border-card rounded-2xl overflow-hidden mb-4">
          <button
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-eoa-surface transition-colors"
          >
            <h2 className="text-sm font-semibold text-eoa-text-primary">Call Transcript</h2>
            <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
              {transcriptOpen
                ? <>Hide <ChevronUp className="w-4 h-4" strokeWidth={2} /></>
                : <>Show <ChevronDown className="w-4 h-4" strokeWidth={2} /></>
              }
            </div>
          </button>
          {transcriptOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-eoa-border pt-4 animate-slide-up">
              {hasTranscript && call.transcript!.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'agent' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'agent' ? 'bg-eoa-blue/10' : 'bg-eoa-text-muted/20'}`}>
                    {msg.role === 'agent'
                      ? <Phone className="w-3.5 h-3.5 text-eoa-blue" strokeWidth={2} />
                      : <User className="w-3.5 h-3.5 text-eoa-text-secondary" strokeWidth={2} />
                    }
                  </div>
                  <div className={`flex-1 ${msg.role === 'caller' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'agent' ? 'bg-eoa-blue/10 text-eoa-text-primary border border-eoa-blue/15' : 'bg-eoa-surface text-eoa-text-primary border border-eoa-border'}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-eoa-text-muted mt-1 ${msg.role === 'caller' ? 'text-right' : ''}`}>
                      {msg.role === 'agent' ? 'AI Agent' : 'Caller'} · {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {!hasTranscript && hasLiveTranscript && parsedTranscript!.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'agent' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'agent' ? 'bg-eoa-blue/10' : 'bg-eoa-text-muted/20'}`}>
                    {msg.role === 'agent'
                      ? <Phone className="w-3.5 h-3.5 text-eoa-blue" strokeWidth={2} />
                      : <User className="w-3.5 h-3.5 text-eoa-text-secondary" strokeWidth={2} />
                    }
                  </div>
                  <div className={`flex-1 ${msg.role !== 'agent' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'agent' ? 'bg-eoa-blue/10 text-eoa-text-primary border border-eoa-blue/15' : 'bg-eoa-surface text-eoa-text-primary border border-eoa-border'}`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-eoa-text-muted mt-1 ${msg.role !== 'agent' ? 'text-right' : ''}`}>
                      {msg.role === 'agent' ? 'AI Agent' : 'Caller'}{msg.time ? ` · ${msg.time}` : ''}
                    </p>
                  </div>
                </div>
              ))}
              {!hasTranscript && !hasLiveTranscript && hasPlainTranscript && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-eoa-blue/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-eoa-blue" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block max-w-[85%] px-3 py-2 rounded-xl text-sm bg-eoa-blue/10 text-eoa-text-primary border border-eoa-blue/15 whitespace-pre-wrap">
                      {transcript}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CallDetails({ callId, onNavigate }: CallDetailsProps) {
  const { isDemoMode, calls, bookings } = useDemoMode();

  const [liveDetail, setLiveDetail] = useState<LiveCallDetail | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveNotFound, setLiveNotFound] = useState(false);

  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;
    setLiveLoading(true);
    setLiveNotFound(false);

    fetchCallDetails(callId).then((detail) => {
      if (cancelled) return;
      if (!detail) setLiveNotFound(true);
      else setLiveDetail(detail);
      setLiveLoading(false);
    });

    return () => { cancelled = true; };
  }, [isDemoMode, callId]);

  if (!isDemoMode) {
    if (liveLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
          <div className="w-8 h-8 rounded-full border-2 border-eoa-blue border-t-transparent animate-spin mb-3" />
          <p className="text-sm text-eoa-text-secondary">Loading call details...</p>
        </div>
      );
    }

    if (liveNotFound || !liveDetail) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
          <XCircle className="w-12 h-12 text-eoa-text-muted mb-3" strokeWidth={1.5} />
          <p className="text-eoa-text-secondary">Call not found.</p>
          <button
            onClick={() => onNavigate({ page: 'calls' })}
            className="mt-4 text-sm text-eoa-blue hover:underline"
          >
            Back to Calls
          </button>
        </div>
      );
    }

    return (
      <LiveCallDetailsView
        detail={{
          call: liveDetail.call,
          transcript: liveDetail.transcript,
          lead: liveDetail.lead,
          booking: liveDetail.booking,
          leadId: liveDetail.leadId,
        }}
        callId={callId}
        onNavigate={onNavigate}
      />
    );
  }

  const call = calls.find((c) => c.id === callId);

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
        <XCircle className="w-12 h-12 text-eoa-text-muted mb-3" strokeWidth={1.5} />
        <p className="text-eoa-text-secondary">Call not found.</p>
        <button
          onClick={() => onNavigate({ page: 'calls' })}
          className="mt-4 text-sm text-eoa-blue hover:underline"
        >
          Back to Calls
        </button>
      </div>
    );
  }

  const booking = call.bookingId ? bookings.find((b) => b.id === call.bookingId) ?? null : null;
  const leadInfo = call.extractedInfo && Object.keys(call.extractedInfo).length > 0
    ? call.extractedInfo
    : null;

  return (
    <DemoCallDetailsView
      call={call}
      booking={booking}
      leadInfo={leadInfo}
      onNavigate={onNavigate}
    />
  );
}
