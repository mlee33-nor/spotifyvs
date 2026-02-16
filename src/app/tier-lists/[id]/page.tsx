'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Share2, Download, Play, ArrowLeft, Eye, Calendar } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingPage } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { TierListView } from '@/components/tier-list/tier-list-view';
import { ExportToImage } from '@/components/tier-list/export-to-image';
import { useTierList, useDeleteTierList } from '@/hooks/use-tier-lists';
import { useSession } from 'next-auth/react';
import { useAudioStore } from '@/store/audio-store';
import { type Track } from '@/types/spotify';

export default function TierListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { data: tierList, isLoading } = useTierList(id);
  const deleteMutation = useDeleteTierList();
  const { setQueue } = useAudioStore();

  const isOwner = session?.user?.id === tierList?.userId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tier list? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      alert('Tier list deleted successfully');
      router.push('/tier-lists');
    } catch (error) {
      console.error('Failed to delete tier list:', error);
      alert('Failed to delete tier list. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'tier_list',
          contentId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const { url } = await response.json();
      await navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Failed to create share link. Please try again.');
    }
  };

  const handlePlayAll = () => {
    if (!tierList) return;

    const tiers = tierList.tiers as Record<string, Track[]>;
    const allTracks = Object.values(tiers).flat().filter(track => track.previewUrl);

    if (allTracks.length === 0) {
      alert('No playable tracks found');
      return;
    }

    setQueue(allTracks, 0);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingPage text="Loading tier list..." />;
  }

  if (!tierList) {
    return (
      <PageTransition className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ArrowLeft}
          title="Tier list not found"
          description="This tier list may have been deleted or you don't have access to it"
          action={
            <Link
              href="/tier-lists"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Tier Lists
            </Link>
          }
        />
      </PageTransition>
    );
  }

  const tiers = tierList.tiers as Record<string, Track[]>;

  // Try to extract tier labels from the tiers object, or use defaults
  const tierLabels = Object.keys(tiers).filter(key => key !== 'unranked');

  // Get track count
  const totalTracks = Object.values(tiers).flat().length;

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Link
        href="/tier-lists"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tier Lists
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{tierList.title}</h1>
            {tierList.description && (
              <p className="text-muted-foreground mb-4">{tierList.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(tierList.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {tierList.viewCount || 0} views
              </div>
              <div className="flex items-center gap-1">
                <span>{totalTracks} tracks</span>
              </div>
              <div>
                <span className={tierList.isPublic ? 'text-green-500' : 'text-gray-500'}>
                  {tierList.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Play All
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <ExportToImage
              elementId="tier-list-view"
              filename={tierList.title.toLowerCase().replace(/\s+/g, '-')}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors"
            />
            {isOwner && (
              <>
                <Link
                  href={`/tier-lists/${id}/edit`}
                  className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tier List View */}
      <TierListView id="tier-list-view" tiers={tiers} tierLabels={tierLabels} />
    </PageTransition>
  );
}
