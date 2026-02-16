import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { battles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/battles/[id]
 * Get a specific battle by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;

    // Fetch battle
    const [battle] = await db
      .select()
      .from(battles)
      .where(eq(battles.id, battleId))
      .limit(1);

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Check if user owns the battle
    if (battle.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(battle);
  } catch (error) {
    console.error('Error fetching battle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/battles/[id]
 * Update a battle's state (used for voting and progression)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;
    const body = await request.json();
    const { state, status, winnerId } = body;

    // Fetch existing battle
    const [existingBattle] = await db
      .select()
      .from(battles)
      .where(eq(battles.id, battleId))
      .limit(1);

    if (!existingBattle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Check if user owns the battle
    if (existingBattle.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update battle
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (state) updateData.state = state;
    if (status) updateData.status = status;
    if (winnerId) updateData.winnerId = winnerId;

    const [updatedBattle] = await db
      .update(battles)
      .set(updateData)
      .where(eq(battles.id, battleId))
      .returning();

    return NextResponse.json(updatedBattle);
  } catch (error) {
    console.error('Error updating battle:', error);
    return NextResponse.json(
      { error: 'Failed to update battle' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/battles/[id]
 * Delete a battle
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;

    // Fetch battle to check ownership
    const [battle] = await db
      .select()
      .from(battles)
      .where(eq(battles.id, battleId))
      .limit(1);

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Check if user owns the battle
    if (battle.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete battle
    await db.delete(battles).where(eq(battles.id, battleId));

    return NextResponse.json({ message: 'Battle deleted successfully' });
  } catch (error) {
    console.error('Error deleting battle:', error);
    return NextResponse.json(
      { error: 'Failed to delete battle' },
      { status: 500 }
    );
  }
}
