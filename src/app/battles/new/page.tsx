'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, List, User, ArrowRight, Swords, Trophy } from 'lucide-react';
import { PageTransition, StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { type Track } from '@/types/spotify';
import {
  useTopTracks,
  useSavedTracks,
  useUserPlaylists,
  usePlaylistTracks,
  useArtistTracks,
  useSearchArtists,
} from '@/hooks/use-spotify';
import { LoadingSpinner, TrackGridSkeleton } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type SourceType = 'top_tracks' | 'saved_tracks' | 'playlist' | 'artist';
type Step = 'source' | 'configure' | 'format';
type BattleFormat = 8 | 16 | 32 | 64;

const SOURCE_OPTIONS = [
  {
    type: 'top_tracks' as SourceType,
    icon: TrendingUp,
    title: 'Top Tracks',
    description: 'Your most played tracks',
    color: 'from-pink-500 to-purple-500',
  },
  {
    type: 'saved_tracks' as SourceType,
    icon: Heart,
    title: 'Saved Tracks',
    description: 'Your liked songs',
    color: 'from-green-500 to-emerald-500',
  },
  {
    type: 'playlist' as SourceType,
    icon: List,
    title: 'Playlist',
    description: 'Choose from your playlists',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'artist' as SourceType,
    icon: User,
    title: 'Artist',
    description: "An artist's top tracks",
    color: 'from-orange-500 to-red-500',
  },
];

const FORMAT_OPTIONS: { value: BattleFormat; label: string; rounds: number; description: string }[] = [
  { value: 8, label: '8 Tracks', rounds: 3, description: 'Quick battle (3 rounds)' },
  { value: 16, label: '16 Tracks', rounds: 4, description: 'Standard battle (4 rounds)' },
  { value: 32, label: '32 Tracks', rounds: 5, description: 'Extended battle (5 rounds)' },
  { value: 64, label: '64 Tracks', rounds: 6, description: 'Epic battle (6 rounds)' },
];

export default function NewBattlePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<BattleFormat | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Queries
  const { data: topTracks, isLoading: loadingTopTracks } = useTopTracks(timeRange, 100);
  const { data: savedTracks, isLoading: loadingSavedTracks } = useSavedTracks(100);
  const { data: playlists, isLoading: loadingPlaylists } = useUserPlaylists();
  const { data: playlistTracks, isLoading: loadingPlaylistTracks } = usePlaylistTracks(selectedPlaylistId, 100);
  const { data: artistTracks, isLoading: loadingArtistTracks } = useArtistTracks(selectedArtistId);
  const { data: searchResults, isLoading: searchingArtists } = useSearchArtists(artistSearchQuery);

  // Get current tracks based on source
  const getCurrentTracks = (): Track[] => {
    if (sourceType === 'top_tracks') return topTracks || [];
    if (sourceType === 'saved_tracks') return savedTracks || [];
    if (sourceType === 'playlist') return playlistTracks || [];
    if (sourceType === 'artist') return artistTracks || [];
    return [];
  };

  const handleSourceSelect = (type: SourceType) => {
    setSourceType(type);
    setStep('configure');
  };

  const handleConfigure = () => {
    setStep('format');
  };

  const handleCreateBattle = async () => {
    if (!selectedFormat || !sourceType) return;

    setIsCreating(true);

    try {
      const tracks = getCurrentTracks().slice(0, selectedFormat);

      if (tracks.length < selectedFormat) {
        alert(`Not enough tracks available. Need ${selectedFormat}, got ${tracks.length}`);
        setIsCreating(false);
        return;
      }

      // Generate title based on source
      let title = 'Battle';
      if (sourceType === 'top_tracks') {
        const timeRangeLabel = timeRange === 'short_term' ? 'Last Month' : timeRange === 'medium_term' ? 'Last 6 Months' : 'All Time';
        title = `Top Tracks Battle (${timeRangeLabel})`;
      } else if (sourceType === 'saved_tracks') {
        title = 'Liked Songs Battle';
      } else if (sourceType === 'playlist' && playlistTracks) {
        title = `${playlists?.find(p => p.id === selectedPlaylistId)?.name || 'Playlist'} Battle`;
      } else if (sourceType === 'artist' && artistTracks) {
        title = `${artistTracks[0]?.artists[0]?.name || 'Artist'} Battle`;
      }

      // Generate initial bracket structure (to be used by battle-store)
      const initialState = {
        rounds: [],
        currentRound: 0,
        currentMatchup: 0,
        isComplete: false,
      };

      // Create battle via API
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          format: selectedFormat,
          participants: tracks,
          state: initialState,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create battle');
      }

      const battle = await response.json();

      // Redirect to battle page
      router.push(`/battles/${battle.id}`);
    } catch (error) {
      console.error('Error creating battle:', error);
      alert('Failed to create battle. Please try again.');
      setIsCreating(false);
    }
  };

  const renderSourceSelection = () => (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4 text-spotify-green">
          <Swords className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Create a Battle</h1>
        <p className="text-muted-foreground text-lg">
          Choose a source for your tracks
        </p>
      </motion.div>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOURCE_OPTIONS.map((option) => (
          <StaggerItem key={option.type}>
            <motion.button
              onClick={() => handleSourceSelect(option.type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full p-6 rounded-xl border-2 border-border hover:border-spotify-green/50',
                'bg-card hover:bg-accent transition-all duration-200',
                'text-left group'
              )}
            >
              <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br mb-4', option.color)}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-spotify-green transition-colors">
                {option.title}
              </h3>
              <p className="text-muted-foreground">{option.description}</p>
            </motion.button>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );

  const renderConfiguration = () => {
    const isLoading = loadingTopTracks || loadingSavedTracks || loadingPlaylists || loadingPlaylistTracks || loadingArtistTracks || searchingArtists;
    const tracks = getCurrentTracks();

    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setStep('source')}
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2"
          >
            ← Back to source selection
          </button>
          <h2 className="text-3xl font-bold mb-2">Configure Source</h2>
          <p className="text-muted-foreground">
            {SOURCE_OPTIONS.find(o => o.type === sourceType)?.description}
          </p>
        </motion.div>

        {/* Top Tracks Configuration */}
        {sourceType === 'top_tracks' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Time Range</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'short_term' as const, label: 'Last Month' },
                  { value: 'medium_term' as const, label: 'Last 6 Months' },
                  { value: 'long_term' as const, label: 'All Time' },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'px-4 py-3 rounded-lg border-2 transition-all',
                      timeRange === range.value
                        ? 'border-spotify-green bg-spotify-green/10 text-spotify-green'
                        : 'border-border hover:border-spotify-green/50'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playlist Configuration */}
        {sourceType === 'playlist' && (
          <div className="space-y-4">
            {loadingPlaylists ? (
              <LoadingSpinner />
            ) : playlists && playlists.length > 0 ? (
              <div className="grid gap-3">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4',
                      selectedPlaylistId === playlist.id
                        ? 'border-spotify-green bg-spotify-green/10'
                        : 'border-border hover:border-spotify-green/50'
                    )}
                  >
                    {playlist.images?.[0] && (
                      <img src={playlist.images[0].url} alt="" className="w-12 h-12 rounded" />
                    )}
                    <div>
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-sm text-muted-foreground">{playlist.tracks.total} tracks</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={List}
                title="No playlists found"
                description="Create a playlist on Spotify first"
              />
            )}
          </div>
        )}

        {/* Artist Configuration */}
        {sourceType === 'artist' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Search for an artist</label>
              <input
                type="text"
                value={artistSearchQuery}
                onChange={(e) => setArtistSearchQuery(e.target.value)}
                placeholder="Type artist name..."
                className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-spotify-green focus:outline-none bg-background"
              />
            </div>

            {searchingArtists ? (
              <LoadingSpinner />
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid gap-3">
                {searchResults.map((artist) => (
                  <button
                    key={artist.id}
                    onClick={() => setSelectedArtistId(artist.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4',
                      selectedArtistId === artist.id
                        ? 'border-spotify-green bg-spotify-green/10'
                        : 'border-border hover:border-spotify-green/50'
                    )}
                  >
                    {artist.images?.[0] && (
                      <img src={artist.images[0].url} alt="" className="w-12 h-12 rounded-full" />
                    )}
                    <div>
                      <div className="font-medium">{artist.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {artist.followers?.total.toLocaleString()} followers
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : artistSearchQuery ? (
              <EmptyState
                icon={User}
                title="No artists found"
                description="Try a different search term"
              />
            ) : null}
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            onClick={handleConfigure}
            disabled={
              isLoading ||
              tracks.length === 0 ||
              (sourceType === 'playlist' && !selectedPlaylistId) ||
              (sourceType === 'artist' && !selectedArtistId)
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            Continue to Format Selection
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  };

  const renderFormatSelection = () => {
    const availableTracks = getCurrentTracks().length;

    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setStep('configure')}
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2"
          >
            ← Back to configuration
          </button>
          <h2 className="text-3xl font-bold mb-2">Choose Battle Format</h2>
          <p className="text-muted-foreground">
            Available tracks: {availableTracks}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {FORMAT_OPTIONS.map((format) => {
            const isDisabled = availableTracks < format.value;

            return (
              <motion.button
                key={format.value}
                onClick={() => !isDisabled && setSelectedFormat(format.value)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                className={cn(
                  'p-6 rounded-xl border-2 transition-all text-left',
                  selectedFormat === format.value
                    ? 'border-spotify-green bg-spotify-green/10'
                    : 'border-border hover:border-spotify-green/50',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <Trophy className={cn(
                    'w-8 h-8',
                    selectedFormat === format.value ? 'text-spotify-green' : 'text-muted-foreground'
                  )} />
                  <span className="text-2xl font-bold">{format.value}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{format.label}</h3>
                <p className="text-muted-foreground text-sm">{format.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format.rounds} rounds • {format.value - 1} matchups
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <motion.button
            onClick={handleCreateBattle}
            disabled={!selectedFormat || isCreating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <LoadingSpinner />
                Creating Battle...
              </>
            ) : (
              <>
                Start Battle
                <Swords className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        {step === 'source' && renderSourceSelection()}
        {step === 'configure' && renderConfiguration()}
        {step === 'format' && renderFormatSelection()}
      </div>
    </PageTransition>
  );
}
