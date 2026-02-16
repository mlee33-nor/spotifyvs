'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingPage } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { TierListView } from '@/components/tier-list/tier-list-view';
import { type Track } from '@/types/spotify';

interface SharedContent {
  contentType: 'tier_list' | 'battle';
  content: any;
  viewCount: number;
}

export default function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const router = useRouter();

  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedContent();
  }, [shareId]);

  const fetchSharedContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/share/${shareId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Content not found');
        } else {
          throw new Error('Failed to fetch shared content');
        }
        return;
      }

      const data = await response.json();
      setSharedContent(data);
    } catch (err) {
      console.error('Error fetching shared content:', err);
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingPage text="Loading shared content..." />;
  }

  if (error || !sharedContent) {
    return (
      <PageTransition className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ArrowLeft}
          title={error || 'Content not found'}
          description="This shared link may be invalid or the content has been deleted"
          action={
            <Link
              href="/"
              className="px-6 py-2 rounded-lg bg-spotify-green text-black font-semibold hover:bg-spotify-green/90 transition-colors"
            >
              Go to Homepage
            </Link>
          }
        />
      </PageTransition>
    );
  }

  // Render Tier List
  if (sharedContent.contentType === 'tier_list') {
    const tierList = sharedContent.content;
    const tiers = tierList.tiers as Record<string, Track[]>;
    const tierLabels = Object.keys(tiers).filter((key) => key !== 'unranked');
    const totalTracks = Object.values(tiers).flat().length;

    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Branding Banner */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-spotify-green hover:underline">
            <span className="text-2xl font-bold">SpotifyVS</span>
            <ExternalLink className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Create your own tier lists and battles
          </p>
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="inline-block px-3 py-1 bg-spotify-green/10 text-spotify-green rounded-full text-sm font-medium mb-3">
              Shared Tier List
            </div>
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
                {sharedContent.viewCount} views
              </div>
              <div className="flex items-center gap-1">
                <span>{totalTracks} tracks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier List View */}
        <TierListView id="tier-list-view" tiers={tiers} tierLabels={tierLabels} />

        {/* Footer CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-spotify-green/10 to-purple-500/10 rounded-xl border border-spotify-green/30">
          <h3 className="text-2xl font-bold mb-2">Create Your Own Tier List</h3>
          <p className="text-muted-foreground mb-6">
            Rank your favorite Spotify tracks with SpotifyVS
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </PageTransition>
    );
  }

  // Render Battle (if needed in the future)
  if (sharedContent.contentType === 'battle') {
    const battle = sharedContent.content;

    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Branding Banner */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-spotify-green hover:underline">
            <span className="text-2xl font-bold">SpotifyVS</span>
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>

        {/* Battle Content */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-block px-3 py-1 bg-spotify-green/10 text-spotify-green rounded-full text-sm font-medium mb-3">
            Shared Battle
          </div>
          <h1 className="text-3xl font-bold mb-4">{battle.title}</h1>
          <p className="text-muted-foreground mb-6">
            Battle sharing view coming soon!
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 inline-block"
          >
            Create Your Own Battle
          </Link>
        </div>
      </PageTransition>
    );
  }

  return null;
}
