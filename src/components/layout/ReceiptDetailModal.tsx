import React from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  Film,
  GitBranch,
  Headphones,
  Image as ImageIcon,
  Info,
  MapPin,
  MessageSquare,
  Music,
  Notebook,
  Receipt as ReceiptIcon,
  Search,
  Shield,
  Tag,
  X,
} from 'lucide-react';
import { Receipt, ReceiptType } from '../../types/receipt';
import { formatSafeTimestamp, getTimeOfDayBucket } from '../../utils/dates';
import { formatCurrency, formatMsToHoursAndMinutes } from '../../utils/numbers';

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  onClose: () => void;
  connectedReceipts?: { receipt: Receipt; reason: string; strength: number }[];
  onSelectConnectedReceipt?: (receipt: Receipt) => void;
}

export const getReceiptTypeIcon = (type: ReceiptType, className = 'h-4 w-4') => {
  switch (type) {
    case 'MUSIC':
      return <Headphones className={className} />;
    case 'MOVIE':
      return <Film className={className} />;
    case 'PLACE':
      return <MapPin className={className} />;
    case 'PURCHASE':
      return <ReceiptIcon className={className} />;
    case 'PHOTO':
      return <ImageIcon className={className} />;
    case 'MESSAGE':
      return <MessageSquare className={className} />;
    case 'SEARCH':
      return <Search className={className} />;
    case 'EVENT':
      return <Calendar className={className} />;
    case 'NOTE':
      return <Notebook className={className} />;
    default:
      return <ReceiptIcon className={className} />;
  }
};

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  onClose,
  connectedReceipts = [],
  onSelectConnectedReceipt,
}) => {
  if (!receipt) return null;

  const msPlayed = typeof receipt.metadata?.ms_played === 'number' ? receipt.metadata.ms_played : null;
  const timeDuration = msPlayed ? formatMsToHoursAndMinutes(msPlayed) : null;
  const hour = new Date(receipt.timestamp).getUTCHours();
  const timeOfDay = getTimeOfDayBucket(hour);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="relative w-full max-w-xl rounded-xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden text-stone-200">
        {/* Receipt Header Style */}
        <div className="border-b border-stone-800 bg-stone-950/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {getReceiptTypeIcon(receipt.type, 'h-5 w-5')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {receipt.type}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  ID: {receipt.id}
                </span>
              </div>
              <h3 id="receipt-detail-title" className="text-base font-semibold text-stone-100 mt-0.5">
                {receipt.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs">
          {/* Subtitle / Artist / Merchant */}
          {receipt.subtitle && (
            <div className="rounded-lg bg-stone-950/40 p-3.5 border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-mono mb-1">
                Context / Entity
              </span>
              <p className="text-sm font-medium text-stone-200">{receipt.subtitle}</p>
              {receipt.description && (
                <p className="text-xs text-stone-400 mt-1">{receipt.description}</p>
              )}
            </div>
          )}

          {/* Temporal & Spatial Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-stone-950/40 p-3 border border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-mono mb-1">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>Timestamp (UTC)</span>
              </div>
              <p className="font-mono text-stone-200 font-medium">
                {formatSafeTimestamp(receipt.timestamp)}
              </p>
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                {timeOfDay} ({hour.toString().padStart(2, '0')}:00 UTC)
              </span>
            </div>

            <div className="rounded-lg bg-stone-950/40 p-3 border border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-400 text-[10px] uppercase font-mono mb-1">
                <MapPin className="h-3 w-3 text-amber-400" />
                <span>Location (Safe Area)</span>
              </div>
              <p className="font-mono text-stone-200 font-medium">
                {receipt.location?.safeArea || 'Digital / Ambient'}
              </p>
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Source: {receipt.source}
              </span>
            </div>
          </div>

          {/* Financial or Duration Metric */}
          {(receipt.amount !== undefined || timeDuration) && (
            <div className="rounded-lg bg-stone-950/60 p-3.5 border border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-mono block">
                  {receipt.amount !== undefined ? 'Transaction Value' : 'Listening Duration'}
                </span>
                <span className="font-mono text-lg font-bold text-amber-300">
                  {receipt.amount !== undefined
                    ? formatCurrency(receipt.amount, receipt.currency || '₹')
                    : timeDuration?.display}
                </span>
              </div>

              {Boolean(receipt.metadata?.paymentMode) && (
                <div className="text-right">
                  <span className="text-stone-400 text-[10px] uppercase font-mono block">
                    Mode
                  </span>
                  <span className="font-medium text-stone-300 text-xs">
                    {String(receipt.metadata?.paymentMode ?? '')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sanitized Metadata */}
          {receipt.metadata && Object.keys(receipt.metadata).length > 0 && (
            <div className="rounded-lg bg-stone-950/40 p-3.5 border border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-mono mb-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span>Sanitized Source Attributes</span>
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                {Object.entries(receipt.metadata)
                  .filter(([key]) => !['ms_played', 'amount'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="p-1.5 rounded bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">{key}</span>
                      <span className="text-stone-200 truncate block">
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Connected Receipts Section: "Why are these connected?" */}
          {connectedReceipts.length > 0 && (
            <div className="rounded-lg bg-stone-950/60 p-4 border border-stone-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-3">
                <GitBranch className="h-4 w-4" />
                <span>Connected Moments in This Window</span>
              </div>

              <div className="space-y-2.5">
                {connectedReceipts.map((cr, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectConnectedReceipt && onSelectConnectedReceipt(cr.receipt)}
                    className="p-2.5 rounded-md bg-stone-900 hover:bg-stone-800/80 border border-stone-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400">
                          {getReceiptTypeIcon(cr.receipt.type, 'h-3.5 w-3.5')}
                        </span>
                        <span className="font-semibold text-stone-200 group-hover:text-amber-300 transition-colors">
                          {cr.receipt.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-stone-400">
                        {formatSafeTimestamp(cr.receipt.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 bg-stone-950/60 p-2 rounded border border-stone-800/60 mt-1.5">
                      <strong className="text-amber-400/90 font-mono text-[10px] uppercase block mb-0.5">
                        Why are these connected?
                      </strong>
                      <span>{cr.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
