import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: 'blue' | 'purple' | 'amber' | 'red';
  trend?: { value: string; positive: boolean };
}

const accentMap = {
  blue: {
    iconBg: 'bg-gradient-brand-soft',
    icon: 'text-eoa-blue',
  },
  purple: {
    iconBg: 'bg-gradient-brand-soft',
    icon: 'text-eoa-purple',
  },
  amber: {
    iconBg: 'bg-eoa-amber/10',
    icon: 'text-eoa-amber',
  },
  red: {
    iconBg: 'bg-eoa-red/10',
    icon: 'text-eoa-red',
  },
};

export default function MetricCard({ label, value, sub, icon: Icon, accent = 'blue', trend }: MetricCardProps) {
  const colors = accentMap[accent];

  return (
    <div className="gradient-border-card rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-glow-brand">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend.positive
              ? 'text-eoa-blue bg-eoa-blue/10 border border-eoa-blue/15'
              : 'text-eoa-red bg-eoa-red/10'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      <div>
        <div className="text-3xl font-bold tracking-tight gradient-text">{value}</div>
        <div className="text-sm font-medium text-eoa-text-primary mt-0.5">{label}</div>
        {sub && <div className="text-xs text-eoa-text-secondary mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
