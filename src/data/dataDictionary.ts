/**
 * Spotify Data Dictionary conforming to spotify_data_dictionary.csv
 */

export interface DataDictionaryField {
  field: string;
  description: string;
  dataType: string;
  usageNotes: string;
}

export const SPOTIFY_DATA_DICTIONARY: Record<string, DataDictionaryField> = {
  spotify_track_uri: {
    field: 'spotify_track_uri',
    description: 'Spotify URI that uniquely identifies each track in the form of "spotify:track:<base-62 string>"',
    dataType: 'string',
    usageNotes: 'Used for unique track deduplication and track identity verification.',
  },
  ts: {
    field: 'ts',
    description: 'Timestamp indicating when the track stopped playing in UTC (Coordinated Universal Time)',
    dataType: 'ISO 8601 string',
    usageNotes: 'Parsed as UTC timestamp for chronological timeline, hourly patterns, and session clustering.',
  },
  platform: {
    field: 'platform',
    description: 'Platform used when streaming the track',
    dataType: 'string',
    usageNotes: 'e.g., Android, iOS, OS X, Windows, Web Player, Cast to device.',
  },
  ms_played: {
    field: 'ms_played',
    description: 'Number of milliseconds the stream was played',
    dataType: 'integer',
    usageNotes: 'Converted to minutes and hours for listening duration and engagement depth.',
  },
  track_name: {
    field: 'track_name',
    description: 'Name of the track',
    dataType: 'string',
    usageNotes: 'Primary title for MUSIC receipts.',
  },
  artist_name: {
    field: 'artist_name',
    description: 'Name of the artist',
    dataType: 'string',
    usageNotes: 'Subtitle and clustering dimension for music listening habits.',
  },
  album_name: {
    field: 'album_name',
    description: 'Album name',
    dataType: 'string',
    usageNotes: 'Metadata for album continuity analysis.',
  },
  reason_start: {
    field: 'reason_start',
    description: 'Why the track started',
    dataType: 'string',
    usageNotes: 'e.g., trackdone, clickrow, fwdbtn, backbtn, playbtn.',
  },
  reason_end: {
    field: 'reason_end',
    description: 'Why the track ended',
    dataType: 'string',
    usageNotes: 'e.g., trackdone, fwdbtn, backbtn, endplay, unexpected-exit.',
  },
  shuffle: {
    field: 'shuffle',
    description: 'TRUE or FALSE depending on if shuffle mode was used when playing the track',
    dataType: 'boolean',
    usageNotes: 'Indicates intentional album listening vs randomized discovery.',
  },
  skipped: {
    field: 'skipped',
    description: 'TRUE or FALSE depending on if the user skipped to the next song',
    dataType: 'boolean',
    usageNotes: 'Calculates skip rate and restless vs deep-focus listening patterns.',
  },
};
