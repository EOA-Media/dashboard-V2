import { Phone, UserCheck, CalendarCheck } from 'lucide-react';

interface FunnelVizProps {
  calls: number;
  leads: number;
  bookings: number;
}

interface FunnelStep {
  label: string;
  count: number;
  sub: string;
  icon: typeof Phone;
  color: string;
  bg: string;
  border: string;
  width: string;
}

export default function FunnelViz({ calls, leads, bookings }: FunnelVizProps) {
  const leadsRate = calls > 0 ? Math.round((leads / calls) * 100) : 0;
  const bookingsRate = calls > 0 ? Math.round((bookings / calls) * 100) : 0;

  const steps: FunnelStep[] = [
    {
      label: 'Calls Handled',
      count: calls,
      sub: '100%',
      icon: Phone,
      color: 'text-eoa-blue',
      bg: 'bg-eoa-blue/10',
      border: 'border-eoa-blue/25',
      width: 'w-full',
    },
    {
      label: 'Leads Qualified',
      count: leads,
      sub: `${leadsRate}% of calls`,
      icon: UserCheck,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      border: 'border-violet-400/25',
      width: 'w-5/6',
    },
    {
      label: 'Bookings Made',
      count: bookings,
      sub: `${bookingsRate}% of calls`,
      icon: CalendarCheck,
      color: 'text-eoa-purple',
      bg: 'bg-eoa-purple/10',
      border: 'border-eoa-purple/25',
      width: 'w-3/4',
    },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="relative">
            <div className={`mx-auto transition-all duration-300 ${step.width}`}>
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${step.border} ${step.bg}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${step.color} flex-shrink-0`} strokeWidth={2} />
                  <span className="text-sm font-medium text-eoa-text-primary">{step.label}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${step.color}`}>{step.count.toLocaleString()}</div>
                  <div className="text-[10px] text-eoa-text-secondary">{step.sub}</div>
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex justify-center my-0.5">
                <div className="w-px h-3 bg-gradient-to-b from-eoa-blue/30 to-eoa-purple/30" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
