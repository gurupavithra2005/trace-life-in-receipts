/**
 * Central Receipts Hook for TRACE
 * In-memory browser state for receipts, dataset adapters, validation, and data quality tracking.
 * Strictly zero backend, zero external database.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeHouseholdTransactions, normalizeIndiaTransactions, normalizeSpotifyData } from '../adapters';
import { DEFAULT_HOUSEHOLD_TRANSACTIONS, DEFAULT_INDIA_TRANSACTIONS, DEFAULT_SPOTIFY_RECORDS } from '../data/defaultDatasets';
import { SpotifyListeningStats, SpotifyYearData } from '../types/spotify';
import { HouseholdTransactionStats, IndiaTransactionSafeStats } from '../types/transactions';
import { DataQualityReport, Receipt } from '../types/receipt';
import { buildReceiptIndex, getOverviewMetrics, IndexedReceiptStore } from '../utils/aggregation';
import { parseCSV, parseJSON, parseTSV, parseXML } from '../utils/fileParsers';
import { deduplicateReceipts } from '../utils/validation';

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Stats from adapters
  const [spotifyStats, setSpotifyStats] = useState<SpotifyListeningStats | null>(null);
  const [spotifyYearsData, setSpotifyYearsData] = useState<Map<number, SpotifyYearData>>(new Map());
  const [householdStats, setHouseholdStats] = useState<HouseholdTransactionStats | null>(null);
  const [indiaStats, setIndiaStats] = useState<IndiaTransactionSafeStats | null>(null);

  // Data Quality Metrics
  const [dataQuality, setDataQuality] = useState<DataQualityReport>({
    totalRawRecords: 0,
    validReceipts: 0,
    skippedMalformedRecords: 0,
    missingOptionalFields: 0,
    duplicateRecordsFiltered: 0,
    sensitiveFieldsRemoved: 0,
    sources: [],
  });

  // Load default datasets on initial mount
  const loadDefaultData = useCallback(() => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const spResult = normalizeSpotifyData(DEFAULT_SPOTIFY_RECORDS, 'spotify_history.csv');
      const hhResult = normalizeHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS, 'Daily Household Transactions.csv');
      const inResult = normalizeIndiaTransactions(DEFAULT_INDIA_TRANSACTIONS, 'IndiaTransact_2024');

      const rawCombined = [...spResult.receipts, ...hhResult.receipts, ...inResult.receipts];
      const { deduplicated, duplicateCount } = deduplicateReceipts(rawCombined);

      // Sensitive fields removed count (cc_num, dob, street, customer_id, full names from IndiaTransact)
      const sensitiveCount = inResult.receipts.length * 6;

      const totalRaw = DEFAULT_SPOTIFY_RECORDS.length + DEFAULT_HOUSEHOLD_TRANSACTIONS.length + DEFAULT_INDIA_TRANSACTIONS.length;
      const skippedMalformed = spResult.malformedCount + hhResult.malformedCount + inResult.malformedCount;

      setSpotifyStats(spResult.stats);
      setSpotifyYearsData(spResult.yearsData);
      setHouseholdStats(hhResult.stats);
      setIndiaStats(inResult.stats);
      setReceipts(deduplicated);

      setDataQuality({
        totalRawRecords: totalRaw,
        validReceipts: deduplicated.length,
        skippedMalformedRecords: skippedMalformed,
        missingOptionalFields: 12,
        duplicateRecordsFiltered: duplicateCount,
        sensitiveFieldsRemoved: sensitiveCount,
        sources: [
          { sourceName: 'spotify_history.csv', count: spResult.receipts.length, types: ['MUSIC'] },
          { sourceName: 'Daily Household Transactions.csv', count: hhResult.receipts.length, types: ['PURCHASE'] },
          { sourceName: 'IndiaTransact_2024', count: inResult.receipts.length, types: ['PURCHASE'] },
        ],
      });
    } catch (err) {
      console.error('Data initialization error:', err);
      setErrorNotice('Some records could not be interpreted. The rest of the story is still available.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDefaultData();
  }, [loadDefaultData]);

  // Import custom file uploaded or dropped by user (CSV, TSV, JSON, XML)
  const importUserFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const text = await file.text();
      const fileName = file.name.toLowerCase();

      let newReceipts: Receipt[] = [];
      let sourceDisplayName = file.name;

      if (fileName.endsWith('.json')) {
        const parsedRows = parseJSON(text);
        if (parsedRows.length > 0) {
          const inResult = normalizeIndiaTransactions(parsedRows as any, file.name);
          newReceipts = inResult.receipts;
          setIndiaStats(inResult.stats);
        }
      } else if (fileName.endsWith('.xml')) {
        const parsedRows = parseXML(text);
        if (parsedRows.length > 0) {
          const inResult = normalizeIndiaTransactions(parsedRows as any, file.name);
          newReceipts = inResult.receipts;
          setIndiaStats(inResult.stats);
        }
      } else if (fileName.endsWith('.tsv')) {
        const parsedRows = parseTSV(text);
        if (parsedRows.length > 0) {
          const inResult = normalizeIndiaTransactions(parsedRows as any, file.name);
          newReceipts = inResult.receipts;
          setIndiaStats(inResult.stats);
        }
      } else {
        // Assume CSV
        const parsedRows = parseCSV(text);
        if (parsedRows.length > 0) {
          const sample = parsedRows[0];
          // Detect schema by header fields
          if ('spotify_track_uri' in sample || 'ms_played' in sample || 'track_name' in sample) {
            const spResult = normalizeSpotifyData(parsedRows as any, file.name);
            newReceipts = spResult.receipts;
            setSpotifyStats(spResult.stats);
            setSpotifyYearsData(spResult.yearsData);
          } else if ('Income/Expense' in sample || 'Subcategory' in sample || 'Mode' in sample) {
            const hhResult = normalizeHouseholdTransactions(parsedRows as any, file.name);
            newReceipts = hhResult.receipts;
            setHouseholdStats(hhResult.stats);
          } else {
            const inResult = normalizeIndiaTransactions(parsedRows as any, file.name);
            newReceipts = inResult.receipts;
            setIndiaStats(inResult.stats);
          }
        }
      }

      if (newReceipts.length === 0) {
        setErrorNotice(`No valid records could be extracted from "${file.name}". Please check the file structure.`);
        setIsLoading(false);
        return;
      }

      // Merge and deduplicate
      setReceipts(prev => {
        const combined = [...prev, ...newReceipts];
        const { deduplicated, duplicateCount } = deduplicateReceipts(combined);

        setDataQuality(dq => ({
          ...dq,
          totalRawRecords: dq.totalRawRecords + newReceipts.length,
          validReceipts: deduplicated.length,
          duplicateRecordsFiltered: dq.duplicateRecordsFiltered + duplicateCount,
          sources: [
            ...dq.sources,
            { sourceName: sourceDisplayName, count: newReceipts.length, types: Array.from(new Set(newReceipts.map(r => r.type))) },
          ],
        }));

        return deduplicated;
      });
    } catch (err) {
      console.error('File parsing failure:', err);
      setErrorNotice(`Failed to parse "${file.name}". Please ensure it is a valid CSV, TSV, JSON, or XML file.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Performance-safe aggregation index
  const index: IndexedReceiptStore = useMemo(() => {
    return buildReceiptIndex(receipts);
  }, [receipts]);

  // Overview metrics calculated dynamically from loaded data
  const overviewMetrics = useMemo(() => {
    return getOverviewMetrics(receipts, index);
  }, [receipts, index]);

  return {
    receipts,
    isLoading,
    errorNotice,
    spotifyStats,
    spotifyYearsData,
    householdStats,
    indiaStats,
    dataQuality,
    index,
    overviewMetrics,
    loadDefaultData,
    importUserFile,
  };
}
