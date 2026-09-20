import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { TimelineView } from '../components/timeline/TimelineView';
import { Receipt } from '../types/receipt';

interface TimelineProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceiptId?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  receipts,
  onSelectReceipt,
  selectedReceiptId,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Calendar className="h-4 w-4" />
          <span>CHRONOLOGICAL STREAM</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          THE COMPLETE TIMELINE
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl">
          Hierarchical chronological navigation structured strictly by Year → Month → Day → Moment. Select any year or month to inspect raw occurrences and their contextual details.
        </p>
      </div>

      {/* Timeline View Component */}
      <TimelineView
        receipts={receipts}
        onSelectReceipt={onSelectReceipt}
        selectedReceiptId={selectedReceiptId}
      />
    </div>
  );
};
