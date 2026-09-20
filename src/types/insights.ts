/**
 * Insight and Signal types for "SIGNALS" & "WHAT DOES IT ALL MEAN?"
 */

export interface LifeInsight {
  id: string;
  type: 'SIGNAL' | 'SYNTHESIS' | 'CORRELATION';
  title: string;
  explanation: string;
  evidence: string;
  supportingMetric: {
    label: string;
    value: string;
    sublabel?: string;
  };
  relatedReceiptIds: string[];
  category: 'music' | 'finances' | 'lifestyle' | 'cross-domain';
}

export interface WhatDoesItMeanNarrative {
  headline: string;
  narrativeParagraphs: string[];
  keyDiscoveries: {
    title: string;
    description: string;
    evidenceStat: string;
  }[];
  concludingThought: string;
}
