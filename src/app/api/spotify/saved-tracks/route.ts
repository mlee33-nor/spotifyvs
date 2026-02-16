import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { createSpotifyClient, transformTracks } from '@/lib/spotify/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const spotify = createSpotifyClient(session.accessToken);
    const spotifyTracks = await spotify.getSavedTracks(limit);
    const tracks = transformTracks(spotifyTracks);

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error fetching saved tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch saved tracks' }, { status: 500 });
  }
}
