/**
 * Data validation helpers for TRACE.
 * Isolates bad records cleanly and builds a validation diagnostic report.
 */

import { Receipt } from '../types/receipt';

export function validateReceipt(candidate: Partial<Receipt>): { isValid: boolean; reason?: string } {
  if (!candidate.id || typeof candidate.id !== 'string') {
    return { isValid: false, reason: 'Missing or invalid receipt ID' };
  }
  if (!candidate.type) {
    return { isValid: false, reason: 'Missing receipt type' };
  }
  if (!candidate.timestamp || isNaN(new Date(candidate.timestamp).getTime())) {
    return { isValid: false, reason: 'Missing or invalid timestamp' };
  }
  if (!candidate.title || candidate.title.trim().length === 0) {
    return { isValid: false, reason: 'Missing receipt title' };
  }
  return { isValid: true };
}

export function deduplicateReceipts(receipts: Receipt[]): { deduplicated: Receipt[]; duplicateCount: number } {
  const seen = new Set<string>();
  const deduplicated: Receipt[] = [];
  let duplicateCount = 0;

  for (const r of receipts) {
    const key = `${r.type}_${r.timestamp}_${r.title.toLowerCase().trim()}`;
    if (seen.has(key)) {
      duplicateCount++;
    } else {
      seen.add(key);
      deduplicated.push(r);
    }
  }

  return { deduplicated, duplicateCount };
}
