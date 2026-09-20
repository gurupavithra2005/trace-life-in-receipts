/**
 * Connection types for TRACE Connection Engine
 */

export type ConnectionType =
  | 'TEMPORAL'       // Same hour or short window (< 4 hours)
  | 'CATEGORY'       // Related category / thematic coherence
  | 'CROSS_TYPE'     // e.g. Song played + Purchase made within window
  | 'SEQUENCE'       // Sequential event in life flow
  | 'LOCATION'       // Same safe location/city/region
  | 'BEHAVIORAL';    // Late-night cluster, weekend pattern, etc.

export interface ReceiptConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  strength: number; // 0 to 1
  reason: string;
  timestampDeltaSeconds: number;
}

export interface ConnectedCluster {
  id: string;
  title: string;
  summary: string;
  timeWindowDescription: string;
  receiptIds: string[];
  primaryType: string;
  connections: ReceiptConnection[];
  significance: string;
}
