import React from 'react';
import {
  Filter,
  Receipt as ReceiptIcon,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { ReceiptList } from '../components/receipts/ReceiptList';
import { FilterState } from '../hooks/useFilters';
import { Receipt, ReceiptType } from '../types/receipt';

interface ReceiptsProps {
  receipts: Receipt[];
  filteredReceipts: Receipt[];
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableYears: number[];
  availableCategories: string[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceiptId?: string;
}

const TYPE_OPTIONS: { label: string; value: ReceiptType | 'ALL' }[] = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Music', value: 'MUSIC' },
  { label: 'Purchases', value: 'PURCHASE' },
  { label: 'Places', value: 'PLACE' },
  { label: 'Events', value: 'EVENT' },
];

export const Receipts: React.FC<ReceiptsProps> = ({
  receipts,
  filteredReceipts,
  filters,
  onUpdateFilters,
  onResetFilters,
  availableYears,
  availableCategories,
  onSelectReceipt,
  selectedReceiptId,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.selectedType !== 'ALL' ||
    filters.selectedCategory !== 'ALL' ||
    filters.selectedYear !== 'ALL' ||
    filters.lateNightOnly;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
          <ReceiptIcon className="h-4 w-4" />
          <span>DATA EXPLORER</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          ALL RECORDED RECEIPTS
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          Search, filter, and inspect normalized receipts spanning music streaming logs, daily household transactions, and safe regional card volumes.
        </p>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-4 shadow-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Search by song, artist, merchant, category, city, or safe description..."
            className="w-full rounded-xl border border-stone-800 bg-stone-950 py-3 pl-10 pr-4 text-sm text-stone-100 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilters({ searchQuery: '' })}
              className="absolute right-3.5 top-3 text-xs font-mono text-stone-400 hover:text-stone-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-800/80">
          {/* Type Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onUpdateFilters({ selectedType: opt.value })}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filters.selectedType === opt.value
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => onUpdateFilters({ lateNightOnly: !filters.lateNightOnly })}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filters.lateNightOnly
                  ? 'bg-purple-500 text-white font-bold'
                  : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              🌙 Late Night (00–04)
            </button>
          </div>

          {/* Year & Category & Sort Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Year */}
            <select
              value={filters.selectedYear}
              onChange={e =>
                onUpdateFilters({
                  selectedYear: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
                })
              }
              className="rounded-lg border border-stone-800 bg-stone-950 px-3 py-1.5 text-xs font-mono text-stone-300 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={filters.selectedCategory}
              onChange={e => onUpdateFilters({ selectedCategory: e.target.value })}
              className="rounded-lg border border-stone-800 bg-stone-950 px-3 py-1.5 text-xs font-mono text-stone-300 focus:border-amber-400 focus:outline-none max-w-[160px] truncate"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={e => onUpdateFilters({ sortBy: e.target.value as any })}
              className="rounded-lg border border-stone-800 bg-stone-950 px-3 py-1.5 text-xs font-mono text-stone-300 focus:border-amber-400 focus:outline-none"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="AMOUNT_DESC">Highest Value</option>
              <option value="DURATION_DESC">Longest Track</option>
            </select>

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 px-2 py-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-1 font-mono">
          <span>
            Matched <strong className="text-stone-100">{filteredReceipts.length.toLocaleString()}</strong> of{' '}
            {receipts.length.toLocaleString()} total receipts
          </span>
          {isFiltered && (
            <span className="text-[11px] text-amber-400/90">
              Active filters applied
            </span>
          )}
        </div>
      </div>

      {/* Receipts Paginated List */}
      <ReceiptList
        receipts={filteredReceipts}
        onSelectReceipt={onSelectReceipt}
        selectedReceiptId={selectedReceiptId}
        pageSize={15}
      />
    </div>
  );
};
