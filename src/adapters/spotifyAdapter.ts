/**
 * Spotify Listening History Adapter
 * Strictly adheres to spotify_data_dictionary.csv definitions.
 * Normalizes raw records into Receipts of type 'MUSIC'.
 */

import { Receipt } from '../types/receipt';
import { SpotifyListeningStats, SpotifyRawRecord, SpotifyYearData } from '../types/spotify';
import { safeParseDate } from '../utils/dates';
import { safeNumber } from '../utils/numbers';
import { createStableReceiptId } from '../utils/sanitize';

export function normalizeSpotifyData(
  records: (SpotifyRawRecord | Record<string, unknown>)[],
  sourceName = 'spotify_history.csv'
): { receipts: Receipt[]; stats: SpotifyListeningStats; yearsData: Map<number, SpotifyYearData>; malformedCount: number } {
  const receipts: Receipt[] = [];
  let malformedCount = 0;

  let totalMsPlayed = 0;
  const artistCounts = new Map<string, { count: number; ms: number }>();
  const trackCounts = new Map<string, { artist: string; count: number; ms: number }>();
  const albumSet = new Set<string>();
  const platformCounts = new Map<string, number>();
  const hourlyCounts = new Array(24).fill(0);
  const dayOfWeekCounts = new Map<string, number>();

  let skipCount = 0;
  let shuffleCount = 0;
  const yearBuckets = new Map<number, {
    records: number;
    ms: number;
    artists: Map<string, number>;
    tracks: Map<string, { artist: string; count: number }>;
    skips: number;
    shuffles: number;
    hours: number[];
    platforms: Map<string, number>;
  }>();

  for (let i = 0; i < records.length; i++) {
    const raw = records[i] as Record<string, any>;
    const trackName = String(raw.track_name || raw.trackName || '').trim();
    const artistName = String(raw.artist_name || raw.artistName || '').trim();
    const tsStr = String(raw.ts || raw.timestamp || raw.Date || '').trim();

    if (!tsStr || (!trackName && !artistName)) {
      malformedCount++;
      continue;
    }

    const parsedDate = safeParseDate(tsStr);
    if (!parsedDate) {
      malformedCount++;
      continue;
    }

    const isoTimestamp = parsedDate.toISOString();
    const msPlayed = safeNumber(raw.ms_played || raw.msPlayed, 180000);
    const platform = String(raw.platform || 'Unknown Device').trim();
    const albumName = String(raw.album_name || raw.albumName || '').trim();
    const reasonStart = String(raw.reason_start || '').trim();
    const reasonEnd = String(raw.reason_end || '').trim();
    const isShuffle = raw.shuffle === true || raw.shuffle === 'TRUE' || raw.shuffle === 'true' || raw.shuffle === '1';
    const isSkipped = raw.skipped === true || raw.skipped === 'TRUE' || raw.skipped === 'true' || raw.skipped === '1';

    const safeTitle = trackName || 'Unknown Track';
    const safeSubtitle = artistName || 'Unknown Artist';

    const stableId = createStableReceiptId('sp', `${tsStr}_${trackName}_${artistName}_${i}`);

    const receipt: Receipt = {
      id: stableId,
      type: 'MUSIC',
      timestamp: isoTimestamp,
      title: safeTitle,
      subtitle: safeSubtitle,
      description: albumName ? `Album: ${albumName}` : undefined,
      source: sourceName,
      tags: ['Music', 'Listening', platform],
      metadata: {
        ms_played: msPlayed,
        duration_minutes: +(msPlayed / 60000).toFixed(1),
        platform,
        album_name: albumName,
        reason_start: reasonStart || undefined,
        reason_end: reasonEnd || undefined,
        shuffle: isShuffle,
        skipped: isSkipped,
        spotify_track_uri: raw.spotify_track_uri ? String(raw.spotify_track_uri).trim() : undefined,
      },
    };

    receipts.push(receipt);

    // Aggregate statistics
    totalMsPlayed += msPlayed;
    if (isSkipped) skipCount++;
    if (isShuffle) shuffleCount++;

    // Platform
    platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);

    // Hour and day
    const hour = parsedDate.getUTCHours();
    hourlyCounts[hour]++;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[parsedDate.getUTCDay()];
    dayOfWeekCounts.set(dayName, (dayOfWeekCounts.get(dayName) || 0) + 1);

    // Artists
    if (artistName) {
      const existing = artistCounts.get(artistName) || { count: 0, ms: 0 };
      existing.count++;
      existing.ms += msPlayed;
      artistCounts.set(artistName, existing);
    }

    // Tracks
    if (trackName) {
      const key = `${trackName}:::${artistName}`;
      const existing = trackCounts.get(key) || { artist: artistName, count: 0, ms: 0 };
      existing.count++;
      existing.ms += msPlayed;
      trackCounts.set(key, existing);
    }

    // Albums
    if (albumName) {
      albumSet.add(albumName);
    }

    // Year bucket
    const year = parsedDate.getUTCFullYear();
    if (!yearBuckets.has(year)) {
      yearBuckets.set(year, {
        records: 0,
        ms: 0,
        artists: new Map(),
        tracks: new Map(),
        skips: 0,
        shuffles: 0,
        hours: new Array(24).fill(0),
        platforms: new Map(),
      });
    }
    const yb = yearBuckets.get(year)!;
    yb.records++;
    yb.ms += msPlayed;
    if (isSkipped) yb.skips++;
    if (isShuffle) yb.shuffles++;
    yb.hours[hour]++;
    yb.platforms.set(platform, (yb.platforms.get(platform) || 0) + 1);
    if (artistName) yb.artists.set(artistName, (yb.artists.get(artistName) || 0) + 1);
    if (trackName) {
      const existingT = yb.tracks.get(trackName) || { artist: artistName, count: 0 };
      existingT.count++;
      yb.tracks.set(trackName, existingT);
    }
  }

  // Calculate top artist
  let mostPlayedArtist = { name: '—', count: 0, hours: 0 };
  const sortedArtists = Array.from(artistCounts.entries())
    .map(([name, data]) => ({ name, count: data.count, hours: +(data.ms / 3600000).toFixed(1) }))
    .sort((a, b) => b.count - a.count);
  if (sortedArtists.length > 0) {
    mostPlayedArtist = sortedArtists[0];
  }

  // Calculate top track
  let mostPlayedTrack = { title: '—', artist: '—', count: 0, hours: 0 };
  const sortedTracks = Array.from(trackCounts.entries())
    .map(([key, data]) => {
      const [title] = key.split(':::');
      return { title, artist: data.artist, count: data.count, hours: +(data.ms / 3600000).toFixed(1) };
    })
    .sort((a, b) => b.count - a.count);
  if (sortedTracks.length > 0) {
    mostPlayedTrack = sortedTracks[0];
  }

  // Peak hour
  let mostActiveHour = 0;
  let maxHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourlyCounts[h] > maxHourCount) {
      maxHourCount = hourlyCounts[h];
      mostActiveHour = h;
    }
  }

  // Peak day
  let mostActiveDay = '—';
  let maxDayCount = 0;
  for (const [day, count] of dayOfWeekCounts.entries()) {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostActiveDay = day;
    }
  }

  // Platforms
  const totalPlatformsCount = receipts.length || 1;
  const platformBreakdown = Array.from(platformCounts.entries())
    .map(([platform, count]) => ({
      platform,
      count,
      percentage: Math.round((count / totalPlatformsCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const totalHours = +(totalMsPlayed / 3600000).toFixed(1);
  const totalMinutes = Math.round(totalMsPlayed / 60000);
  const overallSkipRate = receipts.length > 0 ? Math.round((skipCount / receipts.length) * 100) : 0;
  const overallShuffleRate = receipts.length > 0 ? Math.round((shuffleCount / receipts.length) * 100) : 0;
  const yearsDetected = Array.from(yearBuckets.keys()).sort((a, b) => a - b);

  // Generate Year Stats
  const yearsData = new Map<number, SpotifyYearData>();
  for (const [year, yb] of yearBuckets.entries()) {
    const topYearArtists = Array.from(yb.artists.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topYearTracks = Array.from(yb.tracks.entries())
      .map(([title, data]) => ({ title, artist: data.artist, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    let peakH = 0;
    let maxH = 0;
    for (let h = 0; h < 24; h++) {
      if (yb.hours[h] > maxH) {
        maxH = yb.hours[h];
        peakH = h;
      }
    }

    let primaryPlatform = '—';
    let maxPlat = 0;
    for (const [p, c] of yb.platforms.entries()) {
      if (c > maxPlat) {
        maxPlat = c;
        primaryPlatform = p;
      }
    }

    yearsData.set(year, {
      year,
      totalRecords: yb.records,
      totalHours: +(yb.ms / 3600000).toFixed(1),
      topArtists: topYearArtists,
      topTracks: topYearTracks,
      skipRate: yb.records > 0 ? Math.round((yb.skips / yb.records) * 100) : 0,
      shuffleRate: yb.records > 0 ? Math.round((yb.shuffles / yb.records) * 100) : 0,
      peakHour: peakH,
      primaryPlatform,
    });
  }

  const stats: SpotifyListeningStats = {
    totalRecords: receipts.length,
    totalMsPlayed,
    totalHours,
    totalMinutes,
    uniqueArtists: artistCounts.size,
    uniqueTracks: trackCounts.size,
    uniqueAlbums: albumSet.size,
    mostPlayedArtist,
    mostPlayedTrack,
    mostActiveHour,
    mostActiveDay,
    overallSkipRate,
    overallShuffleRate,
    yearsDetected,
    topArtists: sortedArtists.slice(0, 10),
    topTracks: sortedTracks.slice(0, 10),
    platformBreakdown,
    hourlyDistribution: hourlyCounts,
  };

  return { receipts, stats, yearsData, malformedCount };
}
