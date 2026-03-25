import { Phone, UserCheck, CalendarCheck, TrendingUp, ArrowRight, Sparkles, Wifi } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import FunnelViz from '../components/FunnelViz';
import CallsChart from '../components/CallsChart';
import ActivityFeed from '../components/ActivityFeed';
import AdminUserFilter from '../components/AdminUserFilter';
import { useDemoMode } from '../context/DemoContext';
import type { NavState } from '../types';

interface DashboardProps {
  onNavigate: (nav: NavState) => void;
}

function NoDataState() {
  return (
    <div className="gradient-border-card rounded-2xl p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-brand-soft mx-auto flex items-center justify-center mb-4">
        <Wifi className="w-6 h-6 text-eoa-blue" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-eoa-text-primary mb-2">No live data yet</h3>
      <p className="text-sm text-eoa-text-secondary max-w-xs mx-auto leading-relaxed">
        Connect your Retell AI and Cal.com integrations to start seeing real call and booking data here.
      </p>
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { isDemoMode, metrics, calls, chartData, isLoading } = useDemoMode();
  const recentCalls = calls.slice(0, 6);
  const hasData = metrics.totalCalls > 0 || metrics.bookings > 0 || calls.length > 0;

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-eoa-text-primary tracking-tight">Overview</h1>
          <p className="text-sm text-eoa-text-secondary mt-0.5">
            {isDemoMode ? 'Demo data · Last 30 days' : 'Live · Last 30 days'}
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Calls Handled"
          value={metrics.totalCalls || '—'}
          sub="Total inbound calls"
          icon={Phone}
          accent="blue"
          trend={isDemoMode ? { value: '+12%', positive: true } : undefined}
        />
        <MetricCard
          label="Leads Captured"
          value={metrics.qualifiedLeads || '—'}
          sub={metrics.totalCalls ? `${Math.round((metrics.qualifiedLeads / metrics.totalCalls) * 100)}% of calls` : 'No calls yet'}
          icon={UserCheck}
          accent="blue"
          trend={isDemoMode ? { value: '+8%', positive: true } : undefined}
        />
        <MetricCard
          label="Bookings"
          value={metrics.bookings || '—'}
          sub="Appointments booked"
          icon={CalendarCheck}
          accent="purple"
          trend={isDemoMode ? { value: '+19%', positive: true } : undefined}
        />
        <MetricCard
          label="Booking Rate"
          value={metrics.bookingRate ? `${metrics.bookingRate}%` : '—'}
          sub="Calls → bookings"
          icon={TrendingUp}
          accent="purple"
          trend={isDemoMode ? { value: '+3.2%', positive: true } : undefined}
        />
      </div>

      {!isDemoMode && !isLoading && !hasData ? (
        <NoDataState />
      ) : (isDemoMode || hasData) ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="gradient-border-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-eoa-text-primary mb-4">Call Funnel</h2>
              <FunnelViz
                calls={metrics.totalCalls}
                leads={metrics.qualifiedLeads}
                bookings={metrics.bookings}
              />
            </div>

            <div className="gradient-border-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-eoa-text-primary mb-4">Last 7 Days</h2>
              <CallsChart data={chartData} />
            </div>
          </div>

          <div className="gradient-border-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-eoa-border">
              <h2 className="text-sm font-semibold text-eoa-text-primary">Recent Activity</h2>
              <button
                onClick={() => onNavigate({ page: 'calls' })}
                className="flex items-center gap-1 text-xs text-eoa-blue hover:text-eoa-blue-dim transition-colors"
              >
                View all
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-2">
              {recentCalls.length > 0 ? (
                <ActivityFeed calls={recentCalls} onNavigate={onNavigate} />
              ) : (
                <p className="text-sm text-eoa-text-secondary text-center py-6">No recent activity</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
