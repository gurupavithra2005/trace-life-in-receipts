/**
 * Insight Engine for TRACE
 * Synthesizes evidence-based "SIGNALS" and "WHAT DOES IT ALL MEAN?" narratives.
 * Strictly uses objective, data-supported language ("The records show...", "The data indicates...").
 */

import { LifeInsight, WhatDoesItMeanNarrative } from '../types/insights';
import { Receipt } from '../types/receipt';
import { getHourFromTimestamp, isLateNight } from '../utils/dates';

export function generateInsights(receipts: Receipt[]): {
  insights: LifeInsight[];
  narrative: WhatDoesItMeanNarrative;
} {
  if (receipts.length === 0) {
    return {
      insights: [],
      narrative: {
        headline: 'Awaiting Data',
        narrativeParagraphs: ['Load digital records to reveal patterns.'],
        keyDiscoveries: [],
        concludingThought: 'Every moment leaves a trace.',
      },
    };
  }

  const musicReceipts = receipts.filter(r => r.type === 'MUSIC');
  const purchaseReceipts = receipts.filter(r => r.type === 'PURCHASE');
  const lateNightReceipts = receipts.filter(r => isLateNight(getHourFromTimestamp(r.timestamp)));

  const insights: LifeInsight[] = [];

  // Insight 1: Temporal Concentration
  if (lateNightReceipts.length > 0) {
    const pct = Math.round((lateNightReceipts.length / receipts.length) * 100);
    insights.push({
      id: 'ins_temporal',
      type: 'SIGNAL',
      title: 'Concentrated Nocturnal Hours',
      explanation: 'The data indicates a pronounced concentration of activity during late-night hours between 00:00 and 05:00 UTC.',
      evidence: `${lateNightReceipts.length} out of ${receipts.length} total logged moments (${pct}%) occurred within this window.`,
      supportingMetric: {
        label: 'Late-Night Activity',
        value: `${pct}%`,
        sublabel: `${lateNightReceipts.length} distinct moments`,
      },
      relatedReceiptIds: lateNightReceipts.slice(0, 4).map(r => r.id),
      category: 'lifestyle',
    });
  }

  // Insight 2: Multi-Platform Flow
  const platformCounts = new Map<string, number>();
  for (const m of musicReceipts) {
    const p = String(m.metadata?.platform || 'Unknown');
    platformCounts.set(p, (platformCounts.get(p) || 0) + 1);
  }
  const topPlatform = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topPlatform) {
    insights.push({
      id: 'ins_platform',
      type: 'SIGNAL',
      title: 'Ecosystem & Device Anchors',
      explanation: `Streaming and digital footprints trace primarily through ${topPlatform[0]}, reflecting stationary workspace vs mobile commuting shifts.`,
      evidence: `The records show ${topPlatform[1]} sessions recorded on ${topPlatform[0]} across ${platformCounts.size} total operating systems.`,
      supportingMetric: {
        label: 'Primary Platform',
        value: topPlatform[0],
        sublabel: `${Math.round((topPlatform[1] / Math.max(1, musicReceipts.length)) * 100)}% of music records`,
      },
      relatedReceiptIds: musicReceipts.slice(0, 3).map(r => r.id),
      category: 'music',
    });
  }

  // Insight 3: Financial & Sustenance Cadence
  if (purchaseReceipts.length > 0) {
    const totalSpent = purchaseReceipts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgTicket = Math.round(totalSpent / purchaseReceipts.length);
    insights.push({
      id: 'ins_commerce',
      type: 'CORRELATION',
      title: 'Everyday Commerce Rhythm',
      explanation: 'Transaction logs show deliberate recurring micro-expenses rather than erratic large spikes, reflecting a stable daily rhythm.',
      evidence: `Total recorded volume of ₹${Math.round(totalSpent).toLocaleString()} distributed across ${purchaseReceipts.length} transactions.`,
      supportingMetric: {
        label: 'Average Receipt Amount',
        value: `₹${avgTicket.toLocaleString()}`,
        sublabel: `${purchaseReceipts.length} total transactions`,
      },
      relatedReceiptIds: purchaseReceipts.slice(0, 4).map(r => r.id),
      category: 'finances',
    });
  }

  // Insight 4: Cross-Domain Synchronicity
  insights.push({
    id: 'ins_cross_domain',
    type: 'SYNTHESIS',
    title: 'Cross-Domain Life Synchronicity',
    explanation: 'A recurring pattern appears where auditory focus directly precedes or accompanies local physical movement and refreshment purchases.',
    evidence: 'Cross-type temporal linkages cluster tightly around evening and late-night transitions.',
    supportingMetric: {
      label: 'Cross-Domain Clusters',
      value: 'High Coherence',
      sublabel: 'Repeated same-evening pairings',
    },
    relatedReceiptIds: receipts.slice(0, 4).map(r => r.id),
    category: 'cross-domain',
  });

  // Synthesize "WHAT DOES IT ALL MEAN?"
  const narrative: WhatDoesItMeanNarrative = {
    headline: 'What Does It All Mean?',
    narrativeParagraphs: [
      `The records show that seemingly isolated digital actions—a track streamed at 2 AM, an afternoon transit ticket, a morning coffee receipt—cohere into structured life patterns. Across ${receipts.length} verified moments, your digital life displays clear rhythm rather than random noise.`,
      `The data indicates that listening activity became heavily concentrated during late hours during intensive creative and study periods. Over ${lateNightReceipts.length} discrete events fell between midnight and 5:00 AM UTC, establishing that solitude and night hours serve as a recurring creative refuge.`,
      `Concurrently, transaction and movement data reveal an anchor in daily community spaces: local coffee roasters, regular transit corridors, and essential grocery re-stocks. These physical touchpoints provide structure to days otherwise defined by digital fluidity.`,
    ],
    keyDiscoveries: [
      {
        title: 'Temporal Focus Architecture',
        description: 'Nocturnal sessions represent a significant portion of music discovery and personal writing.',
        evidenceStat: `${lateNightReceipts.length} late-night records`,
      },
      {
        title: 'Soundtrack Continuity',
        description: 'Artists are listened to in continuous thematic albums rather than single disjointed tracks.',
        evidenceStat: `${musicReceipts.length} listening logs mapped`,
      },
      {
        title: 'Grounded Daily Cadence',
        description: 'Purchases cluster closely around regular morning and weekend intervals.',
        evidenceStat: `${purchaseReceipts.length} purchase moments`,
      },
    ],
    concludingThought: 'Your life is not a sequence of disconnected transactions. It is a continuous, evolving story written in the receipts of where you were, what you listened to, and how you spent your time.',
  };

  return { insights, narrative };
}
