import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/settings
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user preferences
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        theme: 'dark',
        defaultTierLabels: ['S', 'A', 'B', 'C', 'D', 'F'],
        autoPlayPreviews: true,
        crossfadeDuration: 3,
        preferences: {
          defaultVolume: 70,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update user preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      theme,
      defaultTierLabels,
      autoPlayPreviews,
      crossfadeDuration,
      preferences,
    } = body;

    // Check if preferences exist
    const [existingPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    let updatedPreferences;

    if (existingPreferences) {
      // Update existing preferences
      [updatedPreferences] = await db
        .update(userPreferences)
        .set({
          theme,
          defaultTierLabels,
          autoPlayPreviews,
          crossfadeDuration,
          preferences,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id))
        .returning();
    } else {
      // Create new preferences
      [updatedPreferences] = await db
        .insert(userPreferences)
        .values({
          userId: session.user.id,
          theme,
          defaultTierLabels,
          autoPlayPreviews,
          crossfadeDuration,
          preferences,
        })
        .returning();
    }

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
