'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Calendar } from 'lucide-react';
import { PageTransition, StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useTierLists } from '@/hooks/use-tier-lists';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type TierList } from '@/lib/db/schema';

export default function TierListsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const { data: tierLists, isLoading } = useTierLists(filter);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tier Lists</h1>
          <p className="text-muted-foreground">Create and manage your music tier lists</p>
        </div>
        <Link
          href="/tier-lists/new"
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Tier List
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { value: 'all', label: 'All' },
          { value: 'public', label: 'Public' },
          { value: 'private', label: 'Private' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={cn(
              'px-4 py-2 border-b-2 transition-colors',
              filter === tab.value
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tier Lists Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading your tier lists..." />
      ) : tierLists && tierLists.length > 0 ? (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tierLists.map((tierList) => (
            <StaggerItem key={tierList.id}>
              <TierListCard tierList={tierList} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <EmptyState
          icon={Plus}
          title={
            filter === 'all'
              ? 'No tier lists yet'
              : filter === 'public'
              ? 'No public tier lists'
              : 'No private tier lists'
          }
          description="Create your first tier list to get started"
          action={
            <Link
              href="/tier-lists/new"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create Tier List
            </Link>
          }
        />
      )}
    </PageTransition>
  );
}

function TierListCard({ tierList }: { tierList: TierList }) {
  const router = useRouter();

  // Get preview tracks (first 3 from any tier)
  const tiers = tierList.tiers as Record<string, any[]>;
  const previewTracks = Object.values(tiers)
    .flat()
    .slice(0, 3);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => router.push(`/tier-lists/${tierList.id}`)}
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-all group"
    >
      {/* Thumbnail/Preview */}
      <div className="relative h-48 bg-muted">
        {tierList.thumbnailUrl ? (
          <img
            src={tierList.thumbnailUrl}
            alt={tierList.title}
            className="w-full h-full object-cover"
          />
        ) : previewTracks.length > 0 ? (
          <div className="grid grid-cols-3 h-full">
            {previewTracks.map((track: any, i: number) => (
              <div key={i} className="relative">
                {track.albumArt && (
                  <img
                    src={track.albumArt}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-xs text-white flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {tierList.viewCount || 0}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors truncate">
          {tierList.title}
        </h3>
        {tierList.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {tierList.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(tierList.createdAt)}
          </div>
          <span className={cn('px-2 py-1 rounded', tierList.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500')}>
            {tierList.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
