import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX } from 'lucide-react';
import { Receipt } from '../../types/receipt';
import { ReceiptCard } from './ReceiptCard';

interface ReceiptListProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceiptId?: string;
  pageSize?: number;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  onSelectReceipt,
  selectedReceiptId,
  pageSize = 12,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(receipts.length / pageSize));

  // Reset page if receipts length changes drastically
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const currentReceipts = receipts.slice(startIndex, startIndex + pageSize);

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-stone-800 bg-stone-900/40 p-12 text-center text-stone-400">
        <SearchX className="h-10 w-10 text-stone-600 mb-3" />
        <h3 className="text-sm font-semibold text-stone-300">No moments found</h3>
        <p className="text-xs text-stone-400 mt-1 max-w-sm">
          Try loosening your search terms, resetting filters, or uploading additional data files.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of Receipts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentReceipts.map(receipt => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onSelect={onSelectReceipt}
            isSelected={receipt.id === selectedReceiptId}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-stone-800/80 text-xs text-stone-400">
          <div className="font-mono">
            Showing <strong className="text-stone-200">{startIndex + 1}</strong> –{' '}
            <strong className="text-stone-200">
              {Math.min(startIndex + pageSize, receipts.length)}
            </strong>{' '}
            of <strong className="text-stone-200">{receipts.length.toLocaleString()}</strong> moments
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-800 focus:outline-none"
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-800 focus:outline-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="px-2.5 py-1 rounded bg-stone-950 border border-stone-800 text-stone-200 font-semibold">
              {validCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-800 focus:outline-none"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300 disabled:opacity-30 hover:bg-stone-800 focus:outline-none"
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
