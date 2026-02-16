import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { db } from '@/lib/db';
import { tierLists } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'public' | 'private'

    let conditions = [eq(tierLists.userId, session.user.id)];

    if (filter === 'public') {
      conditions.push(eq(tierLists.isPublic, true));
    } else if (filter === 'private') {
      conditions.push(eq(tierLists.isPublic, false));
    }

    const userTierLists = await db
      .select()
      .from(tierLists)
      .where(and(...conditions))
      .orderBy(desc(tierLists.createdAt));

    return NextResponse.json({ tierLists: userTierLists });
  } catch (error) {
    console.error('Error fetching tier lists:', error);
    return NextResponse.json({ error: 'Failed to fetch tier lists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, tiers, tierLabels, sourceMetadata, isPublic } = body;

    if (!title || !tiers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate thumbnail from first 3 tracks
    let thumbnailUrl = '';
    const allTracks = Object.values(tiers).flat();
    if (allTracks.length > 0) {
      const firstTrack = allTracks[0] as any;
      thumbnailUrl = firstTrack.albumArt || '';
    }

    // Insert tier list
    const [newTierList] = await db
      .insert(tierLists)
      .values({
        userId: session.user.id,
        title,
        description: description || null,
        tiers,
        sourceMetadata: sourceMetadata || null,
        thumbnailUrl,
        isPublic: isPublic || false,
        viewCount: 0,
      })
      .returning();

    // Create share link if public
    let shareId = null;
    if (isPublic && newTierList.id) {
      shareId = nanoid(10);
      // We'll create shared_content entry when we implement the sharing API
    }

    return NextResponse.json({
      id: newTierList.id,
      shareId,
      message: 'Tier list created successfully',
    });
  } catch (error) {
    console.error('Error creating tier list:', error);
    return NextResponse.json({ error: 'Failed to create tier list' }, { status: 500 });
  }
}
