import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { db } from '@/lib/db';
import { tierLists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const [tierList] = await db
      .select()
      .from(tierLists)
      .where(eq(tierLists.id, id))
      .limit(1);

    if (!tierList) {
      return NextResponse.json({ error: 'Tier list not found' }, { status: 404 });
    }

    // Check if user has access (owner or public)
    if (!tierList.isPublic && tierList.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ tierList });
  } catch (error) {
    console.error('Error fetching tier list:', error);
    return NextResponse.json({ error: 'Failed to fetch tier list' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, tiers, isPublic } = body;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(tierLists)
      .where(and(eq(tierLists.id, id), eq(tierLists.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Tier list not found or unauthorized' }, { status: 404 });
    }

    // Update tier list
    const [updated] = await db
      .update(tierLists)
      .set({
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        tiers: tiers || existing.tiers,
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(tierLists.id, id))
      .returning();

    return NextResponse.json({ tierList: updated, message: 'Tier list updated successfully' });
  } catch (error) {
    console.error('Error updating tier list:', error);
    return NextResponse.json({ error: 'Failed to update tier list' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(tierLists)
      .where(and(eq(tierLists.id, id), eq(tierLists.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Tier list not found or unauthorized' }, { status: 404 });
    }

    // Delete tier list
    await db.delete(tierLists).where(eq(tierLists.id, id));

    return NextResponse.json({ message: 'Tier list deleted successfully' });
  } catch (error) {
    console.error('Error deleting tier list:', error);
    return NextResponse.json({ error: 'Failed to delete tier list' }, { status: 500 });
  }
}
