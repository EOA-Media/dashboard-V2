import { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronRight, User, Sparkles, CalendarX, Search, X, SlidersHorizontal } from 'lucide-react';
import { useDemoMode } from '../context/DemoContext';
import { BookingStatusBadge } from '../components/StatusBadge';
import AdminUserFilter from '../components/AdminUserFilter';
import { fetchCallIdByLeadId } from '../lib/dataService';
import type { Booking, NavState } from '../types';

interface BookingsProps {
  onNavigate: (nav: NavState) => void;
}

function formatDate(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function groupBookingsByDate(bookings: Booking[]) {
  const groups: Record<string, Booking[]> = {};
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );
  for (const booking of sorted) {
    const dateKey = formatDate(booking.scheduledAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(booking);
  }
  return groups;
}

type BookingStatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed';

const STATUS_LABELS: Record<BookingStatusFilter, string> = {
  all: 'All Statuses',
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function EmptyBookingsState({ filtered }: { filtered: boolean }) {
  return (
    <div className="gradient-border-card rounded-2xl p-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft mx-auto flex items-center justify-center mb-4">
        <CalendarX className="w-6 h-6 text-eoa-blue" strokeWidth={1.5} />
      </div>
      {filtered ? (
        <>
          <h3 className="text-base font-semibold text-eoa-text-primary mb-2">No matching bookings</h3>
          <p className="text-sm text-eoa-text-secondary max-w-xs mx-auto leading-relaxed">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-eoa-text-primary mb-2">No bookings yet</h3>
          <p className="text-sm text-eoa-text-secondary max-w-xs mx-auto leading-relaxed">
            Appointments booked through your AI receptionist will show up here automatically.
          </p>
        </>
      )}
    </div>
  );
}

export default function Bookings({ onNavigate }: BookingsProps) {
  const { isDemoMode, bookings } = useDemoMode();
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      if (!q) return true;
      return (
        booking.caller.name.toLowerCase().includes(q) ||
        booking.caller.phone.toLowerCase().includes(q) ||
        booking.service.toLowerCase().includes(q) ||
        (booking.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  const isFiltered = search.trim() !== '' || statusFilter !== 'all';

  function clearAll() {
    setSearch('');
    setStatusFilter('all');
  }

  const grouped = groupBookingsByDate(filtered);

  async function handleBookingClick(booking: Booking) {
    if (isDemoMode) {
      if (booking.callId) onNavigate({ page: 'call-details', callId: booking.callId });
      return;
    }
    if (!booking.leadId) return;
    setLoadingBookingId(booking.id);
    try {
      const callId = await fetchCallIdByLeadId(booking.leadId);
      if (callId) {
        onNavigate({ page: 'call-details', callId });
      } else {
        console.warn('[Bookings] No call found for lead_id:', booking.leadId);
      }
    } finally {
      setLoadingBookingId(null);
    }
  }

  function isClickable(booking: Booking): boolean {
    if (isDemoMode) return !!booking.callId;
    return !!booking.leadId;
  }

  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-eoa-text-primary tracking-tight">Bookings</h1>
          <p className="text-sm text-eoa-text-secondary mt-0.5">
            {bookings.length > 0
              ? isFiltered
                ? `${filtered.length} of ${bookings.length} bookings`
                : `${bookings.length} total · ${confirmed} confirmed · ${pending} pending`
              : 'No bookings yet'}
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

      {bookings.length > 0 && (
        <>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 gradient-border-card rounded-2xl px-4 py-3">
              <div className="text-2xl font-bold gradient-text">{confirmed}</div>
              <div className="text-xs text-eoa-text-secondary mt-0.5">Confirmed</div>
            </div>
            <div className="flex-1 bg-eoa-card border border-eoa-amber/20 rounded-2xl px-4 py-3">
              <div className="text-2xl font-bold text-eoa-amber">{pending}</div>
              <div className="text-xs text-eoa-text-secondary mt-0.5">Pending</div>
            </div>
            <div className="flex-1 bg-eoa-card border border-eoa-border rounded-2xl px-4 py-3">
              <div className="text-2xl font-bold text-eoa-text-secondary">{completed}</div>
              <div className="text-xs text-eoa-text-secondary mt-0.5">Completed</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-eoa-text-muted" strokeWidth={2} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or service…"
                className="w-full bg-eoa-card border border-eoa-border rounded-xl pl-9 pr-8 py-2 text-sm text-eoa-text-primary placeholder:text-eoa-text-muted focus:outline-none focus:border-eoa-blue/50 transition-colors duration-150"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-eoa-text-muted hover:text-eoa-text-secondary transition-colors">
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-eoa-card border border-eoa-border rounded-xl px-2.5 py-1.5">
                <SlidersHorizontal className="w-3 h-3 text-eoa-text-muted flex-shrink-0" strokeWidth={2} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BookingStatusFilter)}
                  className="bg-transparent text-sm text-eoa-text-primary focus:outline-none cursor-pointer pr-1"
                >
                  {(Object.keys(STATUS_LABELS) as BookingStatusFilter[]).map((k) => (
                    <option key={k} value={k} className="bg-eoa-card text-eoa-text-primary">{STATUS_LABELS[k]}</option>
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
        </>
      )}

      {filtered.length === 0 ? (
        <EmptyBookingsState filtered={isFiltered} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateBookings]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2.5">
                <Calendar className="w-3.5 h-3.5 text-eoa-text-secondary" strokeWidth={2} />
                <span className="text-xs font-semibold text-eoa-text-secondary uppercase tracking-wider">{date}</span>
                <div className="flex-1 h-px bg-eoa-border" />
              </div>

              <div className="space-y-2">
                {dateBookings.map((booking) => {
                  const clickable = isClickable(booking);
                  const isLoading = loadingBookingId === booking.id;
                  return (
                    <button
                      key={booking.id}
                      onClick={() => clickable ? handleBookingClick(booking) : undefined}
                      disabled={isLoading}
                      className={`w-full gradient-border-card rounded-xl p-4 text-left transition-all duration-150 ${clickable ? 'hover:shadow-glow-brand cursor-pointer' : 'cursor-default'} ${isLoading ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-eoa-text-primary">{booking.service}</p>
                            <BookingStatusBadge status={booking.status} />
                          </div>

                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
                              <User className="w-3 h-3" strokeWidth={2} />
                              {booking.caller.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-eoa-text-secondary">
                              <Clock className="w-3 h-3" strokeWidth={2} />
                              {formatTime(booking.scheduledAt)}
                              {booking.duration && ` · ${booking.duration} min`}
                            </div>
                          </div>

                          {booking.notes && (
                            <p className="text-xs text-eoa-text-secondary mt-1.5 truncate">{booking.notes}</p>
                          )}
                        </div>
                        {clickable && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-opacity ${isLoading ? 'opacity-40' : 'text-eoa-text-muted'}`} strokeWidth={2} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
