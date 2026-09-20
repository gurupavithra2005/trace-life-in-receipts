import React from 'react';
import { Compass, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { InsightCard } from '../components/insights/InsightCard';
import { WhatDoesItMean } from '../components/insights/WhatDoesItMean';
import { HouseholdStorySection } from '../components/stories/HouseholdStorySection';
import { IndiaStorySection } from '../components/stories/IndiaStorySection';
import { ListeningStorySection } from '../components/stories/ListeningStorySection';
import { LifeInsight, WhatDoesItMeanNarrative } from '../types/insights';
import { Receipt } from '../types/receipt';
import { SpotifyListeningStats, SpotifyYearData } from '../types/spotify';
import { HouseholdTransactionStats, IndiaTransactionSafeStats } from '../types/transactions';

interface InsightsProps {
  insights: LifeInsight[];
  narrative: WhatDoesItMeanNarrative;
  spotifyStats: SpotifyListeningStats | null;
  spotifyYearsData: Map<number, SpotifyYearData>;
  householdStats: HouseholdTransactionStats | null;
  indiaStats: IndiaTransactionSafeStats | null;
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const Insights: React.FC<InsightsProps> = ({
  insights,
  narrative,
  spotifyStats,
  spotifyYearsData,
  householdStats,
  indiaStats,
  receipts,
  onSelectReceipt,
}) => {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Sparkles className="h-4 w-4" />
          <span>SIGNALS & REFLECTIONS</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          STORIES, STATS & NARRATIVE
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          Deep-dive narrative synthesis combining your extended Spotify audio archive, household commerce ledger, and regional transaction streams.
        </p>
      </div>

      {/* 1. What Does It All Mean Editorial Synthesis */}
      <section>
        <WhatDoesItMean narrative={narrative} />
      </section>

      {/* 2. Spotify Listening Story Section */}
      <section className="rounded-2xl border border-stone-800 bg-stone-950 p-6 sm:p-8 shadow-2xl">
        <ListeningStorySection
          stats={spotifyStats}
          yearsData={spotifyYearsData}
        />
      </section>

      {/* 3. Household Transactions Section ("Where Moments Cost Something") */}
      <section className="rounded-2xl border border-stone-800 bg-stone-950 p-6 sm:p-8 shadow-2xl">
        <HouseholdStorySection stats={householdStats} />
      </section>

      {/* 4. India MultiFacet Transactions Section */}
      {indiaStats && indiaStats.totalTransactions > 0 && (
        <section className="rounded-2xl border border-stone-800 bg-stone-950 p-6 sm:p-8 shadow-2xl">
          <IndiaStorySection stats={indiaStats} />
        </section>
      )}

      {/* 5. Strategic Behavioral Insights */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-100">
              Verified Behavioral Signals
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {insights.length} validated insights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              allReceipts={receipts}
              onSelectReceipt={onSelectReceipt}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
