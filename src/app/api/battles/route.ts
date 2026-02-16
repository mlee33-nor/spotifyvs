import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { battles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * POST /api/battles
 * Create a new battle
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, format, participants, state } = body;

    // Validate required fields
    if (!title || !format || !participants || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: title, format, participants, state' },
        { status: 400 }
      );
    }

    // Validate format
    if (![4, 8, 16, 32, 64].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be 4, 8, 16, 32, or 64' },
        { status: 400 }
      );
    }

    // Validate participants length matches format
    if (participants.length !== format) {
      return NextResponse.json(
        { error: `Participants length must match format (${format})` },
        { status: 400 }
      );
    }

    // Create battle in database
    const [battle] = await db
      .insert(battles)
      .values({
        userId: session.user.id,
        title,
        format,
        participants,
        state,
        status: 'in_progress',
      })
      .returning();

    return NextResponse.json(battle, { status: 201 });
  } catch (error) {
    console.error('Error creating battle:', error);
    return NextResponse.json(
      { error: 'Failed to create battle' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/battles
 * List user's battles with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'in_progress' | 'completed' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query conditions
    const conditions = [eq(battles.userId, session.user.id)];

    if (status && status !== 'all') {
      conditions.push(eq(battles.status, status));
    }

    // Fetch battles
    const userBattles = await db
      .select()
      .from(battles)
      .where(and(...conditions))
      .orderBy(desc(battles.createdAt))
      .limit(limit);

    return NextResponse.json(userBattles);
  } catch (error) {
    console.error('Error fetching battles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battles' },
      { status: 500 }
    );
  }
}
