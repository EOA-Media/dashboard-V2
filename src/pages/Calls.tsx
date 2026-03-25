import { useState, useMemo } from 'react';
import { Phone, PhoneMissed, Voicemail, ChevronRight, Clock, Sparkles, PhoneOff, Search, X, SlidersHorizontal } from 'lucide-react';
import { useDemoMode } from '../context/DemoContext';
import { CallStatusBadge, LeadStatusBadge } from '../components/StatusBadge';
import AdminUserFilter from '../components/AdminUserFilter';
import type { NavState } from '../types';

interface CallsProps {
  onNavigate: (nav: NavState) => void;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function CallIcon({ status }: { status: string }) {
  if (status === 'missed') return <PhoneMissed className="w-4 h-4 text-eoa-red" strokeWidth={2} />;
  if (status === 'voicemail') return <Voicemail className="w-4 h-4 text-eoa-amber" strokeWidth={2} />;
  return <Phone className="w-4 h-4 text-eoa-blue" strokeWidth={2} />;
}

type CallStatusFilter = 'all' | 'completed' | 'missed' | 'voicemail';
type LeadFilter = 'all' | 'qualified' | 'unqualified';

const STATUS_LABELS: Record<CallStatusFilter, string> = {
  all: 'All',
  completed: 'Completed',
  missed: 'Missed',
  voicemail: 'Voicemail',
};

const LEAD_LABELS: Record<LeadFilter, string> = {
  all: 'All Leads',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
};

function EmptyCallsState({ filtered }: { filtered: boolean }) {
  return (
    <div className="gradient-border-card rounded-2xl p-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft mx-auto flex items-center justify-center mb-4">
        <PhoneOff className="w-6 h-6 text-eoa-blue" strokeWidth={1.5} />
      </div>
      {filtered ? (
        <>
          <h3 className="text-base font-semibold text-eoa-text-primary mb-2">No matching calls</h3>
          <p className="text-sm text-eoa-text-secondary max-w-xs mx-auto leading-relaxed">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-eoa-text-primary mb-2">No calls yet</h3>
          <p className="text-sm text-eoa-text-secondary max-w-xs mx-auto leading-relaxed">
            Once your AI receptionist is connected and receiving calls, they'll appear here in real time.
          </p>
        </>
      )}
    </div>
  );
}

export default function Calls({ onNavigate }: CallsProps) {
  const { isDemoMode, calls } = useDemoMode();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CallStatusFilter>('all');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return calls.filter((call) => {
      if (statusFilter !== 'all' && call.status !== statusFilter) return false;
      if (leadFilter !== 'all' && call.leadStatus !== leadFilter) return false;
      if (!q) return true;
      return (
        call.caller.name.toLowerCase().includes(q) ||
        call.caller.phone.toLowerCase().includes(q) ||
        call.issue.toLowerCase().includes(q)
      );
    });
  }, [calls, search, statusFilter, leadFilter]);

  const isFiltered = search.trim() !== '' || statusFilter !== 'all' || leadFilter !== 'all';

  function clearAll() {
    setSearch('');
    setStatusFilter('all');
    setLeadFilter('all');
  }

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-eoa-text-primary tracking-tight">Calls</h1>
          <p className="text-sm text-eoa-text-secondary mt-0.5">
            {calls.length > 0
              ? isFiltered
                ? `${filtered.length} of ${calls.length} calls`
                : `${calls.length} calls · last 30 days`
              : 'No calls yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <AdminUserFilter />
          {isDemoMode && (
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold bg-gradient-brand-soft border border-eoa-purple/25 gradient-text">
              <Sparkles className="w-3 h-3 text-eoa-purple" strokeWidth={2} />
              Demo
            </span>
          )}
        </div>
      </div>

      {calls.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-eoa-text-muted" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or issue…"
              className="w-full bg-eoa-card border border-eoa-border rounded-xl pl-9 pr-8 py-2 text-sm text-eoa-text-primary placeholder:text-eoa-text-muted focus:outline-none focus:border-eoa-blue/50 transition-colors duration-150"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-eoa-text-muted hover:text-eoa-text-secondary transition-colors">
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-eoa-card border border-eoa-border rounded-xl px-2.5 py-1.5">
              <SlidersHorizontal className="w-3 h-3 text-eoa-text-muted flex-shrink-0" strokeWidth={2} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CallStatusFilter)}
                className="bg-transparent text-sm text-eoa-text-primary focus:outline-none cursor-pointer pr-1"
              >
                {(Object.keys(STATUS_LABELS) as CallStatusFilter[]).map((k) => (
                  <option key={k} value={k} className="bg-eoa-card text-eoa-text-primary">{STATUS_LABELS[k]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-eoa-card border border-eoa-border rounded-xl px-2.5 py-1.5">
              <select
                value={leadFilter}
                onChange={(e) => setLeadFilter(e.target.value as LeadFilter)}
                className="bg-transparent text-sm text-eoa-text-primary focus:outline-none cursor-pointer pr-1"
              >
                {(Object.keys(LEAD_LABELS) as LeadFilter[]).map((k) => (
                  <option key={k} value={k} className="bg-eoa-card text-eoa-text-primary">{LEAD_LABELS[k]}</option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm text-eoa-text-secondary bg-eoa-card border border-eoa-border hover:border-eoa-blue/40 hover:text-eoa-blue transition-colors duration-150"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyCallsState filtered={isFiltered} />
      ) : (
        <>
          <div className="hidden md:block gradient-border-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eoa-border">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider">Caller</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider hidden lg:table-cell">Issue</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-semibold text-eoa-text-secondary uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((call, idx) => (
                  <tr
                    key={call.id}
                    onClick={() => onNavigate({ page: 'call-details', callId: call.id })}
                    className={`cursor-pointer hover:bg-eoa-surface transition-colors duration-100 ${idx < filtered.length - 1 ? 'border-b border-eoa-border' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          call.status === 'missed' ? 'bg-eoa-red/10' : call.status === 'voicemail' ? 'bg-eoa-amber/10' : 'bg-eoa-blue/10'
                        }`}>
                          <CallIcon status={call.status} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-eoa-text-primary">
                            {call.caller.name === 'Unknown' ? '—' : call.caller.name}
                          </p>
                          <p className="text-[11px] text-eoa-text-secondary">{call.caller.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-eoa-text-secondary whitespace-nowrap">{formatTime(call.timestamp)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <CallStatusBadge status={call.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <LeadStatusBadge status={call.leadStatus} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-eoa-text-secondary truncate max-w-[200px]">{call.issue}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-sm text-eoa-text-secondary">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {formatDuration(call.duration)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight className="w-4 h-4 text-eoa-text-muted" strokeWidth={2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {filtered.map((call) => (
              <button
                key={call.id}
                onClick={() => onNavigate({ page: 'call-details', callId: call.id })}
                className="w-full gradient-border-card rounded-2xl p-4 text-left transition-all duration-150 active:bg-eoa-surface hover:shadow-glow-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      call.status === 'missed' ? 'bg-eoa-red/10' : call.status === 'voicemail' ? 'bg-eoa-amber/10' : 'bg-eoa-blue/10'
                    }`}>
                      <CallIcon status={call.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-eoa-text-primary truncate">
                        {call.caller.name === 'Unknown' ? call.caller.phone : call.caller.name}
                      </p>
                      <p className="text-xs text-eoa-text-secondary mt-0.5 truncate">{call.issue}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-eoa-text-muted flex-shrink-0 mt-0.5" strokeWidth={2} />
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <CallStatusBadge status={call.status} />
                  <LeadStatusBadge status={call.leadStatus} />
                  {call.bookingId && (
                    <span className="text-[11px] font-medium text-eoa-purple bg-eoa-purple/10 border border-eoa-purple/15 px-2 py-0.5 rounded-full">Booked</span>
                  )}
                  <span className="text-[11px] text-eoa-text-secondary ml-auto">{formatTime(call.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
