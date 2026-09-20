import { describe, expect, it } from 'vitest';
import { detectPatterns } from '../engine/patterns';
import { adaptSpotifyRecords, adaptHouseholdTransactions, adaptIndiaTransactions } from '../adapters';
import { DEFAULT_SPOTIFY_RECORDS, DEFAULT_HOUSEHOLD_TRANSACTIONS, DEFAULT_INDIA_TRANSACTIONS } from '../data/defaultDatasets';

describe('Deterministic Behavioral Pattern Engine', () => {
  it('returns an empty array when no receipts are provided', () => {
    expect(detectPatterns([])).toEqual([]);
  });

  it('detects multiple empirical patterns from full real-world multi-year receipts', () => {
    const receipts = [
      ...adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS),
      ...adaptHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS),
      ...adaptIndiaTransactions(DEFAULT_INDIA_TRANSACTIONS),
    ];

    const patterns = detectPatterns(receipts);
    expect(patterns.length).toBeGreaterThan(0);

    patterns.forEach((pattern) => {
      expect(pattern.id).toBeDefined();
      expect(pattern.title).toBeDefined();
      expect(pattern.category).toBeDefined();
      expect(pattern.evidence).toBeInstanceOf(Array);
      expect(pattern.evidence.length).toBeGreaterThan(0);
      expect(pattern.summary.length).toBeGreaterThan(10);
    });
  });

  it('identifies late night focus and sonic anchor patterns with empirical evidence', () => {
    const musicReceipts = adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS);
    const patterns = detectPatterns(musicReceipts);

    const sonicPattern = patterns.find((p) => p.category === 'MUSICAL' || p.category === 'TEMPORAL');
    expect(sonicPattern).toBeDefined();
    expect(sonicPattern?.evidence.length).toBeGreaterThan(0);
  });
});
