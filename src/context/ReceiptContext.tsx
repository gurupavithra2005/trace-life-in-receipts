/**
 * TRACE Receipt Context
 * Provides clean architectural dependency injection for the entire receipt data pipeline,
 * story correlation engine, and filter states.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useFilters, FilterState } from '../hooks/useFilters';
import { useReceipts } from '../hooks/useReceipts';
import { useStoryEngine } from '../hooks/useStoryEngine';
import { Receipt, DataQualityReport } from '../types/receipt';
import { LifeChapter } from '../types/chapters';
import { ConnectedCluster, ReceiptConnection } from '../types/connections';
import { DetectedPattern } from '../types/patterns';
import { LifeInsight, WhatDoesItMeanNarrative } from '../types/insights';
import { SpotifyListeningStats, SpotifyYearData } from '../types/spotify';
import { HouseholdTransactionStats, IndiaTransactionSafeStats } from '../types/transactions';
import { IndexedReceiptStore, getOverviewMetrics } from '../utils/aggregation';

export type OverviewMetrics = ReturnType<typeof getOverviewMetrics>;

interface ReceiptContextType {
  receipts: Receipt[];
  dataQuality: DataQualityReport;
  errorNotice: string | null;
  isLoading: boolean;
  spotifyStats: SpotifyListeningStats | null;
  spotifyYearsData: Map<number, SpotifyYearData>;
  householdStats: HouseholdTransactionStats | null;
  indiaStats: IndiaTransactionSafeStats | null;
  index: IndexedReceiptStore | null;
  overviewMetrics: OverviewMetrics | null;
  importUserFile: (file: File) => Promise<void>;
  loadDefaultData: () => void;
  // Story engine
  connections: ReceiptConnection[];
  clusters: ConnectedCluster[];
  patterns: DetectedPattern[];
  chapters: LifeChapter[];
  insights: LifeInsight[];
  narrative: WhatDoesItMeanNarrative;
  // Filter state
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  filteredReceipts: Receipt[];
  availableYears: number[];
  availableCategories: string[];
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const ReceiptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    receipts,
    dataQuality,
    errorNotice,
    isLoading,
    spotifyStats,
    spotifyYearsData,
    householdStats,
    indiaStats,
    index,
    overviewMetrics,
    importUserFile,
    loadDefaultData,
  } = useReceipts();

  const {
    connections,
    clusters,
    patterns,
    chapters,
    insights,
    narrative,
  } = useStoryEngine(receipts);

  const {
    filters,
    updateFilters,
    resetFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
  } = useFilters(receipts);

  const value = useMemo<ReceiptContextType>(() => ({
    receipts,
    dataQuality,
    errorNotice,
    isLoading,
    spotifyStats,
    spotifyYearsData,
    householdStats,
    indiaStats,
    index,
    overviewMetrics,
    importUserFile,
    loadDefaultData,
    connections,
    clusters,
    patterns,
    chapters,
    insights,
    narrative,
    filters,
    updateFilters,
    resetFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
  }), [
    receipts,
    dataQuality,
    errorNotice,
    isLoading,
    spotifyStats,
    spotifyYearsData,
    householdStats,
    indiaStats,
    index,
    overviewMetrics,
    importUserFile,
    loadDefaultData,
    connections,
    clusters,
    patterns,
    chapters,
    insights,
    narrative,
    filters,
    updateFilters,
    resetFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
  ]);

  return <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>;
};

export function useReceiptContext(): ReceiptContextType {
  const ctx = useContext(ReceiptContext);
  if (!ctx) {
    throw new Error('useReceiptContext must be used within a ReceiptProvider');
  }
  return ctx;
}
