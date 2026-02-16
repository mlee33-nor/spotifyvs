'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, List, User, ArrowRight } from 'lucide-react';
import { PageTransition, StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { type TierListSource, type Track } from '@/types/spotify';
import {
  useTopTracks,
  useSavedTracks,
  useUserPlaylists,
  usePlaylistTracks,
  useArtistTracks,
  useSearchArtists,
} from '@/hooks/use-spotify';
import { TrackCard } from '@/components/track/track-card';
import { LoadingSpinner, TrackGridSkeleton } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type SourceType = 'top_tracks' | 'saved_tracks' | 'playlist' | 'artist';
type Step = 'source' | 'configure' | 'tracks' | 'tiers';

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

const DEFAULT_TIER_LABELS = ['S', 'A', 'B', 'C', 'D', 'F'];

export default function NewTierListPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [trackLimit, setTrackLimit] = useState(50);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [tierLabels, setTierLabels] = useState<string[]>(DEFAULT_TIER_LABELS);

  // Queries
  const { data: topTracks, isLoading: loadingTopTracks } = useTopTracks(timeRange, 50);
  const { data: savedTracks, isLoading: loadingSavedTracks } = useSavedTracks(50);
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
    const tracks = getCurrentTracks().slice(0, trackLimit);
    setSelectedTracks(tracks);
    setStep('tiers');
  };

  const handleCreateTierList = () => {
    // Store in localStorage for the builder page
    const tierListData = {
      source: {
        type: sourceType,
        id: sourceType === 'playlist' ? selectedPlaylistId : selectedArtistId,
        timeRange: sourceType === 'top_tracks' ? timeRange : undefined,
      } as TierListSource,
      tracks: selectedTracks,
      tierLabels,
    };

    localStorage.setItem('tierlist-creation-data', JSON.stringify(tierListData));
    router.push('/tier-lists/create');
  };

  // Step 1: Source Selection
  if (step === 'source') {
    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Tier List</h1>
          <p className="text-muted-foreground">Choose a source for your tracks</p>
        </div>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SOURCE_OPTIONS.map((option) => (
            <StaggerItem key={option.type}>
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSourceSelect(option.type)}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all text-left bg-card group"
              >
                <div className={cn('w-14 h-14 rounded-lg bg-gradient-to-br mb-4 flex items-center justify-center', option.color)}>
                  <option.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                <p className="text-muted-foreground">{option.description}</p>
              </motion.button>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </PageTransition>
    );
  }

  // Step 2: Configure Source
  if (step === 'configure') {
    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => setStep('source')}
            className="text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← Back to source selection
          </button>
          <h1 className="text-3xl font-bold mb-2">Configure Source</h1>
          <p className="text-muted-foreground">Set up your track selection</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Top Tracks Configuration */}
          {sourceType === 'top_tracks' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short_term', label: 'Last 4 Weeks' },
                    { value: 'medium_term', label: 'Last 6 Months' },
                    { value: 'long_term', label: 'All Time' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value as any)}
                      className={cn(
                        'py-3 px-4 rounded-lg border-2 transition-all',
                        timeRange === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingTopTracks ? (
                <LoadingSpinner text="Loading your top tracks..." />
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Found {topTracks?.length || 0} top tracks
                  </p>
                </div>
              )}
            </>
          )}

          {/* Saved Tracks Configuration */}
          {sourceType === 'saved_tracks' && (
            <>
              {loadingSavedTracks ? (
                <LoadingSpinner text="Loading your saved tracks..." />
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Found {savedTracks?.length || 0} saved tracks
                  </p>
                </div>
              )}
            </>
          )}

          {/* Playlist Configuration */}
          {sourceType === 'playlist' && (
            <>
              {loadingPlaylists ? (
                <LoadingSpinner text="Loading your playlists..." />
              ) : playlists && playlists.length > 0 ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Select Playlist</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {playlists.map((playlist: any) => (
                      <button
                        key={playlist.id}
                        onClick={() => setSelectedPlaylistId(playlist.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          selectedPlaylistId === playlist.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {playlist.images?.[0]?.url && (
                          <img
                            src={playlist.images[0].url}
                            alt={playlist.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{playlist.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {playlist.tracks.total} tracks
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={List}
                  title="No playlists found"
                  description="Create some playlists in Spotify first"
                />
              )}
            </>
          )}

          {/* Artist Configuration */}
          {sourceType === 'artist' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Search for Artist</label>
                <input
                  type="text"
                  value={artistSearchQuery}
                  onChange={(e) => setArtistSearchQuery(e.target.value)}
                  placeholder="Enter artist name..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {searchingArtists ? (
                <LoadingSpinner text="Searching artists..." />
              ) : searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {searchResults.map((artist: any) => (
                    <button
                      key={artist.id}
                      onClick={() => {
                        setSelectedArtistId(artist.id);
                        setArtistSearchQuery(artist.name);
                      }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                        selectedArtistId === artist.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {artist.images?.[0]?.url && (
                        <img
                          src={artist.images[0].url}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{artist.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {artist.followers?.total.toLocaleString()} followers
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : artistSearchQuery ? (
                <p className="text-sm text-muted-foreground">No artists found</p>
              ) : null}
            </>
          )}

          {/* Track Limit */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Tracks: {trackLimit}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={trackLimit}
              onChange={(e) => setTrackLimit(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10</span>
              <span>100</span>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleConfigure}
            disabled={
              (sourceType === 'playlist' && !selectedPlaylistId) ||
              (sourceType === 'artist' && !selectedArtistId) ||
              getCurrentTracks().length === 0
            }
            className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Continue to Tier Labels
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </PageTransition>
    );
  }

  // Step 3: Tier Labels
  if (step === 'tiers') {
    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => setStep('configure')}
            className="text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← Back to configuration
          </button>
          <h1 className="text-3xl font-bold mb-2">Tier Labels</h1>
          <p className="text-muted-foreground">Customize your tier labels or use defaults</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Tier Labels (top to bottom)</label>
            <div className="space-y-2">
              {tierLabels.map((label, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => {
                      const newLabels = [...tierLabels];
                      newLabels[index] = e.target.value;
                      setTierLabels(newLabels);
                    }}
                    maxLength={3}
                    className="w-20 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-center font-bold"
                  />
                  <div className={cn('h-8 flex-1 rounded-lg bg-gradient-to-r opacity-30', `from-tier-${label.toLowerCase()} to-tier-${label.toLowerCase()}/50`)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTierLabels([...tierLabels, 'X'])}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors"
            >
              Add Tier
            </button>
            {tierLabels.length > 2 && (
              <button
                onClick={() => setTierLabels(tierLabels.slice(0, -1))}
                className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
              >
                Remove Last Tier
              </button>
            )}
            <button
              onClick={() => setTierLabels(DEFAULT_TIER_LABELS)}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to rank {selectedTracks.length} tracks across {tierLabels.length} tiers
            </p>
            <button
              onClick={handleCreateTierList}
              className="w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Create Tier List
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return null;
}
