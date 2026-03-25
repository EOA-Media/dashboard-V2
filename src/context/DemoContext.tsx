import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { mockCalls, mockBookings, mockMetrics, mockChartData } from '../data/mockData';
import { fetchCalls, fetchBookings, fetchMetrics, fetchChartData } from '../lib/dataService';
import { supabase } from '../lib/supabase';
import type { Call, Booking, ChartDataPoint } from '../types';
import type { DbCall, DbBooking } from '../lib/db.types';

interface Metrics {
  totalCalls: number;
  qualifiedLeads: number;
  bookings: number;
  bookingRate: number;
  missedCalls: number;
  avgDuration: number;
}

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  calls: Call[];
  bookings: Booking[];
  metrics: Metrics;
  chartData: ChartDataPoint[];
  isLoading: boolean;
}

const emptyMetrics: Metrics = {
  totalCalls: 0,
  qualifiedLeads: 0,
  bookings: 0,
  bookingRate: 0,
  missedCalls: 0,
  avgDuration: 0,
};

const DemoContext = createContext<DemoContextType | null>(null);

function getInitialMode(): boolean {
  try {
    const stored = localStorage.getItem('eoa-demo-mode');
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

interface DemoProviderProps {
  children: ReactNode;
  effectiveUserIds?: string[] | null;
}

export function DemoProvider({ children, effectiveUserIds }: DemoProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(getInitialMode);
  const [liveCalls, setLiveCalls] = useState<Call[]>([]);
  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<Metrics>(emptyMetrics);
  const [liveChartData, setLiveChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const userIdsKey = effectiveUserIds ? effectiveUserIds.join(',') : '__all__';

  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;

    async function loadLiveData() {
      setIsLoading(true);
      try {
        const [calls, bookings, metrics, chartData] = await Promise.all([
          fetchCalls(effectiveUserIds),
          fetchBookings(effectiveUserIds),
          fetchMetrics(effectiveUserIds),
          fetchChartData(effectiveUserIds),
        ]);
        if (!cancelled) {
          setLiveCalls(calls);
          setLiveBookings(bookings);
          setLiveMetrics(metrics);
          setLiveChartData(chartData);
        }
      } catch (err) {
        console.error('Failed to load live data:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadLiveData();

    const channel = supabase
      .channel(`realtime-calls-bookings-${userIdsKey}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls' },
        (payload) => {
          const row = payload.new as DbCall & { user_id?: string };
          if (effectiveUserIds && effectiveUserIds.length > 0 && row.user_id && !effectiveUserIds.includes(row.user_id)) return;
          const outcome = row.outcome ?? '';
          const isBooked = outcome.toLowerCase().includes('book') || outcome.toLowerCase().includes('appoint');
          const newCall: Call = {
            id: row.id,
            caller: { name: row.caller_name ?? 'Unknown', phone: row.phone ?? '' },
            timestamp: row.timestamp,
            duration: row.duration ?? 0,
            status: row.duration === 0 ? 'missed' : 'completed',
            leadStatus: isBooked ? 'qualified' : 'unqualified',
            issue: row.summary ?? 'No summary available',
            outcome: row.outcome ?? 'No outcome recorded',
          };
          setLiveCalls((prev) => {
            if (prev.some((c) => c.id === newCall.id)) return prev;
            return [newCall, ...prev];
          });
          setLiveMetrics((prev) => ({
            ...prev,
            totalCalls: prev.totalCalls + 1,
            missedCalls: newCall.status === 'missed' ? prev.missedCalls + 1 : prev.missedCalls,
            qualifiedLeads: isBooked ? prev.qualifiedLeads + 1 : prev.qualifiedLeads,
            bookingRate: prev.totalCalls + 1 > 0
              ? Math.round((prev.bookings / (prev.totalCalls + 1)) * 100 * 10) / 10
              : 0,
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          const row = payload.new as DbBooking & { user_id?: string };
          if (effectiveUserIds && effectiveUserIds.length > 0 && row.user_id && !effectiveUserIds.includes(row.user_id)) return;
          const status = (row.status ?? 'pending') as Booking['status'];
          const newBooking: Booking = {
            id: row.id,
            callId: '',
            leadId: row.lead_id ?? undefined,
            caller: { name: row.name ?? 'Unknown', phone: row.phone ?? '' },
            service: row.notes ?? 'Appointment',
            scheduledAt: row.booking_time,
            status: ['confirmed', 'pending', 'cancelled', 'completed'].includes(status) ? status : 'pending',
            notes: row.notes ?? undefined,
          };
          setLiveBookings((prev) => {
            if (prev.some((b) => b.id === newBooking.id)) return prev;
            return [newBooking, ...prev];
          });
          setLiveMetrics((prev) => ({
            ...prev,
            bookings: prev.bookings + 1,
            bookingRate: prev.totalCalls > 0
              ? Math.round(((prev.bookings + 1) / prev.totalCalls) * 100 * 10) / 10
              : 0,
          }));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isDemoMode, userIdsKey]);

  function toggleDemoMode() {
    setIsDemoMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eoa-demo-mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        calls: isDemoMode ? mockCalls : liveCalls,
        bookings: isDemoMode ? mockBookings : liveBookings,
        metrics: isDemoMode ? mockMetrics : liveMetrics,
        chartData: isDemoMode ? mockChartData : liveChartData,
        isLoading,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode(): DemoContextType {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoProvider');
  return ctx;
}
