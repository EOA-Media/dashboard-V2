import type { ChartDataPoint } from '../types';

interface CallsChartProps {
  data: ChartDataPoint[];
}

export default function CallsChart({ data }: CallsChartProps) {
  const maxCalls = Math.max(...data.map((d) => d.calls), 1);
  const chartHeight = 100;
  const barWidth = 28;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const padding = { left: 32, right: 16, top: 12, bottom: 32 };

  const svgWidth = totalWidth + padding.left + padding.right;
  const svgHeight = chartHeight + padding.top + padding.bottom;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ minWidth: `${Math.max(svgWidth, 280)}px`, height: '160px' }}
      >
        <defs>
          <linearGradient id="barGradientCalls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="barGradientBookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          const val = Math.round(maxCalls * ratio);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                x2={padding.left + totalWidth}
                y1={y}
                y2={y}
                stroke="#1C2845"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 4}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#5E7098"
              >
                {val}
              </text>
            </g>
          );
        })}

        {data.map((point, idx) => {
          const x = padding.left + idx * (barWidth + gap);
          const callBarH = (point.calls / maxCalls) * chartHeight;
          const bookBarH = (point.bookings / maxCalls) * chartHeight;
          const callY = padding.top + chartHeight - callBarH;
          const bookY = padding.top + chartHeight - bookBarH;
          const midX = x + barWidth / 2;

          return (
            <g key={point.date}>
              <rect
                x={x}
                y={callY}
                width={barWidth}
                height={callBarH}
                rx="4"
                ry="4"
                fill="url(#barGradientCalls)"
              />
              <rect
                x={x + 5}
                y={bookY}
                width={barWidth - 10}
                height={bookBarH}
                rx="3"
                ry="3"
                fill="url(#barGradientBookings)"
              />
              <text
                x={midX}
                y={padding.top + chartHeight + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#5E7098"
              >
                {point.label.replace('Mar ', '')}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-5 mt-1 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-eoa-blue-dim opacity-50" />
          <span className="text-[11px] text-eoa-text-secondary">Calls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-eoa-purple-dim opacity-90" />
          <span className="text-[11px] text-eoa-text-secondary">Bookings</span>
        </div>
      </div>
    </div>
  );
}
