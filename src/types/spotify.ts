/**
 * Spotify data type definitions
 */

export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  uri: string;
  artists: SpotifyArtist[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href: string;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  track_number: number;
  popularity: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
  audio_features?: {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    href: string;
  };
  public: boolean;
  collaborative: boolean;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  country: string;
  product: 'premium' | 'free' | 'open';
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

/**
 * Internal app types
 */

export interface Track {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  albumArt: string;
  previewUrl: string | null;
  spotifyUrl: string;
  duration: number;
  popularity: number;
}

export interface TierData {
  label: string;
  tracks: Track[];
  color: string; // Tailwind color class or CSS variable
}

export interface TierListSource {
  type: 'playlist' | 'top_tracks' | 'saved_tracks' | 'artist';
  id?: string;
  name?: string;
  timeRange?: 'short_term' | 'medium_term' | 'long_term'; // For top tracks
}

export interface BattleMatchup {
  id: string;
  track1: Track;
  track2: Track;
  winner?: string; // track ID
}

export interface BattleRound {
  roundNumber: number;
  matchups: BattleMatchup[];
}

export interface BattleState {
  rounds: BattleRound[];
  currentRound: number;
  currentMatchup: number;
  isComplete: boolean;
  winner?: Track;
}
