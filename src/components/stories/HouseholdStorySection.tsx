import React from 'react';
import { Coffee, DollarSign, Repeat, ShoppingCart, TrendingUp, Truck } from 'lucide-react';
import { HouseholdTransactionStats } from '../../types/transactions';
import { formatCurrency } from '../../utils/numbers';

interface HouseholdStorySectionProps {
  stats: HouseholdTransactionStats | null;
}

export const HouseholdStorySection: React.FC<HouseholdStorySectionProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-amber-400 font-semibold block">
            HOUSEHOLD COMMERCE STORY
          </span>
          <h3 className="font-mono text-lg font-bold text-stone-100">
            Where the Moments Cost Something
          </h3>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Total Expenditure
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-amber-300 mt-1 block">
            {formatCurrency(stats.totalExpenseAmount, stats.currency)}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Across {stats.expenseCount} recorded expenses
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase flex items-center gap-1">
            <Coffee className="h-3 w-3 text-amber-400" />
            <span>Food & Sustenance</span>
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-100 mt-1 block">
            {formatCurrency(stats.foodSpending.amount, stats.currency)}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {stats.foodSpending.count} cafe & grocery events
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase flex items-center gap-1">
            <Truck className="h-3 w-3 text-sky-400" />
            <span>Transit & Commute</span>
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-100 mt-1 block">
            {formatCurrency(stats.transportSpending.amount, stats.currency)}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {stats.transportSpending.count} metro & fuel records
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase flex items-center gap-1">
            <Repeat className="h-3 w-3 text-emerald-400" />
            <span>Recurring Categories</span>
          </span>
          <span className="font-mono text-base font-bold text-emerald-400 mt-1 block truncate">
            {stats.recurringCategories.slice(0, 2).join(', ') || 'Groceries'}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {stats.recurringCategories.length} repeated habits
          </span>
        </div>
      </div>

      {/* Top Expense Categories Breakdown */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono flex items-center gap-2">
          <ShoppingCart className="h-3.5 w-3.5 text-amber-400" />
          <span>Expense Distribution by Category</span>
        </h4>

        <div className="space-y-3">
          {stats.topCategories.map((c, i) => {
            const pct = Math.round((c.amount / Math.max(1, stats.totalExpenseAmount)) * 100);
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-200 font-medium">{c.category}</span>
                    <span className="text-[11px] text-stone-400">({c.count} transactions)</span>
                  </div>
                  <span className="font-mono text-amber-300 font-semibold">
                    {formatCurrency(c.amount, stats.currency)} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-950 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
