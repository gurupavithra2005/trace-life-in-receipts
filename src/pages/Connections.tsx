import React, { useState } from 'react';
import { ArrowRight, Clock, GitBranch, Layers, MapPin, Sparkles } from 'lucide-react';
import { ConnectedCluster, ConnectionType, ReceiptConnection } from '../types/connections';
import { Receipt } from '../types/receipt';
import { formatTimeOnly } from '../utils/dates';
import { getReceiptTypeIcon } from '../components/layout/ReceiptDetailModal';

interface ConnectionsProps {
  connections: ReceiptConnection[];
  clusters: ConnectedCluster[];
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

const TYPE_FILTERS: { label: string; value: ConnectionType | 'ALL' }[] = [
  { label: 'All Linkages', value: 'ALL' },
  { label: 'Temporal Window', value: 'TEMPORAL' },
  { label: 'Cross-Dataset', value: 'CROSS_TYPE' },
  { label: 'Category / Thematic', value: 'CATEGORY' },
  { label: 'Sequential Chain', value: 'SEQUENCE' },
  { label: 'Location Proximity', value: 'LOCATION' },
  { label: 'Behavioral Habit', value: 'BEHAVIORAL' },
];

export const Connections: React.FC<ConnectionsProps> = ({
  connections,
  clusters,
  receipts,
  onSelectReceipt,
}) => {
  const [selectedType, setSelectedType] = useState<ConnectionType | 'ALL'>('ALL');
  const [activeClusterId, setActiveClusterId] = useState<string | 'ALL'>('ALL');

  const receiptMap = new Map(receipts.map(r => [r.id, r]));

  const filteredConnections = connections.filter(c => {
    if (selectedType !== 'ALL' && c.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
          <GitBranch className="h-4 w-4" />
          <span>TRACE ENGINE FEATURE</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          CONNECT THE DOTS
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          TRACE automatically bridges disjointed signals across services. Discover how your late-night music sessions, neighborhood purchases, and daily habits interlock into coherent temporal threads.
        </p>
      </div>

      {/* Cluster Discovery Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Discovered Behavioral Clusters</span>
          </h3>
          <span className="text-[11px] font-mono text-stone-400">
            {clusters.length} clusters identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clusters.map(cluster => {
            const clusterReceipts = cluster.receiptIds
              .map(id => receiptMap.get(id))
              .filter((r): r is Receipt => !!r);

            return (
              <div
                key={cluster.id}
                className="rounded-xl border border-stone-800 bg-stone-900/70 p-5 space-y-3 shadow-md hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase block">
                      {cluster.timeWindowDescription}
                    </span>
                    <h4 className="font-mono text-sm font-bold text-stone-100 mt-0.5">
                      {cluster.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    {cluster.receiptIds.length} items
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  {cluster.significance}
                </p>

                {/* Micro moment previews */}
                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  {clusterReceipts.slice(0, 3).map(r => (
                    <div
                      key={r.id}
                      onClick={() => onSelectReceipt(r)}
                      className="flex items-center justify-between p-1.5 rounded bg-stone-950/60 hover:bg-stone-800 cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-amber-400 shrink-0">
                          {getReceiptTypeIcon(r.type, 'h-3 w-3')}
                        </span>
                        <span className="truncate text-stone-200 text-[11px]">{r.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-stone-400 pl-2">
                        {formatTimeOnly(r.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Linkage Types */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setSelectedType(f.value)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === f.value
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-stone-400">
            Showing {filteredConnections.length} connections
          </span>
        </div>

        {/* Connections List With Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.slice(0, 16).map(c => {
            const src = receiptMap.get(c.sourceId);
            const tgt = receiptMap.get(c.targetId);
            if (!src || !tgt) return null;

            return (
              <div
                key={c.id}
                className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3 hover:border-stone-700 transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono border-b border-stone-850 pb-2">
                  <span className="text-amber-400 uppercase font-semibold">
                    Linkage: {c.type}
                  </span>
                  <span className="text-stone-400">
                    Strength: {Math.round(c.strength * 100)}%
                  </span>
                </div>

                {/* Source & Target Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => onSelectReceipt(src)}
                    className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono mb-0.5">
                      <span className="text-amber-400">{getReceiptTypeIcon(src.type, 'h-3 w-3')}</span>
                      <span>{src.type}</span>
                    </div>
                    <p className="font-semibold text-stone-200 truncate">{src.title}</p>
                    <span className="font-mono text-[10px] text-stone-400">{formatTimeOnly(src.timestamp)} UTC</span>
                  </div>

                  <div
                    onClick={() => onSelectReceipt(tgt)}
                    className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono mb-0.5">
                      <span className="text-amber-400">{getReceiptTypeIcon(tgt.type, 'h-3 w-3')}</span>
                      <span>{tgt.type}</span>
                    </div>
                    <p className="font-semibold text-stone-200 truncate">{tgt.title}</p>
                    <span className="font-mono text-[10px] text-stone-400">{formatTimeOnly(tgt.timestamp)} UTC</span>
                  </div>
                </div>

                {/* Why Are These Connected Explanation */}
                <div className="rounded-lg bg-stone-900/90 p-2.5 border border-stone-800">
                  <strong className="text-amber-400 text-[10px] uppercase font-mono block mb-0.5">
                    Why are these connected?
                  </strong>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {c.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
