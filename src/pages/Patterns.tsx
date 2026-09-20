import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { DetectedPattern } from '../types/patterns';
import { Receipt } from '../types/receipt';
import { getReceiptTypeIcon } from '../components/layout/ReceiptDetailModal';

interface PatternsProps {
  patterns: DetectedPattern[];
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const Patterns: React.FC<PatternsProps> = ({
  patterns,
  receipts,
  onSelectReceipt,
}) => {
  const receiptMap = new Map(receipts.map(r => [r.id, r]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Layers className="h-4 w-4" />
          <span>RECURSIVE BEHAVIOR ENGINE</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          DETECTED LIFE PATTERNS
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          Empirical patterns discovered across your listening habits, spending distributions, and diurnal sleep/wake cycles. Every pattern includes clear statistical verification and supporting anchor moments.
        </p>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patterns.map(pattern => {
          const sampleReceipts = (pattern.supportingReceiptIds || [])
            .map((id: string) => receiptMap.get(id))
            .filter((r): r is Receipt => !!r);

          return (
            <div
              key={pattern.id}
              className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 space-y-4 shadow-xl hover:border-stone-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      {pattern.category} • {pattern.tag}
                    </span>
                    <h3 className="font-mono text-base font-bold text-stone-100 mt-0.5">
                      {pattern.title}
                    </h3>
                    {pattern.subtitle && (
                      <p className="text-xs text-stone-400 font-medium mt-0.5">{pattern.subtitle}</p>
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded bg-stone-950 border border-stone-800 text-amber-300 font-mono text-xs font-bold shrink-0">
                    {Math.round(pattern.confidence * 100)}% Match
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {pattern.summary}
                </p>

                {/* Supporting Evidence Metrics */}
                <div className="rounded-xl bg-stone-950 p-3.5 border border-stone-800 text-xs space-y-2">
                  <div className="text-[10px] text-stone-400 uppercase font-mono font-semibold">
                    Empirical Verification ({pattern.timeframe})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {pattern.evidence.map((ev, i) => (
                      <div key={i} className="p-1.5 rounded bg-stone-900/80 border border-stone-800/80">
                        <span className="text-[10px] text-stone-400 block truncate">{ev.label}</span>
                        <span className="font-mono text-xs font-bold text-amber-300 block">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anchor Receipts Preview */}
              {sampleReceipts.length > 0 && (
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">
                    Anchor Moments for this Pattern:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {sampleReceipts.slice(0, 2).map((r: Receipt) => (
                      <div
                        key={r.id}
                        onClick={() => onSelectReceipt(r)}
                        className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 hover:bg-stone-800 border border-stone-800/80 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-amber-400">
                            {getReceiptTypeIcon(r.type, 'h-3.5 w-3.5')}
                          </span>
                          <span className="truncate text-stone-200 font-medium">{r.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 shrink-0 pl-2">
                          {r.timestamp.slice(0, 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
