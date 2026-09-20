/**
 * TRACE Analytics Service
 * Statistical summarization, Shannon entropy diversity index,
 * temporal distributions, and source breakdowns computed strictly client-side.
 */

import { Receipt } from '../types/receipt';

export interface DatasetSummary {
  totalReceipts: number;
  timespanDays: number;
  earliestDate: string;
  latestDate: string;
  diversityIndex: number;
  sourceBreakdown: { source: string; count: number; percentage: number }[];
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  hourlyActivity: number[]; // 24-hr array
  dayOfWeekActivity: number[]; // 7-day array (0 = Sun, 6 = Sat)
}

export class AnalyticsService {
  /**
   * Computes an analytical overview of receipts without backend reliance.
   */
  public static computeSummary(receipts: Receipt[]): DatasetSummary {
    if (receipts.length === 0) {
      return {
        totalReceipts: 0,
        timespanDays: 0,
        earliestDate: 'N/A',
        latestDate: 'N/A',
        diversityIndex: 0,
        sourceBreakdown: [],
        categoryBreakdown: [],
        hourlyActivity: new Array(24).fill(0),
        dayOfWeekActivity: new Array(7).fill(0),
      };
    }

    const hourly = new Array(24).fill(0);
    const dayOfWeek = new Array(7).fill(0);
    const sourceMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();

    const timestamps: number[] = [];

    for (const r of receipts) {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        timestamps.push(d.getTime());
        hourly[d.getUTCHours()]++;
        dayOfWeek[d.getUTCDay()]++;
      }

      // Source breakdown
      const src = r.source || 'Unknown';
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);

      // Category breakdown
      const cat = (r.metadata?.category as string) || (r.tags && r.tags[0]) || r.type || 'General';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }

    const total = receipts.length;

    // Shannon Diversity Index: H = -sum(p_i * ln(p_i))
    let diversityIndex = 0;
    categoryMap.forEach(count => {
      const p = count / total;
      if (p > 0) {
        diversityIndex -= p * Math.log(p);
      }
    });

    const minTime = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    const timespanDays = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)));

    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalReceipts: total,
      timespanDays,
      earliestDate: minTime ? new Date(minTime).toISOString().slice(0, 10) : 'N/A',
      latestDate: maxTime ? new Date(maxTime).toISOString().slice(0, 10) : 'N/A',
      diversityIndex: Math.round(diversityIndex * 100) / 100,
      sourceBreakdown,
      categoryBreakdown,
      hourlyActivity: hourly,
      dayOfWeekActivity: dayOfWeek,
    };
  }
}
