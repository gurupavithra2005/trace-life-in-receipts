import { describe, expect, it } from 'vitest';
import { generateChapters } from '../engine/stories';
import { adaptSpotifyRecords, adaptHouseholdTransactions } from '../adapters';
import { DEFAULT_SPOTIFY_RECORDS, DEFAULT_HOUSEHOLD_TRANSACTIONS } from '../data/defaultDatasets';

describe('Story Synthesis Engine', () => {
  it('handles empty receipts gracefully', () => {
    expect(generateChapters([])).toEqual([]);
  });

  it('generates chronological chapters with authentic narratives and key moments', () => {
    const receipts = [
      ...adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS),
      ...adaptHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS),
    ];

    const chapters = generateChapters(receipts);
    expect(chapters.length).toBeGreaterThanOrEqual(2);

    chapters.forEach((chapter) => {
      expect(chapter.id).toBeDefined();
      expect(chapter.title).toBeDefined();
      expect(chapter.timeRange).toBeDefined();
      expect(chapter.summary.length).toBeGreaterThan(10);
      expect(chapter.keyMomentReceiptIds.length).toBeGreaterThan(0);
      expect(chapter.supportingMetrics.length).toBeGreaterThan(0);
    });
  });
});
