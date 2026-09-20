/**
 * Pattern types detected deterministically by TRACE Pattern Engine
 */

export type PatternCategory =
  | 'TEMPORAL'
  | 'HABITUAL'
  | 'FINANCIAL'
  | 'MUSICAL'
  | 'SPATIAL';

export interface DetectedPattern {
  id: string;
  category: PatternCategory;
  title: string;
  subtitle: string;
  summary: string;
  evidence: {
    label: string;
    value: string | number;
  }[];
  supportingReceiptIds: string[];
  confidence: number; // 0 to 1
  timeframe: string;
  tag: string;
  badgeText: string;
}
