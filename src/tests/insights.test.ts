import { describe, expect, it } from 'vitest';
import { generateInsights } from '../engine/insights';
import { adaptSpotifyRecords, adaptHouseholdTransactions, adaptIndiaTransactions } from '../adapters';
import { DEFAULT_SPOTIFY_RECORDS, DEFAULT_HOUSEHOLD_TRANSACTIONS, DEFAULT_INDIA_TRANSACTIONS } from '../data/defaultDatasets';

describe('Insight & Narrative Synthesis Engine', () => {
  it('returns safe fallback narrative when receipts array is empty', () => {
    const result = generateInsights([]);
    expect(result.insights).toEqual([]);
    expect(result.narrative.headline).toBe('Awaiting Data');
  });

  it('synthesizes actionable life insights and objective What-Does-It-Mean narrative', () => {
    const receipts = [
      ...adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS),
      ...adaptHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS),
      ...adaptIndiaTransactions(DEFAULT_INDIA_TRANSACTIONS),
    ];

    const { insights, narrative } = generateInsights(receipts);
    expect(insights.length).toBeGreaterThan(0);
    expect(narrative.headline).toBeDefined();
    expect(narrative.narrativeParagraphs.length).toBeGreaterThan(0);
    expect(narrative.keyDiscoveries.length).toBeGreaterThan(0);
    expect(narrative.concludingThought).toBeDefined();

    insights.forEach((insight) => {
      expect(insight.id).toBeDefined();
      expect(insight.title).toBeDefined();
      expect(insight.explanation).toBeDefined();
      expect(insight.supportingMetric).toBeDefined();
      expect(insight.supportingMetric.value).toBeDefined();
    });
  });
});
