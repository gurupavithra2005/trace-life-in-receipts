import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Receipt } from '../../types/receipt';
import { formatSafeTimestamp, formatTimeOnly, safeParseDate } from '../../utils/dates';
import { formatCurrency, formatMsToHoursAndMinutes } from '../../utils/numbers';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface TimelineViewProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceiptId?: string;
}

interface MonthGroup {
  monthKey: string; // YYYY-MM
  monthName: string;
  year: number;
  receipts: Receipt[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  receipts,
  onSelectReceipt,
  selectedReceiptId,
}) => {
  // Sort chronologically
  const sorted = useMemo(() => {
    return [...receipts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [receipts]);

  // Group by Year and Month
  const { years, monthGroupsByYear } = useMemo(() => {
    const yearSet = new Set<number>();
    const monthMap = new Map<string, Receipt[]>();

    for (const r of sorted) {
      const d = safeParseDate(r.timestamp);
      if (!d) continue;
      const yr = d.getUTCFullYear();
      yearSet.add(yr);

      const mKey = r.timestamp.slice(0, 7); // YYYY-MM
      if (!monthMap.has(mKey)) monthMap.set(mKey, []);
      monthMap.get(mKey)!.push(r);
    }

    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
    const byYear = new Map<number, MonthGroup[]>();

    for (const yr of sortedYears) {
      const yearMonths: MonthGroup[] = [];
      for (let m = 1; m <= 12; m++) {
        const mKey = `${yr}-${m.toString().padStart(2, '0')}`;
        if (monthMap.has(mKey)) {
          const d = new Date(Date.UTC(yr, m - 1, 1));
          const monthName = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
          yearMonths.push({
            monthKey: mKey,
            monthName,
            year: yr,
            receipts: monthMap.get(mKey)!,
          });
        }
      }
      byYear.set(yr, yearMonths);
    }

    return { years: sortedYears, monthGroupsByYear: byYear };
  }, [sorted]);

  const [activeYear, setActiveYear] = useState<number | 'ALL'>('ALL');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (mKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(mKey)) {
        next.delete(mKey);
      } else {
        next.add(mKey);
      }
      return next;
    });
  };

  const visibleYears = activeYear === 'ALL' ? years : years.filter(y => y === activeYear);

  return (
    <div className="space-y-6">
      {/* Year Jump Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-800 pb-4">
        <span className="text-xs font-mono text-stone-400 mr-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-amber-400" />
          <span>JUMP TO YEAR:</span>
        </span>
        <button
          onClick={() => setActiveYear('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
            activeYear === 'ALL'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
              : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700'
          }`}
        >
          All Years ({sorted.length})
        </button>
        {years.map(yr => {
          const count = sorted.filter(
            r => safeParseDate(r.timestamp)?.getUTCFullYear() === yr
          ).length;
          return (
            <button
              key={yr}
              onClick={() => setActiveYear(yr)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                activeYear === yr
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {yr} <span className="text-[10px] text-stone-400">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Year & Month Timeline Structure */}
      <div className="space-y-8">
        {visibleYears.map(yr => {
          const months = monthGroupsByYear.get(yr) || [];
          const totalYearMoments = months.reduce((s, m) => s + m.receipts.length, 0);

          return (
            <div key={yr} className="relative pl-6 border-l-2 border-stone-800 space-y-4">
              {/* Year Marker Badge */}
              <div className="absolute -left-3.5 top-0 flex items-center justify-center h-7 w-7 rounded-full bg-stone-950 border-2 border-amber-400 text-amber-400 font-mono text-xs font-bold shadow-md">
                •
              </div>

              <div className="flex items-baseline justify-between pt-0.5 mb-2">
                <h3 className="font-mono text-lg font-bold text-stone-100 tracking-wider">
                  YEAR {yr}
                </h3>
                <span className="text-xs font-mono text-stone-400">
                  {totalYearMoments} recorded moments
                </span>
              </div>

              {/* Month Blocks */}
              <div className="space-y-3">
                {months.map(m => {
                  const isExpanded = expandedMonths.has(m.monthKey) || months.length <= 2;

                  return (
                    <div
                      key={m.monthKey}
                      className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-sm"
                    >
                      {/* Month Header toggle */}
                      <button
                        type="button"
                        onClick={() => toggleMonth(m.monthKey)}
                        className="w-full flex items-center justify-between p-3.5 text-left bg-stone-900/90 hover:bg-stone-850 transition-colors focus:outline-none"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-amber-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-stone-500" />
                          )}
                          <span className="text-xs sm:text-sm font-semibold text-stone-200">
                            {m.monthName} {m.year}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-stone-400 px-2 py-0.5 rounded bg-stone-950 border border-stone-800">
                          {m.receipts.length} moments
                        </span>
                      </button>

                      {/* Moments list inside month */}
                      {isExpanded && (
                        <div className="p-3.5 pt-1 divide-y divide-stone-800/80 space-y-1">
                          {m.receipts.map(r => {
                            const isSelected = r.id === selectedReceiptId;
                            const msPlayed = typeof r.metadata?.ms_played === 'number' ? r.metadata.ms_played : null;
                            const dur = msPlayed ? formatMsToHoursAndMinutes(msPlayed) : null;

                            return (
                              <div
                                key={r.id}
                                onClick={() => onSelectReceipt(r)}
                                className={`pt-2.5 pb-2.5 px-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-stone-800 border-l-4 border-amber-400'
                                    : 'hover:bg-stone-800/60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-950 text-amber-400 border border-stone-800">
                                    {getReceiptTypeIcon(r.type, 'h-3.5 w-3.5')}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-semibold text-stone-100 line-clamp-1">
                                        {r.title}
                                      </h5>
                                      <span className="text-[10px] font-mono text-stone-400">
                                        {formatTimeOnly(r.timestamp)} UTC
                                      </span>
                                    </div>
                                    {r.subtitle && (
                                      <p className="text-[11px] text-stone-400 line-clamp-1 font-mono">
                                        {r.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right pl-3 shrink-0">
                                  {r.amount !== undefined ? (
                                    <span className="font-mono text-xs font-bold text-amber-300">
                                      {formatCurrency(r.amount, r.currency || '₹')}
                                    </span>
                                  ) : dur ? (
                                    <span className="font-mono text-xs text-sky-400">
                                      {dur.display}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-stone-400">
                                      {r.type}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
