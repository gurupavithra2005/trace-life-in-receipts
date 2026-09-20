import React from 'react';
import { ArrowRight, Lightbulb, Radio, Shield, Sparkles } from 'lucide-react';
import { LifeInsight } from '../../types/insights';
import { Receipt } from '../../types/receipt';

interface InsightCardProps {
  insight: LifeInsight;
  allReceipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  allReceipts,
  onSelectReceipt,
}) => {
  const receiptMap = new Map(allReceipts.map(r => [r.id, r]));
  const related = insight.relatedReceiptIds
    .map(id => receiptMap.get(id))
    .filter((r): r is Receipt => !!r);

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-6 space-y-4 hover:border-stone-700 transition-all shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-amber-400 font-semibold block">
              {insight.type} • {insight.category}
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-stone-100 mt-0.5">
              {insight.title}
            </h4>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-stone-400 block uppercase">
            {insight.supportingMetric.label}
          </span>
          <span className="font-mono text-base font-bold text-amber-300 block">
            {insight.supportingMetric.value}
          </span>
          {insight.supportingMetric.sublabel && (
            <span className="text-[10px] text-stone-400 font-mono block">
              {insight.supportingMetric.sublabel}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
        {insight.explanation}
      </p>

      <div className="rounded-lg bg-stone-950/70 p-3 border border-stone-800/80 text-xs text-stone-400 font-mono">
        <strong className="text-stone-300 font-semibold uppercase text-[10px] block mb-0.5">
          Empirical Data Verification:
        </strong>
        <span>{insight.evidence}</span>
      </div>

      {related.length > 0 && (
        <div className="pt-2 border-t border-stone-800/60">
          <span className="text-[10px] font-mono uppercase text-stone-400 block mb-2">
            Anchor Moments:
          </span>
          <div className="flex flex-wrap gap-2">
            {related.slice(0, 3).map(r => (
              <button
                key={r.id}
                onClick={() => onSelectReceipt(r)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 text-[11px] font-medium transition-colors"
              >
                <span className="truncate max-w-[140px]">{r.title}</span>
                <ArrowRight className="h-3 w-3 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
