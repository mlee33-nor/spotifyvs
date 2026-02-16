'use client';

import { useQuery } from '@tanstack/react-query';
import { type Track } from '@/types/spotify';

interface PlaylistsResponse {
  playlists: any[];
}

interface TracksResponse {
  tracks: Track[];
}

interface ArtistsResponse {
  artists: any[];
}

// Get user's playlists
export function useUserPlaylists() {
  return useQuery({
    queryKey: ['spotify', 'playlists'],
    queryFn: async () => {
      const res = await fetch('/api/spotify/playlists');
      if (!res.ok) throw new Error('Failed to fetch playlists');
      const data: PlaylistsResponse = await res.json();
      return data.playlists;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get tracks from a playlist
export function usePlaylistTracks(playlistId: string | null, limit: number = 100) {
  return useQuery({
    queryKey: ['spotify', 'playlist', playlistId, limit],
    queryFn: async () => {
      if (!playlistId) return [];
      const res = await fetch(`/api/spotify/playlist/${playlistId}?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch playlist tracks');
      const data: TracksResponse = await res.json();
      return data.tracks;
    },
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000,
  });
}

// Get user's top tracks
export function useTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 50
) {
  return useQuery({
    queryKey: ['spotify', 'top-tracks', timeRange, limit],
    queryFn: async () => {
      const res = await fetch(`/api/spotify/top-tracks?timeRange=${timeRange}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch top tracks');
      const data: TracksResponse = await res.json();
      return data.tracks;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get user's saved tracks
export function useSavedTracks(limit: number = 50) {
  return useQuery({
    queryKey: ['spotify', 'saved-tracks', limit],
    queryFn: async () => {
      const res = await fetch(`/api/spotify/saved-tracks?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch saved tracks');
      const data: TracksResponse = await res.json();
      return data.tracks;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get artist's top tracks
export function useArtistTracks(artistId: string | null) {
  return useQuery({
    queryKey: ['spotify', 'artist', artistId],
    queryFn: async () => {
      if (!artistId) return [];
      const res = await fetch(`/api/spotify/artist/${artistId}`);
      if (!res.ok) throw new Error('Failed to fetch artist tracks');
      const data: TracksResponse = await res.json();
      return data.tracks;
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
}

// Search for artists
export function useSearchArtists(query: string) {
  return useQuery({
    queryKey: ['spotify', 'search', 'artists', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=artist`);
      if (!res.ok) throw new Error('Failed to search artists');
      const data: ArtistsResponse = await res.json();
      return data.artists;
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

// Search for tracks
export function useSearchTracks(query: string, limit: number = 20) {
  return useQuery({
    queryKey: ['spotify', 'search', 'tracks', query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to search tracks');
      const data: TracksResponse = await res.json();
      return data.tracks;
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
