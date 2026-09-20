export * from './spotifyAdapter';
export * from './householdTransactionAdapter';
export * from './indiaTransactionAdapter';

import { normalizeSpotifyData } from './spotifyAdapter';
import { normalizeHouseholdTransactions } from './householdTransactionAdapter';
import { normalizeIndiaTransactions } from './indiaTransactionAdapter';
import { SpotifyRawRecord } from '../types/spotify';
import { HouseholdRawRecord, IndiaTransactRawRecord } from '../types/transactions';
import { Receipt } from '../types/receipt';

export function adaptSpotifyRecords(records: (SpotifyRawRecord | Record<string, unknown>)[]): Receipt[] {
  return normalizeSpotifyData(records).receipts;
}

export function adaptHouseholdTransactions(records: (HouseholdRawRecord | Record<string, unknown>)[]): Receipt[] {
  return normalizeHouseholdTransactions(records).receipts;
}

export function adaptIndiaTransactions(records: (IndiaTransactRawRecord | Record<string, unknown>)[]): Receipt[] {
  return normalizeIndiaTransactions(records).receipts;
}
