import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { createSpotifyClient } from '@/lib/spotify/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'artist'; // 'artist' or 'track'
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const spotify = createSpotifyClient(session.accessToken);

    if (type === 'artist') {
      // Search for artists
      const api = (spotify as any).api;
      const response = await api.searchArtists(query, { limit });
      const artists = response.body.artists?.items || [];
      return NextResponse.json({ artists });
    } else {
      // Search for tracks
      const tracks = await spotify.searchTracks(query, limit);
      return NextResponse.json({ tracks });
    }
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
