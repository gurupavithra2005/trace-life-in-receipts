/**
 * India MultiFacet Transaction Adapter
 * Strictly protects sensitive identifiers:
 * - NO raw cc_num
 * - NO raw customer_id
 * - NO full street address
 * - NO full date of birth
 * - NO personal names
 * - NO high-precision micro-coordinates
 * Aggregate-only handling for is_fraud signal.
 */

import { Receipt } from '../types/receipt';
import { IndiaTransactionSafeStats, IndiaTransactRawRecord } from '../types/transactions';
import { safeParseDate } from '../utils/dates';
import { safeNumber } from '../utils/numbers';
import { createStableReceiptId, normalizeCategory, safeCoarseLocation, sanitizeMerchantName } from '../utils/sanitize';

export function normalizeIndiaTransactions(
  records: (IndiaTransactRawRecord | Record<string, unknown>)[],
  sourceName = 'IndiaTransact_2024'
): { receipts: Receipt[]; stats: IndiaTransactionSafeStats; malformedCount: number } {
  const receipts: Receipt[] = [];
  let malformedCount = 0;

  let totalVolume = 0;
  let unusualActivityCount = 0;
  const categoryMap = new Map<string, { count: number; volume: number }>();
  const stateMap = new Map<string, number>();
  const merchantMap = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);

  for (let i = 0; i < records.length; i++) {
    const raw = records[i] as Record<string, any>;

    // Timestamp parsing
    const dateStr = String(raw.trans_date_trans_time || raw.Date || raw.date || raw.timestamp || '').trim();
    const amountVal = safeNumber(raw.amt || raw.amount, 0);

    if (!dateStr || amountVal <= 0) {
      malformedCount++;
      continue;
    }

    const parsedDate = safeParseDate(dateStr);
    if (!parsedDate) {
      malformedCount++;
      continue;
    }

    const isoTimestamp = parsedDate.toISOString();
    const cleanMerchant = sanitizeMerchantName(raw.merchant ? String(raw.merchant) : undefined);
    const rawCategory = String(raw.category || 'General').trim();
    const normCategory = normalizeCategory(rawCategory);

    // Coarse safe location (State / City only, no street, no coordinates)
    const rawCity = raw.city ? String(raw.city) : undefined;
    const rawState = raw.state ? String(raw.state) : undefined;
    const coarseLoc = safeCoarseLocation(rawCity, rawState);

    // Track aggregate unusual transaction (never store personal accusation)
    const isUnusual = raw.is_fraud === 1 || raw.is_fraud === '1' || raw.is_fraud === true || raw.is_fraud === 'true';
    if (isUnusual) {
      unusualActivityCount++;
    }

    // Stable opaque receipt ID (never using cc_num or customer_id)
    const stableId = createStableReceiptId('in', `${dateStr}_${cleanMerchant}_${amountVal}_${i}`);

    const safeTitle = `${cleanMerchant}`;
    const safeSubtitle = `${normCategory} • ₹${Math.round(amountVal).toLocaleString()}`;

    // Normalized safe receipt (Sensitive fields dropped completely)
    const receipt: Receipt = {
      id: stableId,
      type: 'PURCHASE',
      timestamp: isoTimestamp,
      title: safeTitle,
      subtitle: safeSubtitle,
      description: `Card transaction at verified merchant in ${coarseLoc.safeArea}.`,
      source: sourceName,
      location: {
        city: coarseLoc.city,
        region: coarseLoc.region,
        safeArea: coarseLoc.safeArea,
      },
      amount: amountVal,
      currency: '₹',
      tags: ['Transaction', normCategory, 'Card Payment'],
      metadata: {
        merchant: cleanMerchant,
        category: normCategory,
        rawCategory,
        amount: amountVal,
        currency: '₹',
        region: coarseLoc.region,
        // Mark as unusual activity indicator without personal identity attribution
        markedUnusual: isUnusual,
      },
    };

    receipts.push(receipt);

    // Aggregate statistics
    totalVolume += amountVal;

    // Categories
    const catData = categoryMap.get(normCategory) || { count: 0, volume: 0 };
    catData.count++;
    catData.volume += amountVal;
    categoryMap.set(normCategory, catData);

    // Regions / States
    if (coarseLoc.region) {
      stateMap.set(coarseLoc.region, (stateMap.get(coarseLoc.region) || 0) + 1);
    }

    // Merchant types
    merchantMap.set(cleanMerchant, (merchantMap.get(cleanMerchant) || 0) + 1);

    // Hour distribution
    const hour = parsedDate.getUTCHours();
    hourCounts[hour]++;
  }

  // Calculate peak transaction hour
  let peakHour = 14;
  let maxHour = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxHour) {
      maxHour = hourCounts[h];
      peakHour = h;
    }
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, count: data.count, volume: Math.round(data.volume) }))
    .sort((a, b) => b.count - a.count);

  const topRegions = Array.from(stateMap.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topMerchantTypes = Array.from(merchantMap.entries())
    .map(([merchant, count]) => ({ merchant, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalCount = receipts.length || 1;
  const averageAmount = Math.round(totalVolume / totalCount);
  const unusualActivityRate = +( (unusualActivityCount / totalCount) * 100 ).toFixed(1);

  const stats: IndiaTransactionSafeStats = {
    totalTransactions: receipts.length,
    totalVolume: Math.round(totalVolume),
    averageAmount,
    topCategories,
    topRegions,
    topMerchantTypes,
    aggregateUnusualActivityCount: unusualActivityCount,
    unusualActivityRate,
    timeOfTransPeakHour: peakHour,
  };

  return { receipts, stats, malformedCount };
}
