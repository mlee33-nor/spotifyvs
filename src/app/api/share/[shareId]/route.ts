import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sharedContent, tierLists, battles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * GET /api/share/[shareId]
 * Get shared content by share ID (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    // Find shared content
    const [share] = await db
      .select()
      .from(sharedContent)
      .where(eq(sharedContent.shareId, shareId))
      .limit(1);

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Increment view count
    await db
      .update(sharedContent)
      .set({
        viewCount: sql`${sharedContent.viewCount} + 1`,
      })
      .where(eq(sharedContent.shareId, shareId));

    // Fetch the actual content based on type
    let content;

    if (share.contentType === 'tier_list') {
      const [tierList] = await db
        .select()
        .from(tierLists)
        .where(eq(tierLists.id, share.contentId))
        .limit(1);

      if (!tierList) {
        return NextResponse.json({ error: 'Tier list not found' }, { status: 404 });
      }

      content = tierList;
    } else if (share.contentType === 'battle') {
      const [battle] = await db
        .select()
        .from(battles)
        .where(eq(battles.id, share.contentId))
        .limit(1);

      if (!battle) {
        return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
      }

      content = battle;
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json({
      contentType: share.contentType,
      content,
      viewCount: (share.viewCount || 0) + 1, // Return incremented count
    });
  } catch (error) {
    console.error('Error fetching shared content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared content' },
      { status: 500 }
    );
  }
}
