import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { battles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/battles/[id]/vote
 * Submit a vote for a matchup and progress the battle
 */
export async function POST(
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
    const { matchupId, winnerId } = body;

    if (!matchupId || !winnerId) {
      return NextResponse.json(
        { error: 'Missing required fields: matchupId, winnerId' },
        { status: 400 }
      );
    }

    // Fetch existing battle
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

    // Check if battle is already completed
    if (battle.status === 'completed') {
      return NextResponse.json(
        { error: 'Battle is already completed' },
        { status: 400 }
      );
    }

    // Get current state
    const state = battle.state as any;
    const { rounds, currentRound, currentMatchup } = state;

    // Find the matchup and update it with the winner
    const round = rounds[currentRound];
    if (!round) {
      return NextResponse.json(
        { error: 'Invalid battle state: round not found' },
        { status: 400 }
      );
    }

    const matchupIndex = round.matchups.findIndex((m: any) => m.id === matchupId);
    if (matchupIndex === -1) {
      return NextResponse.json(
        { error: 'Matchup not found in current round' },
        { status: 400 }
      );
    }

    const matchup = round.matchups[matchupIndex];

    // Validate winner ID
    if (matchup.track1.id !== winnerId && matchup.track2.id !== winnerId) {
      return NextResponse.json(
        { error: 'Invalid winner ID' },
        { status: 400 }
      );
    }

    // Update matchup with winner
    round.matchups[matchupIndex] = {
      ...matchup,
      winner: winnerId,
    };

    const winner = matchup.track1.id === winnerId ? matchup.track1 : matchup.track2;

    // Check if round is complete
    const isRoundComplete = round.matchups.every((m: any) => m.winner);

    let newState = { ...state };
    let battleStatus = battle.status;
    let battleWinnerId = battle.winnerId;

    if (isRoundComplete) {
      // Get all winners from current round
      const winners = round.matchups.map((m: any) => {
        return m.track1.id === m.winner ? m.track1 : m.track2;
      });

      const nextRound = rounds[currentRound + 1];

      if (nextRound) {
        // Populate next round with winners
        for (let i = 0; i < nextRound.matchups.length; i++) {
          nextRound.matchups[i] = {
            ...nextRound.matchups[i],
            track1: winners[i * 2],
            track2: winners[i * 2 + 1],
          };
        }

        // Move to next round
        newState = {
          ...state,
          rounds,
          currentRound: currentRound + 1,
          currentMatchup: 0,
          isComplete: false,
        };
      } else {
        // Tournament complete!
        newState = {
          ...state,
          rounds,
          isComplete: true,
          winner,
        };
        battleStatus = 'completed';
        battleWinnerId = winner.id;
      }
    } else {
      // Move to next matchup in current round
      const nextMatchupIndex = round.matchups.findIndex(
        (m: any, idx: number) => idx > matchupIndex && !m.winner
      );

      newState = {
        ...state,
        rounds,
        currentMatchup: nextMatchupIndex !== -1 ? nextMatchupIndex : currentMatchup + 1,
      };
    }

    // Update battle in database
    const [updatedBattle] = await db
      .update(battles)
      .set({
        state: newState,
        status: battleStatus,
        winnerId: battleWinnerId,
        updatedAt: new Date(),
      })
      .where(eq(battles.id, battleId))
      .returning();

    return NextResponse.json(updatedBattle);
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
