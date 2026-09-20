/**
 * High-performance indexing and aggregation helpers.
 * Prevents O(n²) bottlenecks over large datasets.
 */

import { Receipt, ReceiptType } from '../types/receipt';
import { safeParseDate } from './dates';

export interface IndexedReceiptStore {
  byType: Map<ReceiptType, Receipt[]>;
  byYear: Map<number, Receipt[]>;
  byDate: Map<string, Receipt[]>; // YYYY-MM-DD
  byHour: Map<number, Receipt[]>; // 0 - 23
  byCategory: Map<string, Receipt[]>;
  sortedByTimestamp: Receipt[];
}

export function buildReceiptIndex(receipts: Receipt[]): IndexedReceiptStore {
  const byType = new Map<ReceiptType, Receipt[]>();
  const byYear = new Map<number, Receipt[]>();
  const byDate = new Map<string, Receipt[]>();
  const byHour = new Map<number, Receipt[]>();
  const byCategory = new Map<string, Receipt[]>();

  // Sort receipts chronologically
  const sortedByTimestamp = [...receipts].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  for (const r of sortedByTimestamp) {
    // Type index
    if (!byType.has(r.type)) byType.set(r.type, []);
    byType.get(r.type)!.push(r);

    const d = safeParseDate(r.timestamp);
    if (d) {
      const year = d.getUTCFullYear();
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push(r);

      const dateKey = d.toISOString().slice(0, 10);
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey)!.push(r);

      const hour = d.getUTCHours();
      if (!byHour.has(hour)) byHour.set(hour, []);
      byHour.get(hour)!.push(r);
    }

    // Category index
    const cat = (r.metadata?.category as string) || (r.tags && r.tags[0]) || 'General';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(r);
  }

  return {
    byType,
    byYear,
    byDate,
    byHour,
    byCategory,
    sortedByTimestamp,
  };
}

export function getOverviewMetrics(receipts: Receipt[], index: IndexedReceiptStore) {
  const totalReceipts = receipts.length;
  const years = Array.from(index.byYear.keys()).sort((a, b) => a - b);
  const activeYears = years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : '—';

  // Top activity type
  let topType: ReceiptType = 'MUSIC';
  let maxTypeCount = 0;
  for (const [type, list] of index.byType.entries()) {
    if (list.length > maxTypeCount) {
      maxTypeCount = list.length;
      topType = type;
    }
  }

  // Find most active month/period
  const monthCounts = new Map<string, number>();
  for (const r of receipts) {
    const mKey = r.timestamp.slice(0, 7);
    monthCounts.set(mKey, (monthCounts.get(mKey) || 0) + 1);
  }

  let mostActivePeriod = '—';
  let maxMonthCount = 0;
  for (const [mKey, count] of monthCounts.entries()) {
    if (count > maxMonthCount) {
      maxMonthCount = count;
      mostActivePeriod = mKey;
    }
  }

  // Top music artist & track
  let topArtist = '—';
  let topTrack = '—';
  let totalListeningMs = 0;
  const artistCounts = new Map<string, number>();
  const trackCounts = new Map<string, number>();

  const musicReceipts = index.byType.get('MUSIC') || [];
  for (const m of musicReceipts) {
    const artist = m.subtitle || (m.metadata?.artist_name as string);
    if (artist) {
      artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
    }
    const track = m.title;
    if (track) {
      trackCounts.set(track, (trackCounts.get(track) || 0) + 1);
    }
    if (typeof m.metadata?.ms_played === 'number') {
      totalListeningMs += m.metadata.ms_played;
    }
  }

  let maxArtistCount = 0;
  for (const [art, count] of artistCounts.entries()) {
    if (count > maxArtistCount) {
      maxArtistCount = count;
      topArtist = art;
    }
  }

  let maxTrackCount = 0;
  for (const [trk, count] of trackCounts.entries()) {
    if (count > maxTrackCount) {
      maxTrackCount = count;
      topTrack = trk;
    }
  }

  // Top purchase category
  let topCategory = '—';
  let maxCatCount = 0;
  const purchases = index.byType.get('PURCHASE') || [];
  const catCounts = new Map<string, number>();
  for (const p of purchases) {
    const cat = (p.metadata?.category as string) || (p.tags && p.tags[0]) || 'General';
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }
  for (const [cat, count] of catCounts.entries()) {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  }

  const listeningHours = Math.round(totalListeningMs / (1000 * 60 * 60));

  return {
    totalReceipts,
    activeYears,
    yearsList: years,
    mostActivePeriod,
    topActivityType: topType,
    topMusicArtist: topArtist,
    topMusicTrack: topTrack,
    topPurchaseCategory: topCategory,
    listeningHours,
  };
}
