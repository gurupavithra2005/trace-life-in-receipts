import React from 'react';
import { ArrowRight, Clock, Moon, Sparkles } from 'lucide-react';
import { ConnectedCluster } from '../../types/connections';
import { Receipt } from '../../types/receipt';
import { formatTimeOnly, safeParseDate } from '../../utils/dates';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface HeroStoryClusterProps {
  cluster: ConnectedCluster | null;
  allReceipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  onExploreConnections: () => void;
}

export const HeroStoryCluster: React.FC<HeroStoryClusterProps> = ({
  cluster,
  allReceipts,
  onSelectReceipt,
  onExploreConnections,
}) => {
  if (!cluster) return null;

  const receiptMap = new Map(allReceipts.map(r => [r.id, r]));
  const clusterReceipts = cluster.receiptIds
    .map(id => receiptMap.get(id))
    .filter((r): r is Receipt => !!r)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (clusterReceipts.length === 0) return null;

  return (
    <div className="relative rounded-2xl border border-amber-500/40 bg-stone-950 p-6 sm:p-8 shadow-2xl overflow-hidden group">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Moon className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400 font-semibold block">
              FEATURED STORY CLUSTER
            </span>
            <h3 className="font-mono text-base sm:text-lg font-bold text-stone-100 uppercase tracking-wider">
              ONE NIGHT • {cluster.timeWindowDescription}
            </h3>
          </div>
        </div>

        <button
          onClick={onExploreConnections}
          className="flex items-center gap-1.5 rounded-md border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-medium text-stone-200 hover:border-amber-400 hover:text-amber-300 transition-colors focus:outline-none"
        >
          <span>Explore Connections</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Sequential Moments Chain */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {clusterReceipts.map((r, i) => {
          const time = formatTimeOnly(r.timestamp);
          return (
            <div
              key={r.id}
              onClick={() => onSelectReceipt(r)}
              className="relative p-4 rounded-xl border border-stone-800/80 bg-stone-900/70 hover:bg-stone-900 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {time} UTC
                </span>
                <span className="px-1.5 py-0.5 rounded bg-stone-950 text-[10px] font-mono text-stone-400 border border-stone-800">
                  {r.type}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-stone-100 line-clamp-1">
                {r.title}
              </h4>
              {r.subtitle && (
                <p className="text-xs text-stone-400 line-clamp-1">
                  {r.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Narrative */}
      <div className="rounded-xl bg-stone-900/60 p-4 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-mono text-stone-200 font-semibold text-sm block">
            {clusterReceipts.length} small moments. One connected story.
          </span>
          <p className="text-stone-400 text-xs mt-0.5 max-w-2xl leading-relaxed">
            {cluster.significance} Individual records appear isolated in isolation, but align chronologically into a focused creative flow.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-amber-400/90">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Local Pattern Engine Discovery</span>
        </div>
      </div>
    </div>
  );
};
