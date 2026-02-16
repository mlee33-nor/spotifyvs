'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Trophy, Plus, Clock, CheckCircle } from 'lucide-react';
import { PageTransition, StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { type Track } from '@/types/spotify';

interface Battle {
  id: string;
  title: string;
  format: number;
  status: 'in_progress' | 'completed';
  winnerId?: string;
  state: {
    winner?: Track;
  };
  participants: Track[];
  createdAt: string;
}

type StatusFilter = 'all' | 'in_progress' | 'completed';

export default function BattlesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: battles, isLoading } = useQuery({
    queryKey: ['battles', statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/battles?status=${statusFilter}`);
      if (!response.ok) throw new Error('Failed to fetch battles');
      return response.json() as Promise<Battle[]>;
    },
  });

  const handleDeleteBattle = async (battleId: string) => {
    if (!confirm('Are you sure you want to delete this battle?')) return;

    try {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete battle');

      // Refetch battles
      window.location.reload();
    } catch (error) {
      console.error('Error deleting battle:', error);
      alert('Failed to delete battle');
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Battles</h1>
            <p className="text-muted-foreground">
              Tournament-style track battles
            </p>
          </div>

          <motion.button
            onClick={() => router.push('/battles/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Battle
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'all' as const, label: 'All' },
            { value: 'in_progress' as const, label: 'In Progress', icon: Clock },
            { value: 'completed' as const, label: 'Completed', icon: CheckCircle },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-full transition-all inline-flex items-center gap-2',
                statusFilter === filter.value
                  ? 'bg-spotify-green text-black'
                  : 'bg-border hover:bg-border/80'
              )}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Battles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : battles && battles.length > 0 ? (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {battles.map((battle) => (
              <StaggerItem key={battle.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card border-2 border-border rounded-xl overflow-hidden hover:border-spotify-green/50 transition-all"
                >
                  {/* Battle Thumbnail */}
                  <div className="relative aspect-square bg-gradient-to-br from-spotify-green/20 to-purple-500/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Swords className="w-20 h-20 text-spotify-green/40" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {battle.status === 'completed' ? (
                        <div className="bg-spotify-green text-black px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          Complete
                        </div>
                      ) : (
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          In Progress
                        </div>
                      )}
                    </div>

                    {/* Format Badge */}
                    <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {battle.format} Tracks
                    </div>
                  </div>

                  {/* Battle Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 truncate">{battle.title}</h3>

                    {battle.status === 'completed' && battle.state.winner && (
                      <div className="mb-4 p-3 bg-spotify-green/10 rounded-lg border border-spotify-green/30">
                        <div className="text-xs text-spotify-green font-medium mb-1">
                          Winner
                        </div>
                        <div className="text-sm font-medium truncate">
                          {battle.state.winner.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {battle.state.winner.artistName}
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground mb-4">
                      Created {new Date(battle.createdAt).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {battle.status === 'in_progress' ? (
                        <button
                          onClick={() => router.push(`/battles/${battle.id}`)}
                          className="flex-1 px-4 py-2 bg-spotify-green text-black font-semibold rounded-lg hover:bg-spotify-green/90"
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push(`/battles/${battle.id}`)}
                          className="flex-1 px-4 py-2 bg-border hover:bg-border/80 rounded-lg"
                        >
                          View Results
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteBattle(battle.id)}
                        className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <EmptyState
            icon={Swords}
            title="No battles yet"
            description="Create your first battle to get started"
            action={
              <button
                onClick={() => router.push('/battles/new')}
                className="px-6 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Battle
              </button>
            }
          />
        )}
      </div>
    </PageTransition>
  );
}
