'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Undo, Play, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PageTransition } from '@/components/ui/page-transition';
import { TrackCard } from '@/components/track/track-card';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { useAudioStore } from '@/store/audio-store';
import { type Track, type BattleMatchup } from '@/types/spotify';
import { cn } from '@/lib/utils';

interface BattleState {
  rounds: Array<{
    roundNumber: number;
    matchups: BattleMatchup[];
  }>;
  currentRound: number;
  currentMatchup: number;
  isComplete: boolean;
  winner?: Track;
}

interface Battle {
  id: string;
  title: string;
  format: number;
  state: BattleState;
  participants: Track[];
  status: string;
  winnerId?: string;
}

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  // Fetch battle data
  useEffect(() => {
    fetchBattle();
  }, [battleId]);

  const fetchBattle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/battles/${battleId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch battle');
      }

      const data = await response.json();
      setBattle(data);

      // Check if battle is already complete
      if (data.status === 'completed' && data.state.isComplete) {
        setShowWinner(true);
      }
    } catch (error) {
      console.error('Error fetching battle:', error);
      alert('Failed to load battle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (winnerId: string) => {
    if (!battle || isVoting) return;

    const currentMatchup = getCurrentMatchup();
    if (!currentMatchup) return;

    setIsVoting(true);

    try {
      const response = await fetch(`/api/battles/${battleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchupId: currentMatchup.id,
          winnerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const updatedBattle = await response.json();
      setBattle(updatedBattle);

      // Check if battle is complete
      if (updatedBattle.status === 'completed' && updatedBattle.state.isComplete) {
        setShowWinner(true);
        triggerConfetti();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const getCurrentMatchup = (): BattleMatchup | null => {
    if (!battle) return null;
    const round = battle.state.rounds[battle.state.currentRound];
    return round?.matchups[battle.state.currentMatchup] || null;
  };

  const getProgress = () => {
    if (!battle) return { current: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    battle.state.rounds.forEach((round, idx) => {
      round.matchups.forEach((matchup) => {
        if (
          idx < battle.state.currentRound ||
          (idx === battle.state.currentRound && matchup.winner)
        ) {
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
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1DB954', '#1ed760', '#ffffff'],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1DB954', '#1ed760', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isVoting || showWinner) return;

      const matchup = getCurrentMatchup();
      if (!matchup) return;

      if (e.key === '1') {
        handleVote(matchup.track1.id);
      } else if (e.key === '2') {
        handleVote(matchup.track2.id);
      } else if (e.key === ' ') {
        e.preventDefault();
        // Toggle play for current track
        if (currentTrack && isPlaying) {
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [battle, isVoting, showWinner, currentTrack, isPlaying]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </PageTransition>
    );
  }

  if (!battle) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Battle not found</h1>
          <button
            onClick={() => router.push('/battles')}
            className="text-spotify-green hover:underline"
          >
            ← Back to battles
          </button>
        </div>
      </PageTransition>
    );
  }

  const currentMatchup = getCurrentMatchup();
  const progress = getProgress();
  const currentRoundNumber = battle.state.currentRound + 1;
  const totalRounds = battle.state.rounds.length;

  // Winner Screen
  if (showWinner && battle.state.winner) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Trophy className="w-24 h-24 text-spotify-green mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Victory!</h1>
            <p className="text-xl text-muted-foreground mb-12">
              {battle.title} - Winner
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <TrackCard
                track={battle.state.winner}
                variant="default"
                showArtwork
                onPlay={() => playTrack(battle.state.winner!)}
              />
            </motion.div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/battles')}
                className="px-6 py-3 rounded-full border-2 border-border hover:border-spotify-green transition-colors"
              >
                View All Battles
              </button>
              <button
                onClick={() => router.push('/battles/new')}
                className="px-6 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90"
              >
                Create New Battle
              </button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // Voting Screen
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/battles')}
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to battles
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{battle.title}</h1>
              <p className="text-muted-foreground">
                Round {currentRoundNumber} of {totalRounds}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-spotify-green">
                {progress.current} / {progress.total}
              </div>
              <div className="text-sm text-muted-foreground">matchups completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              className="h-full bg-spotify-green"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Matchup */}
        {currentMatchup && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Which track is better?
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Press <kbd className="px-2 py-1 bg-border rounded">1</kbd> or{' '}
                <kbd className="px-2 py-1 bg-border rounded">2</kbd> to vote
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Track 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                key={currentMatchup.track1.id}
                className="relative"
              >
                <div className="absolute -top-4 left-4 z-10 bg-border px-3 py-1 rounded-full text-sm font-medium">
                  1
                </div>
                <motion.button
                  onClick={() => handleVote(currentMatchup.track1.id)}
                  disabled={isVoting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full block transition-all',
                    isVoting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <TrackCard
                    track={currentMatchup.track1}
                    variant="default"
                    showArtwork
                    onPlay={() => playTrack(currentMatchup.track1)}
                  />
                </motion.button>
              </motion.div>

              {/* VS */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-background border-4 border-spotify-green rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-xl font-bold text-spotify-green">VS</span>
                </div>
              </div>

              {/* Track 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                key={currentMatchup.track2.id}
                className="relative"
              >
                <div className="absolute -top-4 right-4 z-10 bg-border px-3 py-1 rounded-full text-sm font-medium">
                  2
                </div>
                <motion.button
                  onClick={() => handleVote(currentMatchup.track2.id)}
                  disabled={isVoting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full block transition-all',
                    isVoting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <TrackCard
                    track={currentMatchup.track2}
                    variant="default"
                    showArtwork
                    onPlay={() => playTrack(currentMatchup.track2)}
                  />
                </motion.button>
              </motion.div>
            </div>

            {/* Hint */}
            <div className="text-center mt-8 text-sm text-muted-foreground">
              Click on a track to preview it before voting
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
