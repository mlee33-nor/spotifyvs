import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyTrack, SpotifyPlaylist, SpotifyPaginatedResponse, SpotifyPlaylistTrack, Track } from '@/types/spotify';

/**
 * Spotify API Client wrapper with automatic token refresh
 */
export class SpotifyClient {
  private api: SpotifyWebApi;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    this.api.setAccessToken(accessToken);
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit: number = 50, offset: number = 0): Promise<SpotifyPlaylist[]> {
    try {
      const response = await this.api.getUserPlaylists({ limit, offset });
      return response.body.items as SpotifyPlaylist[];
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  }

  /**
   * Get tracks from a playlist
   */
  async getPlaylistTracks(playlistId: string, limit: number = 100): Promise<SpotifyTrack[]> {
    try {
      const tracks: SpotifyTrack[] = [];
      let offset = 0;

      while (true) {
        const response = await this.api.getPlaylistTracks(playlistId, { limit: 100, offset });
        const items = response.body.items as SpotifyPlaylistTrack[];

        tracks.push(...items.map(item => item.track).filter(Boolean));

        if (!response.body.next || tracks.length >= limit) break;
        offset += 100;
      }

      return tracks.slice(0, limit);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyTrack[]> {
    try {
      const response = await this.api.getMyTopTracks({ time_range: timeRange, limit });
      return response.body.items as SpotifyTrack[];
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      throw error;
    }
  }

  /**
   * Get user's top artists
   */
  async getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 50
  ) {
    try {
      const response = await this.api.getMyTopArtists({ time_range: timeRange, limit });
      return response.body.items;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      throw error;
    }
  }

  /**
   * Get user's saved (liked) tracks
   */
  async getSavedTracks(limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const tracks: SpotifyTrack[] = [];
      let offset = 0;

      while (tracks.length < limit) {
        const response = await this.api.getMySavedTracks({ limit: 50, offset });
        const items = response.body.items;

        tracks.push(...items.map(item => item.track));

        if (!response.body.next || items.length === 0) break;
        offset += 50;
      }

      return tracks.slice(0, limit);
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
      throw error;
    }
  }

  /**
   * Get tracks from an artist
   */
  async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<SpotifyTrack[]> {
    try {
      const response = await this.api.getArtistTopTracks(artistId, market);
      return response.body.tracks as SpotifyTrack[];
    } catch (error) {
      console.error('Error fetching artist top tracks:', error);
      throw error;
    }
  }

  /**
   * Get audio features for tracks (for filtering by danceability, energy, etc.)
   */
  async getAudioFeatures(trackIds: string[]) {
    try {
      const response = await this.api.getAudioFeaturesForTracks(trackIds);
      return response.body.audio_features;
    } catch (error) {
      console.error('Error fetching audio features:', error);
      throw error;
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const response = await this.api.searchTracks(query, { limit });
      return response.body.tracks?.items as SpotifyTrack[] || [];
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await this.api.getMe();
      return response.body;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(trackIds: string[]): Promise<SpotifyTrack[]> {
    try {
      const response = await this.api.getTracks(trackIds);
      return response.body.tracks as SpotifyTrack[];
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  }
}

/**
 * Transform Spotify track to internal Track format
 */
export function transformTrack(spotifyTrack: SpotifyTrack): Track {
  return {
    id: spotifyTrack.id,
    name: spotifyTrack.name,
    artistName: spotifyTrack.artists.map(a => a.name).join(', '),
    albumName: spotifyTrack.album.name,
    albumArt: spotifyTrack.album.images[0]?.url || '',
    previewUrl: spotifyTrack.preview_url,
    spotifyUrl: spotifyTrack.external_urls.spotify,
    duration: spotifyTrack.duration_ms,
    popularity: spotifyTrack.popularity,
  };
}

/**
 * Transform multiple Spotify tracks
 */
export function transformTracks(spotifyTracks: SpotifyTrack[]): Track[] {
  return spotifyTracks.map(transformTrack);
}

/**
 * Create a Spotify client instance with access token
 */
export function createSpotifyClient(accessToken: string): SpotifyClient {
  return new SpotifyClient(accessToken);
}
