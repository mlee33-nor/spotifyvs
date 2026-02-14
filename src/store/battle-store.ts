import { create } from 'zustand';
import { Track, BattleState, BattleRound, BattleMatchup } from '@/types/spotify';
import { nanoid } from 'nanoid';

export interface BattleStoreState extends BattleState {
  // Actions
  initializeBattle: (tracks: Track[], format: 8 | 16 | 32 | 64) => void;
  selectWinner: (matchupId: string, winnerId: string) => void;
  undoLastVote: () => void;
  resetBattle: () => void;
  getCurrentMatchup: () => BattleMatchup | null;
  getProgress: () => { current: number; total: number; percentage: number };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate tournament bracket structure
 */
function generateBracket(tracks: Track[], format: number): BattleRound[] {
  const shuffledTracks = shuffle(tracks).slice(0, format);
  const rounds: BattleRound[] = [];

  // Calculate number of rounds (log2 of format)
  const numRounds = Math.log2(format);

  // Generate Round 1 matchups
  const round1Matchups: BattleMatchup[] = [];
  for (let i = 0; i < shuffledTracks.length; i += 2) {
    round1Matchups.push({
      id: nanoid(),
      track1: shuffledTracks[i],
      track2: shuffledTracks[i + 1],
    });
  }

  rounds.push({
    roundNumber: 1,
    matchups: round1Matchups,
  });

  // Generate placeholder rounds
  let previousRoundMatchups = round1Matchups.length;
  for (let roundNum = 2; roundNum <= numRounds; roundNum++) {
    const matchupsInRound = previousRoundMatchups / 2;
    const roundMatchups: BattleMatchup[] = [];

    for (let i = 0; i < matchupsInRound; i++) {
      // Placeholder matchups - will be filled as previous round completes
      roundMatchups.push({
        id: nanoid(),
        track1: {} as Track,
        track2: {} as Track,
      });
    }

    rounds.push({
      roundNumber: roundNum,
      matchups: roundMatchups,
    });

    previousRoundMatchups = matchupsInRound;
  }

  return rounds;
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  rounds: [],
  currentRound: 0,
  currentMatchup: 0,
  isComplete: false,
  winner: undefined,

  initializeBattle: (tracks, format) => {
    const rounds = generateBracket(tracks, format);

    set({
      rounds,
      currentRound: 0,
      currentMatchup: 0,
      isComplete: false,
      winner: undefined,
    });
  },

  selectWinner: (matchupId, winnerId) => {
    const state = get();
    const currentRound = state.rounds[state.currentRound];

    if (!currentRound) return;

    // Find and update the matchup with the winner
    const matchupIndex = currentRound.matchups.findIndex(m => m.id === matchupId);
    if (matchupIndex === -1) return;

    const matchup = currentRound.matchups[matchupIndex];
    const winner = matchup.track1.id === winnerId ? matchup.track1 : matchup.track2;

    // Update matchup with winner
    currentRound.matchups[matchupIndex] = {
      ...matchup,
      winner: winnerId,
    };

    // Check if current round is complete
    const isRoundComplete = currentRound.matchups.every(m => m.winner);

    if (isRoundComplete) {
      // Populate next round with winners
      const winners = currentRound.matchups.map(m => {
        return m.track1.id === m.winner ? m.track1 : m.track2;
      });

      const nextRound = state.rounds[state.currentRound + 1];
      if (nextRound) {
        // Populate next round matchups
        for (let i = 0; i < nextRound.matchups.length; i++) {
          nextRound.matchups[i] = {
            ...nextRound.matchups[i],
            track1: winners[i * 2],
            track2: winners[i * 2 + 1],
          };
        }

        // Move to next round
        set({
          rounds: [...state.rounds],
          currentRound: state.currentRound + 1,
          currentMatchup: 0,
        });
      } else {
        // Tournament complete!
        set({
          rounds: [...state.rounds],
          isComplete: true,
          winner,
        });
      }
    } else {
      // Move to next matchup in current round
      const nextMatchupIndex = currentRound.matchups.findIndex(
        (m, idx) => idx > matchupIndex && !m.winner
      );

      set({
        rounds: [...state.rounds],
        currentMatchup: nextMatchupIndex !== -1 ? nextMatchupIndex : state.currentMatchup + 1,
      });
    }
  },

  undoLastVote: () => {
    const state = get();

    // Find the last voted matchup
    let lastVotedRoundIdx = state.currentRound;
    let lastVotedMatchupIdx = state.currentMatchup - 1;

    // If we're at the start of a round, go to previous round
    if (lastVotedMatchupIdx < 0 && lastVotedRoundIdx > 0) {
      lastVotedRoundIdx -= 1;
      const prevRound = state.rounds[lastVotedRoundIdx];
      lastVotedMatchupIdx = prevRound.matchups.length - 1;
    }

    if (lastVotedRoundIdx < 0 || lastVotedMatchupIdx < 0) return;

    // Remove winner from matchup
    const round = state.rounds[lastVotedRoundIdx];
    const matchup = round.matchups[lastVotedMatchupIdx];

    if (matchup.winner) {
      round.matchups[lastVotedMatchupIdx] = {
        ...matchup,
        winner: undefined,
      };

      set({
        rounds: [...state.rounds],
        currentRound: lastVotedRoundIdx,
        currentMatchup: lastVotedMatchupIdx,
        isComplete: false,
        winner: undefined,
      });
    }
  },

  resetBattle: () => {
    set({
      rounds: [],
      currentRound: 0,
      currentMatchup: 0,
      isComplete: false,
      winner: undefined,
    });
  },

  getCurrentMatchup: () => {
    const state = get();
    const round = state.rounds[state.currentRound];
    return round?.matchups[state.currentMatchup] || null;
  },

  getProgress: () => {
    const state = get();
    let completed = 0;
    let total = 0;

    state.rounds.forEach((round, idx) => {
      round.matchups.forEach(matchup => {
        if (idx < state.currentRound || (idx === state.currentRound && matchup.winner)) {
          completed++;
        }
        total++;
      });
    });

    return {
      current: completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
}));
