/**
 * Normalized Receipt and Digital Moment Types for TRACE
 * Strict security & privacy standards applied: no raw credentials or sensitive identifiers.
 */

export type ReceiptType =
  | 'MUSIC'
  | 'MOVIE'
  | 'PLACE'
  | 'PURCHASE'
  | 'PHOTO'
  | 'MESSAGE'
  | 'SEARCH'
  | 'EVENT'
  | 'NOTE';

export interface LocationInfo {
  city?: string;
  region?: string;
  country?: string;
  safeArea?: string; // generalized location label (e.g. "South Region", "Metro Area")
}

export interface Receipt {
  id: string; // Stable internal identifier, e.g., rcpt_sp_1234
  type: ReceiptType;
  timestamp: string; // ISO 8601 string
  title: string;
  subtitle?: string;
  description?: string;
  source: string; // e.g. "spotify_history.csv", "Daily Household Transactions.csv", "IndiaTransact_2024"
  location?: LocationInfo;
  amount?: number;
  currency?: string;
  tags?: string[];
  metadata?: Record<string, unknown>; // Only sanitized safe key-value pairs
  rawReferenceId?: string; // Hashed or obfuscated reference
}

export interface DataQualityReport {
  totalRawRecords: number;
  validReceipts: number;
  skippedMalformedRecords: number;
  missingOptionalFields: number;
  duplicateRecordsFiltered: number;
  sensitiveFieldsRemoved: number;
  sources: {
    sourceName: string;
    count: number;
    types: ReceiptType[];
  }[];
}
