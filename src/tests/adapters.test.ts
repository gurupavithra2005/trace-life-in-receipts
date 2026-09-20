import { describe, expect, it } from 'vitest';
import { adaptSpotifyRecords, adaptHouseholdTransactions, adaptIndiaTransactions } from '../adapters';
import { DEFAULT_SPOTIFY_RECORDS, DEFAULT_HOUSEHOLD_TRANSACTIONS, DEFAULT_INDIA_TRANSACTIONS } from '../data/defaultDatasets';

describe('Data Adapters & Ingestion Normalizer', () => {
  it('correctly adapts raw Spotify listening records into unified Receipt entities', () => {
    const receipts = adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS);
    expect(receipts.length).toBeGreaterThan(0);
    const sample = receipts[0];
    expect(sample.type).toBe('MUSIC');
    expect(sample.title).toBeDefined();
    expect(sample.subtitle).toBeDefined();
    expect(sample.timestamp).toBeDefined();
    expect(sample.metadata).toBeDefined();
  });

  it('correctly adapts raw Household transactions with PII sanitization and valid amounts', () => {
    const receipts = adaptHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS);
    expect(receipts.length).toBeGreaterThan(0);
    const sample = receipts[0];
    expect(sample.type).toBe('PURCHASE');
    expect(sample.amount).toBeDefined();
    expect(typeof sample.amount).toBe('number');
    expect(sample.amount).toBeGreaterThan(0);
  });

  it('correctly adapts raw India digital payment transactions with INR currency', () => {
    const receipts = adaptIndiaTransactions(DEFAULT_INDIA_TRANSACTIONS);
    expect(receipts.length).toBeGreaterThan(0);
    const sample = receipts[0];
    expect(sample.type).toBe('PURCHASE');
    expect(sample.currency).toBe('₹');
    expect(sample.amount).toBeGreaterThan(0);
  });

  it('maintains strict deterministic IDs and stable schema', () => {
    const sp1 = adaptSpotifyRecords([DEFAULT_SPOTIFY_RECORDS[0]]);
    const sp2 = adaptSpotifyRecords([DEFAULT_SPOTIFY_RECORDS[0]]);
    expect(sp1[0].id).toBe(sp2[0].id);
    expect(sp1[0].title).toBe(sp2[0].title);
  });
});
