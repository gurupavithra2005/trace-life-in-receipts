import { describe, expect, it } from 'vitest';
import { buildConnections } from '../engine/connections';
import { adaptSpotifyRecords, adaptHouseholdTransactions } from '../adapters';
import { DEFAULT_SPOTIFY_RECORDS, DEFAULT_HOUSEHOLD_TRANSACTIONS } from '../data/defaultDatasets';

describe('Deterministic Connection Engine', () => {
  it('returns empty connections and clusters for empty or single receipt sets', () => {
    const emptyResult = buildConnections([]);
    expect(emptyResult.connections).toEqual([]);
    expect(emptyResult.clusters).toEqual([]);

    const singleResult = buildConnections([adaptSpotifyRecords([DEFAULT_SPOTIFY_RECORDS[0]])[0]]);
    expect(singleResult.connections).toEqual([]);
    expect(singleResult.clusters).toEqual([]);
  });

  it('builds cross-domain temporal and thematic connections across receipts', () => {
    const music = adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS.slice(0, 15));
    const purchases = adaptHouseholdTransactions(DEFAULT_HOUSEHOLD_TRANSACTIONS.slice(0, 15));
    const all = [...music, ...purchases];

    const { connections, clusters } = buildConnections(all);
    expect(connections.length).toBeGreaterThan(0);
    expect(clusters.length).toBeGreaterThan(0);

    const firstConn = connections[0];
    expect(firstConn).toHaveProperty('id');
    expect(firstConn).toHaveProperty('sourceId');
    expect(firstConn).toHaveProperty('targetId');
    expect(firstConn).toHaveProperty('type');
    expect(firstConn).toHaveProperty('strength');
    expect(firstConn).toHaveProperty('reason');
  });

  it('enforces connection strength bounds between 0 and 1', () => {
    const receipts = adaptSpotifyRecords(DEFAULT_SPOTIFY_RECORDS.slice(0, 20));
    const { connections } = buildConnections(receipts);

    connections.forEach((conn) => {
      expect(conn.strength).toBeGreaterThan(0);
      expect(conn.strength).toBeLessThanOrEqual(1);
    });
  });
});
