import React from 'react';
import { ArrowRight, Clock, GitBranch, Sparkles, X } from 'lucide-react';
import { ReceiptConnection } from '../../types/connections';
import { Receipt } from '../../types/receipt';
import { formatSafeTimestamp, formatTimeOnly } from '../../utils/dates';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface NodeInfoPanelProps {
  selectedReceipt: Receipt | null;
  onClearSelection: () => void;
  connections: ReceiptConnection[];
  allReceipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  selectedReceipt,
  onClearSelection,
  connections,
  allReceipts,
  onSelectReceipt,
}) => {
  if (!selectedReceipt) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5 text-center text-xs text-stone-400">
        <GitBranch className="h-6 w-6 text-stone-600 mx-auto mb-2" />
        <p className="font-medium text-stone-300">Connect the Dots</p>
        <p className="mt-1 text-stone-400">
          Select any node on the Life Map to trace its temporal, cross-domain, and routine linkages.
        </p>
      </div>
    );
  }

  // Find all connections involving this receipt
  const directConnections = connections.filter(
    c => c.sourceId === selectedReceipt.id || c.targetId === selectedReceipt.id
  );

  const receiptMap = new Map(allReceipts.map(r => [r.id, r]));

  return (
    <div className="rounded-xl border border-amber-500/40 bg-stone-900/95 p-5 shadow-2xl space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            {getReceiptTypeIcon(selectedReceipt.type, 'h-4 w-4')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                {selectedReceipt.type}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {formatTimeOnly(selectedReceipt.timestamp)} UTC
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-100 mt-0.5">
              {selectedReceipt.title}
            </h4>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="rounded-md p-1 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
          aria-label="Deselect node"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subtitle / Context */}
      {selectedReceipt.subtitle && (
        <p className="text-xs text-stone-300 font-medium">
          {selectedReceipt.subtitle}
        </p>
      )}

      {/* Connect The Dots Explanation */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Why are these connected?</span>
        </div>

        {directConnections.length === 0 ? (
          <p className="text-xs text-stone-400 bg-stone-950/60 p-3 rounded-lg border border-stone-800">
            This moment occurred as an isolated entry with no other recorded moments within its 4-hour temporal window.
          </p>
        ) : (
          <div className="space-y-2.5">
            {directConnections.map(c => {
              const partnerId = c.sourceId === selectedReceipt.id ? c.targetId : c.sourceId;
              const partner = receiptMap.get(partnerId);
              if (!partner) return null;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectReceipt(partner)}
                  className="group rounded-lg border border-stone-800 bg-stone-950/80 p-3 hover:border-amber-500/50 hover:bg-stone-950 transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between mb-1 text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400">
                        {getReceiptTypeIcon(partner.type, 'h-3.5 w-3.5')}
                      </span>
                      <span className="font-semibold text-stone-200 group-hover:text-amber-300 transition-colors">
                        {partner.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px]">
                      {formatTimeOnly(partner.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    {c.reason}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800/60 text-[10px] text-stone-400 font-mono">
                    <span className="text-amber-400/80 uppercase">
                      Connection: {c.type}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-amber-300">
                      Jump to node <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
