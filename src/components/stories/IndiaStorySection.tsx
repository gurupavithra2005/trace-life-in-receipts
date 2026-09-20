import React from 'react';
import { AlertTriangle, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { IndiaTransactionSafeStats } from '../../types/transactions';
import { formatCurrency } from '../../utils/numbers';

interface IndiaStorySectionProps {
  stats: IndiaTransactionSafeStats | null;
}

export const IndiaStorySection: React.FC<IndiaStorySectionProps> = ({ stats }) => {
  if (!stats || stats.totalTransactions === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-400 font-semibold block">
            MULTIFACET TRANSACTIONS
          </span>
          <h3 className="font-mono text-lg font-bold text-stone-100">
            Card Commerce & Regional Activity
          </h3>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Total Card Volume
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-100 mt-1 block">
            {formatCurrency(stats.totalVolume, '₹')}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Across {stats.totalTransactions} transactions
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Average Amount
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-amber-300 mt-1 block">
            {formatCurrency(stats.averageAmount, '₹')}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Per swipe/online transaction
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Peak Transaction Hour
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-sky-400 mt-1 block">
            {stats.timeOfTransPeakHour.toString().padStart(2, '0')}:00 UTC
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Diurnal commerce concentration
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Aggregate Unusual Activity
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-300 mt-1 block">
            {stats.aggregateUnusualActivityCount} <span className="text-xs font-normal text-stone-400">({stats.unusualActivityRate}%)</span>
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Zero personal attribution policy
          </span>
        </div>
      </div>

      {/* Regional & Merchant Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Regions */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Regional Aggregation (Safe State View)</span>
          </h4>
          <div className="space-y-2">
            {stats.topRegions.map((r, i) => (
              <div key={i} className="flex justify-between text-xs p-2 rounded bg-stone-950/60 border border-stone-800">
                <span className="text-stone-300 font-medium">{r.state}</span>
                <span className="font-mono text-stone-400">{r.count} transactions</span>
              </div>
            ))}
          </div>
        </div>

        {/* Merchants */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
            <span>Frequent Merchant Categories</span>
          </h4>
          <div className="space-y-2">
            {stats.topCategories.slice(0, 5).map((c, i) => (
              <div key={i} className="flex justify-between text-xs p-2 rounded bg-stone-950/60 border border-stone-800">
                <span className="text-stone-300 font-medium">{c.category}</span>
                <span className="font-mono text-amber-400 font-semibold">{c.count} swipes ({formatCurrency(c.volume, '₹')})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Safety Notice */}
      {stats.aggregateUnusualActivityCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-stone-300">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">Aggregate Pattern Notice:</strong> {stats.aggregateUnusualActivityCount} transactions were marked as unusual in the supplied dataset. In accordance with TRACE privacy mandates, these records are evaluated strictly as an aggregate volume anomaly with zero personal identification or intent inference.
          </p>
        </div>
      )}
    </div>
  );
};
