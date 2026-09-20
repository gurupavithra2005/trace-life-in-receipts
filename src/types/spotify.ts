/**
 * Spotify history data schemas and definitions conforming to spotify_data_dictionary.csv
 */

export interface SpotifyRawRecord {
  spotify_track_uri?: string;
  ts?: string;
  platform?: string;
  ms_played?: number | string;
  track_name?: string;
  artist_name?: string;
  album_name?: string;
  reason_start?: string;
  reason_end?: string;
  shuffle?: boolean | string;
  skipped?: boolean | string;
}

export interface SpotifyListeningStats {
  totalRecords: number;
  totalMsPlayed: number;
  totalHours: number;
  totalMinutes: number;
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  mostPlayedArtist: { name: string; count: number; hours: number };
  mostPlayedTrack: { title: string; artist: string; count: number; hours: number };
  mostActiveHour: number; // 0 - 23
  mostActiveDay: string;
  overallSkipRate: number; // 0 - 100 percentage
  overallShuffleRate: number; // 0 - 100 percentage
  yearsDetected: number[];
  topArtists: { name: string; count: number; hours: number }[];
  topTracks: { title: string; artist: string; count: number }[];
  platformBreakdown: { platform: string; count: number; percentage: number }[];
  hourlyDistribution: number[]; // 24 values
}

export interface SpotifyYearData {
  year: number;
  totalRecords: number;
  totalHours: number;
  topArtists: { name: string; count: number }[];
  topTracks: { title: string; artist: string; count: number }[];
  skipRate: number;
  shuffleRate: number;
  peakHour: number;
  primaryPlatform: string;
}
