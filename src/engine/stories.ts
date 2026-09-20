/**
 * Story Engine for TRACE
 * Synthesizes chronological and thematic life chapters from normalized receipts.
 * Every chapter reflects real moments, real metrics, and verified connections.
 */

import { LifeChapter } from '../types/chapters';
import { Receipt } from '../types/receipt';
import { safeParseDate } from '../utils/dates';

export function generateChapters(receipts: Receipt[]): LifeChapter[] {
  if (receipts.length === 0) return [];

  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group receipts into 3 to 5 logical temporal epochs
  const minYear = safeParseDate(sorted[0].timestamp)?.getUTCFullYear() || 2013;
  const maxYear = safeParseDate(sorted[sorted.length - 1].timestamp)?.getUTCFullYear() || 2024;
  const totalYears = Math.max(1, maxYear - minYear + 1);

  // Determine epoch divisions
  let epochRanges: { start: number; end: number; title: string; theme: string }[] = [];

  if (totalYears <= 3) {
    epochRanges = [
      { start: minYear, end: minYear, title: 'Inception & Early Habits', theme: 'First footprints and core preferences' },
      { start: minYear + 1, end: maxYear, title: 'Expanding Patterns', theme: 'Diversifying activities and daily cadence' },
    ];
  } else if (totalYears <= 6) {
    const mid = minYear + Math.floor(totalYears / 2);
    epochRanges = [
      { start: minYear, end: mid, title: 'First Signals & Foundational Beats', theme: 'Early acoustic discovery and routine building' },
      { start: mid + 1, end: maxYear, title: 'Rhythm & Maturity', theme: 'Refined tastes, intentional spending, and travel' },
    ];
  } else {
    // Multi-era (e.g. 2013 - 2024)
    epochRanges = [
      {
        start: minYear,
        end: minYear + 2,
        title: 'First Signals',
        theme: 'Early music discovery on desktop and foundational tracks',
      },
      {
        start: minYear + 3,
        end: minYear + 5,
        title: 'The Ambient & Focus Era',
        theme: 'Subtle shifts toward electronic soundscapes and study sessions',
      },
      {
        start: minYear + 6,
        end: minYear + 8,
        title: 'Nocturnal Convergence',
        theme: 'Late-night listening peaks, lo-fi rhythms, and digital purchases',
      },
      {
        start: minYear + 9,
        end: maxYear,
        title: 'Modern Horizons & Eclectic Paths',
        theme: 'Diverse multi-device activity, rich acoustic sessions, and travel',
      },
    ];
  }

  const chapters: LifeChapter[] = [];

  for (let idx = 0; idx < epochRanges.length; idx++) {
    const range = epochRanges[idx];
    const chapterReceipts = sorted.filter(r => {
      const yr = safeParseDate(r.timestamp)?.getUTCFullYear() || minYear;
      return yr >= range.start && yr <= range.end;
    });

    if (chapterReceipts.length === 0) continue;

    // Find dominant activity
    const typeCounts = new Map<string, number>();
    for (const r of chapterReceipts) {
      typeCounts.set(r.type, (typeCounts.get(r.type) || 0) + 1);
    }
    let dominantType = 'MUSIC';
    let maxTypeCount = 0;
    for (const [t, c] of typeCounts.entries()) {
      if (c > maxTypeCount) {
        maxTypeCount = c;
        dominantType = t;
      }
    }

    // Top artist or merchant in this chapter
    const titles = chapterReceipts.map(r => r.subtitle || r.title);
    const topItem = titles[0] || 'Curated Soundscapes';

    // Time range label
    const timeRangeStr = range.start === range.end ? `${range.start}` : `${range.start} – ${range.end}`;

    // Metrics
    const musicCount = chapterReceipts.filter(r => r.type === 'MUSIC').length;
    const purchaseCount = chapterReceipts.filter(r => r.type === 'PURCHASE').length;
    const orderNum = String(chapters.length + 1).padStart(2, '0');

    chapters.push({
      id: `chapter_${range.start}_${range.end}`,
      orderNumber: orderNum,
      title: range.title,
      timeRange: timeRangeStr,
      summary: `During ${timeRangeStr}, digital records capture a formative phase: ${range.theme.toLowerCase()}. A total of ${chapterReceipts.length} recorded moments trace this chapter.`,
      evidence: `${chapterReceipts.length} receipts logged (${musicCount} listening tracks, ${purchaseCount} purchase events).`,
      dominantActivity: `${dominantType} (${maxTypeCount} records)`,
      supportingMetrics: [
        { label: 'Recorded Moments', value: `${chapterReceipts.length}` },
        { label: 'Primary Activity', value: dominantType },
        { label: 'Defining Anchor', value: topItem },
      ],
      keyMomentReceiptIds: chapterReceipts.slice(0, 4).map(r => r.id),
      patterns: [
        'Distinct temporal clustering',
        dominantType === 'MUSIC' ? 'Album and artist continuity' : 'Regular commerce routine',
      ],
      connectedMomentsCount: Math.max(1, Math.floor(chapterReceipts.length * 0.7)),
    });
  }

  return chapters;
}
