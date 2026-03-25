import { Phone, PhoneMissed, Voicemail, CalendarCheck } from 'lucide-react';
import type { Call, NavState } from '../types';

interface ActivityFeedProps {
  calls: Call[];
  onNavigate: (nav: NavState) => void;
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function ActivityFeed({ calls, onNavigate }: ActivityFeedProps) {
  return (
    <div className="space-y-1">
      {calls.map((call) => {
        const isMissed = call.status === 'missed';
        const isVoicemail = call.status === 'voicemail';
        const hasBooking = !!call.bookingId;

        let Icon = Phone;
        let iconColor = 'text-eoa-blue';
        let iconBg = 'bg-eoa-blue/10';

        if (isMissed) {
          Icon = PhoneMissed;
          iconColor = 'text-eoa-red';
          iconBg = 'bg-eoa-red/10';
        } else if (isVoicemail) {
          Icon = Voicemail;
          iconColor = 'text-eoa-amber';
          iconBg = 'bg-eoa-amber/10';
        }

        return (
          <button
            key={call.id}
            onClick={() => onNavigate({ page: 'call-details', callId: call.id })}
            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-eoa-card transition-colors duration-150 text-left group"
          >
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-eoa-text-primary truncate">
                    {call.caller.name === 'Unknown' ? call.caller.phone : call.caller.name}
                  </p>
                  <p className="text-xs text-eoa-text-secondary truncate mt-0.5">{call.issue}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-eoa-text-muted">{timeAgo(call.timestamp)}</span>
                  {hasBooking && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-eoa-purple bg-eoa-purple/10 border border-eoa-purple/15 px-1.5 py-0.5 rounded-full">
                      <CalendarCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                      Booked
                    </span>
                  )}
                  {!hasBooking && call.leadStatus === 'qualified' && (
                    <span className="text-[10px] font-medium text-eoa-blue bg-eoa-blue/10 border border-eoa-blue/15 px-1.5 py-0.5 rounded-full">
                      Lead
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
