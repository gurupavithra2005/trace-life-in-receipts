import React from 'react';
import { Compass, GitBranch, Info, Sparkles } from 'lucide-react';
import { LifeMapCanvas } from '../components/life-map/LifeMapCanvas';
import { NodeInfoPanel } from '../components/life-map/NodeInfoPanel';
import { ConnectedCluster, ReceiptConnection } from '../types/connections';
import { Receipt } from '../types/receipt';

interface LifeMapProps {
  receipts: Receipt[];
  connections: ReceiptConnection[];
  clusters: ConnectedCluster[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceipt: Receipt | null;
  onClearSelection: () => void;
}

export const LifeMap: React.FC<LifeMapProps> = ({
  receipts,
  connections,
  clusters,
  onSelectReceipt,
  selectedReceipt,
  onClearSelection,
}) => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Compass className="h-4 w-4" />
          <span>TRACE CONSTELLATION MAP</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          THE INTERCONNECTED LIFE MAP
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          Moments don't happen in isolation. The Life Map renders your listening sessions, purchases, and routines as a connected graph. Click any node to highlight linked moments and uncover why they belong together.
        </p>
      </div>

      {/* Main Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Visual Constellation (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <LifeMapCanvas
            receipts={receipts}
            connections={connections}
            clusters={clusters}
            onSelectReceipt={onSelectReceipt}
            selectedReceipt={selectedReceipt}
          />

          <div className="rounded-xl bg-stone-950/60 p-4 border border-stone-800 text-xs text-stone-400 flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-200 block mb-0.5">How linkages are calculated:</strong>
              The client-side engine evaluates temporal proximity (same 4-hour window), thematic alignment (late-night creative sprints, daily sustenance), and cross-dataset co-occurrence.
            </div>
          </div>
        </div>

        {/* Node Detail & Connected Moments Panel (1 col) */}
        <div className="space-y-4">
          <NodeInfoPanel
            selectedReceipt={selectedReceipt}
            onClearSelection={onClearSelection}
            connections={connections}
            allReceipts={receipts}
            onSelectReceipt={onSelectReceipt}
          />

          {/* Quick Stats on Clusters */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 space-y-3 text-xs">
            <h4 className="font-mono font-bold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-amber-400" />
              <span>Discovered Activity Clusters ({clusters.length})</span>
            </h4>
            <div className="space-y-2">
              {clusters.slice(0, 4).map(c => (
                <div key={c.id} className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-stone-200">{c.title}</span>
                    <span className="font-mono text-[10px] text-amber-400">{c.receiptIds.length} moments</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{c.significance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
