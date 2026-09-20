import React from 'react';
import { Clock, MapPin, Tag } from 'lucide-react';
import { Receipt } from '../../types/receipt';
import { formatSafeTimestamp, getTimeOfDayBucket } from '../../utils/dates';
import { formatCurrency, formatMsToHoursAndMinutes } from '../../utils/numbers';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface ReceiptCardProps {
  receipt: Receipt;
  onSelect: (receipt: Receipt) => void;
  isSelected?: boolean;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onSelect,
  isSelected = false,
}) => {
  const msPlayed = typeof receipt.metadata?.ms_played === 'number' ? receipt.metadata.ms_played : null;
  const timeDuration = msPlayed ? formatMsToHoursAndMinutes(msPlayed) : null;
  const hour = new Date(receipt.timestamp).getUTCHours();
  const timeOfDay = getTimeOfDayBucket(hour);

  return (
    <div
      onClick={() => onSelect(receipt)}
      className={`group relative rounded-xl border transition-all cursor-pointer p-4 bg-stone-900/70 hover:bg-stone-900 shadow-sm ${
        isSelected
          ? 'border-amber-400 ring-1 ring-amber-400/40 bg-stone-900'
          : 'border-stone-800/80 hover:border-stone-700'
      }`}
    >
      {/* Top Meta Line */}
      <div className="flex items-center justify-between gap-2 text-[11px] mb-2.5">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300 group-hover:border-amber-500/40 transition-colors">
            <span className="text-amber-400">{getReceiptTypeIcon(receipt.type, 'h-3 w-3')}</span>
            <span className="uppercase text-[10px] tracking-wider font-semibold">{receipt.type}</span>
          </span>
          <span className="text-stone-400 hidden xs:inline">•</span>
          <span className="text-stone-400 text-[10px] hidden xs:inline">{timeOfDay}</span>
        </div>

        <div className="flex items-center gap-1 text-stone-400 font-mono text-[11px]">
          <Clock className="h-3 w-3 text-stone-400" />
          <span>{formatSafeTimestamp(receipt.timestamp)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-1 mb-3">
        <h4 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
          {receipt.title}
        </h4>
        {receipt.subtitle && (
          <p className="text-xs text-stone-400 line-clamp-1 font-medium">
            {receipt.subtitle}
          </p>
        )}
      </div>

      {/* Amount or Listening Time Badge */}
      {(receipt.amount !== undefined || timeDuration) && (
        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 mt-2">
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            {receipt.location?.safeArea ? (
              <>
                <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="truncate max-w-[140px]">{receipt.location.safeArea}</span>
              </>
            ) : (
              <span className="text-[10px] font-mono text-stone-400">{receipt.source}</span>
            )}
          </div>

          <div className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {receipt.amount !== undefined
              ? formatCurrency(receipt.amount, receipt.currency || '₹')
              : timeDuration?.display}
          </div>
        </div>
      )}

      {/* Tags line */}
      {receipt.tags && receipt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-stone-800/50">
          {receipt.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.2 rounded bg-stone-950 text-stone-400 font-mono border border-stone-800/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
