import React, { useState } from 'react';
import { Calendar, Disc, Headphones, Laptop, Music, Radio, Shuffle, SkipForward } from 'lucide-react';
import { SpotifyListeningStats, SpotifyYearData } from '../../types/spotify';

interface ListeningStorySectionProps {
  stats: SpotifyListeningStats | null;
  yearsData: Map<number, SpotifyYearData>;
}

export const ListeningStorySection: React.FC<ListeningStorySectionProps> = ({
  stats,
  yearsData,
}) => {
  if (!stats) return null;

  const years = stats.yearsDetected;
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');

  const activeYearData = selectedYear !== 'ALL' ? yearsData.get(selectedYear) : null;

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-sky-400 font-semibold block">
              SPOTIFY LISTENING STORY
            </span>
            <h3 className="font-mono text-lg font-bold text-stone-100">
              Soundtrack of Over a Decade (2013 – 2024)
            </h3>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setSelectedYear('ALL')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedYear === 'ALL'
                ? 'bg-sky-400 text-stone-950 font-bold'
                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            All-Time
          </button>
          {years.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedYear === yr
                  ? 'bg-sky-400 text-stone-950 font-bold'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            {selectedYear === 'ALL' ? 'Total Listening Time' : `${selectedYear} Listening`}
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-100 mt-1 block">
            {selectedYear === 'ALL' ? `${stats.totalHours.toLocaleString()} hrs` : `${activeYearData?.totalHours || 0} hrs`}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {selectedYear === 'ALL' ? `${stats.totalMinutes.toLocaleString()} minutes` : 'Calculated from ms_played'}
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Top Artist
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-sky-400 mt-1 block truncate">
            {selectedYear === 'ALL'
              ? stats.mostPlayedArtist.name
              : activeYearData?.topArtists[0]?.name || '—'}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {selectedYear === 'ALL'
              ? `${stats.mostPlayedArtist.count} plays logged`
              : `${activeYearData?.topArtists[0]?.count || 0} tracks`}
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Skip & Shuffle
          </span>
          <div className="flex items-center gap-3 mt-1.5 font-mono text-sm font-semibold text-stone-200">
            <span className="flex items-center gap-1 text-amber-300">
              <SkipForward className="h-3.5 w-3.5" />
              {selectedYear === 'ALL' ? `${stats.overallSkipRate}%` : `${activeYearData?.skipRate || 0}%`}
            </span>
            <span className="flex items-center gap-1 text-sky-300">
              <Shuffle className="h-3.5 w-3.5" />
              {selectedYear === 'ALL' ? `${stats.overallShuffleRate}%` : `${activeYearData?.shuffleRate || 0}%`}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            Skip rate / Shuffle rate
          </span>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <span className="text-[11px] font-mono text-stone-400 block uppercase">
            Peak Listening Hour
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-stone-100 mt-1 block">
            {selectedYear === 'ALL'
              ? `${stats.mostActiveHour.toString().padStart(2, '0')}:00 UTC`
              : `${(activeYearData?.peakHour || 0).toString().padStart(2, '0')}:00 UTC`}
          </span>
          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
            {selectedYear === 'ALL' ? `Top Day: ${stats.mostActiveDay}` : `Platform: ${activeYearData?.primaryPlatform || '—'}`}
          </span>
        </div>
      </div>

      {/* Top Tracks & Artists Breakout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Tracks */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono flex items-center gap-2">
              <Music className="h-3.5 w-3.5 text-sky-400" />
              <span>Top Tracks {selectedYear !== 'ALL' && `(${selectedYear})`}</span>
            </h4>
            <span className="text-[10px] font-mono text-stone-400">Plays</span>
          </div>

          <div className="space-y-2">
            {(selectedYear === 'ALL'
              ? stats.topTracks.slice(0, 5)
              : activeYearData?.topTracks || []
            ).map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-stone-400 w-4">
                    0{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-medium text-stone-200 truncate">{t.title}</p>
                    <p className="text-[11px] text-stone-400 truncate">{t.artist}</p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-amber-400 text-xs shrink-0 pl-2">
                  {t.count}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 font-mono flex items-center gap-2">
              <Laptop className="h-3.5 w-3.5 text-sky-400" />
              <span>Streaming Platforms</span>
            </h4>
            <span className="text-[10px] font-mono text-stone-400">Share</span>
          </div>

          <div className="space-y-2.5">
            {stats.platformBreakdown.slice(0, 5).map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-300 font-medium">{p.platform}</span>
                  <span className="font-mono text-stone-400">
                    {p.count} plays ({p.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-950 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
