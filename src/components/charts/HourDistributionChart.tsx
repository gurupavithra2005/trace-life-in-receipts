import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HourDistributionChartProps {
  hourlyCounts: number[]; // 24 values
}

export const HourDistributionChart: React.FC<HourDistributionChartProps> = ({ hourlyCounts }) => {
  const maxCount = Math.max(1, ...hourlyCounts);

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono">
            Diurnal Rhythm & Hourly Activity (24h UTC)
          </h4>
          <span className="text-[11px] text-stone-400">
            Shows concentration between nocturnal focus and daytime activity
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-amber-400">
            <Moon className="h-3 w-3" />
            <span>00:00–05:00 Night</span>
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <Sun className="h-3 w-3" />
            <span>Daytime</span>
          </span>
        </div>
      </div>

      {/* Bar Chart Columns */}
      <div className="flex items-end gap-1 sm:gap-1.5 h-36 pt-4 pb-1">
        {hourlyCounts.map((count, hour) => {
          const heightPct = Math.max(8, Math.round((count / maxCount) * 100));
          const isLate = hour >= 0 && hour <= 4;

          return (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end"
            >
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 z-10 rounded bg-stone-950 px-2 py-1 text-[10px] font-mono text-stone-200 border border-stone-800 transition-opacity whitespace-nowrap shadow-lg">
                {hour.toString().padStart(2, '0')}:00 — {count} moments
              </div>

              {/* Bar */}
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isLate
                    ? 'bg-amber-400 group-hover:bg-amber-300'
                    : 'bg-stone-700 group-hover:bg-sky-400'
                }`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Hour Label */}
              <span className="text-[9px] font-mono text-stone-400 group-hover:text-stone-200">
                {hour % 3 === 0 ? `${hour}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
