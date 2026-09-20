import React from 'react';
import { ArrowRight, BookOpen, Calendar, Clock, GitBranch, Layers, Sparkles } from 'lucide-react';
import { LifeChapter } from '../../types/chapters';
import { Receipt } from '../../types/receipt';
import { formatTimeOnly } from '../../utils/dates';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface ChapterCardProps {
  chapter: LifeChapter;
  allReceipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  allReceipts,
  onSelectReceipt,
}) => {
  const receiptMap = new Map(allReceipts.map(r => [r.id, r]));
  const keyMoments = chapter.keyMomentReceiptIds
    .map(id => receiptMap.get(id))
    .filter((r): r is Receipt => !!r);

  return (
    <div className="relative rounded-2xl border border-stone-800 bg-stone-900/80 p-6 sm:p-8 shadow-xl space-y-6 hover:border-stone-700 transition-all">
      {/* Chapter Number & Time Range Header */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-stone-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400/90">
            {chapter.orderNumber}
          </span>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block font-semibold">
              CHAPTER
            </span>
            <h3 className="font-mono text-lg sm:text-xl font-bold text-stone-100">
              {chapter.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-stone-950 px-3 py-1.5 rounded-md border border-stone-800">
          <Calendar className="h-3.5 w-3.5 text-amber-400" />
          <span>{chapter.timeRange}</span>
        </div>
      </div>

      {/* Chapter Narrative Summary */}
      <div className="space-y-2">
        <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-serif italic">
          "{chapter.summary}"
        </p>
        <p className="text-xs text-stone-400 font-mono">
          <strong className="text-stone-300 font-semibold">Empirical Evidence:</strong> {chapter.evidence}
        </p>
      </div>

      {/* Supporting Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {chapter.supportingMetrics.map((m, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 text-xs">
            <span className="text-stone-400 text-[10px] font-mono uppercase block">{m.label}</span>
            <span className="font-mono text-stone-200 font-semibold text-sm mt-0.5 block truncate">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Key Moments Gallery */}
      {keyMoments.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-amber-400/90 font-semibold">
              <Clock className="h-3 w-3" />
              <span>Defining Anchor Moments</span>
            </span>
            <span className="text-[10px]">{chapter.connectedMomentsCount} connections identified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyMoments.map(r => (
              <div
                key={r.id}
                onClick={() => onSelectReceipt(r)}
                className="group flex items-center justify-between p-3 rounded-lg bg-stone-950/50 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/40 cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-amber-400 shrink-0">
                    {getReceiptTypeIcon(r.type, 'h-4 w-4')}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {r.subtitle || r.timestamp.slice(0, 10)}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-stone-400 shrink-0 pl-2">
                  {formatTimeOnly(r.timestamp)} UTC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Patterns In Chapter */}
      {chapter.patterns.length > 0 && (
        <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-mono text-[10px] uppercase flex items-center gap-1">
            <Layers className="h-3 w-3 text-amber-400" />
            <span>Associated Patterns:</span>
          </span>
          {chapter.patterns.map((p, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-stone-950 text-amber-300 border border-stone-800 text-[11px] font-mono"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
