import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sharedContent } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * POST /api/share
 * Create a shareable link for tier list or battle
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, contentId } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'Missing required fields: contentType, contentId' },
        { status: 400 }
      );
    }

    if (!['tier_list', 'battle'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid contentType. Must be tier_list or battle' },
        { status: 400 }
      );
    }

    // Check if share link already exists
    const [existingShare] = await db
      .select()
      .from(sharedContent)
      .where(
        and(
          eq(sharedContent.contentId, contentId),
          eq(sharedContent.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingShare) {
      // Return existing share link
      return NextResponse.json({
        shareId: existingShare.shareId,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${existingShare.shareId}`,
      });
    }

    // Create new share link
    const shareId = nanoid(12); // Short, URL-friendly ID

    const [share] = await db
      .insert(sharedContent)
      .values({
        shareId,
        contentType,
        contentId,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({
      shareId: share.shareId,
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${share.shareId}`,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
