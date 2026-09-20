import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  CreditCard,
  GitBranch,
  Headphones,
  Layers,
  Radio,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { HourDistributionChart } from '../components/charts/HourDistributionChart';
import { HeroStoryCluster } from '../components/stories/HeroStoryCluster';
import { ConnectedCluster, ReceiptConnection } from '../types/connections';
import { DetectedPattern } from '../types/patterns';
import { Receipt } from '../types/receipt';
import { TabId } from '../components/navigation/NavigationTabs';

interface OverviewProps {
  receipts: Receipt[];
  overviewMetrics: {
    totalReceipts: number;
    activeYears: string;
    yearsList: number[];
    mostActivePeriod: string;
    topActivityType: string;
    topMusicArtist: string;
    topMusicTrack: string;
    topPurchaseCategory: string;
    listeningHours: number;
  };
  hourlyCounts: number[];
  featuredCluster: ConnectedCluster | null;
  connectionsCount: number;
  patternsCount: number;
  chaptersCount: number;
  onSelectReceipt: (receipt: Receipt) => void;
  onNavigate: (tab: TabId) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  receipts,
  overviewMetrics,
  hourlyCounts,
  featuredCluster,
  connectionsCount,
  patternsCount,
  chaptersCount,
  onSelectReceipt,
  onNavigate,
}) => {
  return (
    <div className="space-y-12">
      {/* Editorial Landing Hero */}
      <section className="relative rounded-3xl border border-stone-800/80 bg-stone-950 p-8 sm:p-12 shadow-2xl overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TRACE • CHALLENGE: YOUR LIFE, IN RECEIPTS 🧾</span>
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black text-stone-100 tracking-tight leading-none uppercase">
            YOUR LIFE LEAVES PATTERNS.
          </h1>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl font-serif">
            Every song, purchase, place and tiny moment becomes part of a bigger story.
            TRACE takes raw, disjointed digital footprints and connects them into living chapters.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('chapters')}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <span>EXPLORE THE STORY</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('receipts')}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900 px-5 py-3 text-xs sm:text-sm font-semibold text-stone-200 hover:border-stone-600 hover:bg-stone-850 transition-all focus:outline-none"
            >
              <span>SEE THE DATA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Calculated Overview Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 flex items-center gap-2">
            <Radio className="h-4 w-4" />
            <span>CALCULATED LIFE METRICS (REAL DATA ONLY)</span>
          </h2>
          <span className="text-[11px] font-mono text-stone-400">
            Computed dynamically from loaded receipts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Total Receipts</span>
            <span className="font-mono text-2xl font-bold text-stone-100 mt-1 block">
              {overviewMetrics.totalReceipts.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">Verified Moments</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Active Years</span>
            <span className="font-mono text-lg font-bold text-amber-300 mt-1 block">
              {overviewMetrics.activeYears}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              {overviewMetrics.yearsList.length} distinct years
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Listening Hours</span>
            <span className="font-mono text-2xl font-bold text-sky-400 mt-1 block">
              {overviewMetrics.listeningHours.toLocaleString()}h
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">Spotify streaming time</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Top Music Artist</span>
            <span className="font-mono text-base font-bold text-stone-100 mt-1 block truncate">
              {overviewMetrics.topMusicArtist}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block truncate">
              Top track: {overviewMetrics.topMusicTrack}
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Top Spend Category</span>
            <span className="font-mono text-base font-bold text-emerald-400 mt-1 block truncate">
              {overviewMetrics.topPurchaseCategory}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Household & Card
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Connections Found</span>
            <span className="font-mono text-2xl font-bold text-amber-400 mt-1 block">
              {connectionsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Sliding-window links
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Patterns Detected</span>
            <span className="font-mono text-2xl font-bold text-purple-400 mt-1 block">
              {patternsCount}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Evidence-based
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Life Chapters</span>
            <span className="font-mono text-2xl font-bold text-stone-100 mt-1 block">
              0{chaptersCount}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Temporal epochs
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Top Activity Type</span>
            <span className="font-mono text-lg font-bold text-stone-200 mt-1 block">
              {overviewMetrics.topActivityType}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Primary digital signal
            </span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Peak Period</span>
            <span className="font-mono text-lg font-bold text-stone-200 mt-1 block truncate">
              {overviewMetrics.mostActivePeriod}
            </span>
            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
              Highest density
            </span>
          </div>
        </div>
      </section>

      {/* Featured Hero Story Cluster */}
      {featuredCluster && (
        <section className="space-y-3">
          <HeroStoryCluster
            cluster={featuredCluster}
            allReceipts={receipts}
            onSelectReceipt={onSelectReceipt}
            onExploreConnections={() => onNavigate('connections')}
          />
        </section>
      )}

      {/* Diurnal Hourly Rhythm Chart */}
      <section className="space-y-3">
        <HourDistributionChart hourlyCounts={hourlyCounts} />
      </section>

      {/* Interactive Navigation Launchpads */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigate('life-map')}
          className="group rounded-2xl border border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-amber-500/50 p-6 cursor-pointer transition-all space-y-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
            Life Map Constellation
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Explore your moments as an interconnected galaxy of songs, purchases, and routines.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400">
            <span>Open Life Map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('timeline')}
          className="group rounded-2xl border border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-sky-500/50 p-6 cursor-pointer transition-all space-y-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-base font-bold text-stone-100 group-hover:text-sky-300 transition-colors">
            Chronological Timeline
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Step through Year → Month → Day → Moment across over a decade of authentic digital records.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-400">
            <span>Open Timeline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('chapters')}
          className="group rounded-2xl border border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-emerald-500/50 p-6 cursor-pointer transition-all space-y-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-base font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
            Life Story Chapters
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Read a cinematic digital biography synthesized purely from real verified receipts.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
            <span>Read Chapters</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </section>
    </div>
  );
};
