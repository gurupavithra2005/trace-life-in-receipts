/**
 * TRACE Receipt Service
 * Core service layer orchestrating dataset ingestion, normalization,
 * indexing, and data quality validation.
 */

import {
  normalizeHouseholdTransactions,
  normalizeIndiaTransactions,
  normalizeSpotifyData,
} from '../adapters';
import {
  DEFAULT_HOUSEHOLD_TRANSACTIONS,
  DEFAULT_INDIA_TRANSACTIONS,
  DEFAULT_SPOTIFY_RECORDS,
} from '../data/defaultDatasets';
import { Receipt, DataQualityReport } from '../types/receipt';
import { buildReceiptIndex, getOverviewMetrics } from '../utils/aggregation';
import { deduplicateReceipts } from '../utils/validation';

export class ReceiptService {
  /**
   * Ingests and merges all default datasets into a single chronological stream.
   */
  public static loadDefaultDatasets() {
    const spotifyRes = normalizeSpotifyData(DEFAULT_SPOTIFY_RECORDS);
    const householdRes = normalizeHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS);
    const indiaRes = normalizeIndiaTransactions(DEFAULT_INDIA_TRANSACTIONS);

    const merged = [
      ...spotifyRes.receipts,
      ...householdRes.receipts,
      ...indiaRes.receipts,
    ];

    const { deduplicated, duplicateCount } = deduplicateReceipts(merged);
    const sorted = [...deduplicated].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    const totalRaw = spotifyRes.stats.totalRecords + householdRes.stats.totalTransactions + indiaRes.stats.totalTransactions;
    const valid = sorted.length;
    const skipped = totalRaw - valid;

    const dataQuality: DataQualityReport = {
      totalRawRecords: totalRaw,
      validReceipts: valid,
      skippedMalformedRecords: skipped,
      missingOptionalFields: 0,
      duplicateRecordsFiltered: duplicateCount,
      sensitiveFieldsRemoved: householdRes.stats.totalTransactions + indiaRes.stats.totalTransactions,
      sources: [
        {
          sourceName: 'Spotify Extended Streaming History',
          count: spotifyRes.receipts.length,
          types: ['MUSIC'],
        },
        {
          sourceName: 'Household Transactions',
          count: householdRes.receipts.length,
          types: ['PURCHASE'],
        },
        {
          sourceName: 'India Transact Records',
          count: indiaRes.receipts.length,
          types: ['PURCHASE'],
        },
      ],
    };

    const index = buildReceiptIndex(sorted);
    const overviewMetrics = getOverviewMetrics(sorted, index);

    return {
      receipts: sorted,
      dataQuality,
      spotifyStats: spotifyRes.stats,
      spotifyYearsData: spotifyRes.yearsData,
      householdStats: householdRes.stats,
      indiaStats: indiaRes.stats,
      index,
      overviewMetrics,
    };
  }
}
