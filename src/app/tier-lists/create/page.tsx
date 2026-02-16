'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TierListBuilder } from '@/components/tier-list/tier-list-builder';
import { PageTransition } from '@/components/ui/page-transition';
import { LoadingPage } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertCircle } from 'lucide-react';
import { type Track, type TierListSource } from '@/types/spotify';

interface TierListCreationData {
  source: TierListSource;
  tracks: Track[];
  tierLabels: string[];
}

export default function CreateTierListPage() {
  const router = useRouter();
  const [data, setData] = useState<TierListCreationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const stored = localStorage.getItem('tierlist-creation-data');
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setData(parsed);
    } catch (error) {
      console.error('Failed to parse tier list data:', error);
    }

    setLoading(false);
  }, []);

  const handleSave = async (saveData: {
    title: string;
    description: string;
    tiers: Record<string, Track[]>;
  }) => {
    if (!data) return;

    setSaving(true);

    try {
      const response = await fetch('/api/tier-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveData.title,
          description: saveData.description,
          tiers: saveData.tiers,
          tierLabels: data.tierLabels,
          sourceMetadata: data.source,
          isPublic: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tier list');
      }

      const result = await response.json();

      // Clear localStorage
      localStorage.removeItem('tierlist-creation-data');
      localStorage.removeItem(`tierlist-draft-${result.id}`);

      // Show success message (you can add a toast here)
      alert('Tier list saved successfully! 🎉');

      // Redirect to tier list page
      router.push(`/tier-lists/${result.id}`);
    } catch (error) {
      console.error('Failed to save tier list:', error);
      alert('Failed to save tier list. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage text="Loading tier list..." />;
  }

  if (!data) {
    return (
      <PageTransition className="container mx-auto px-4 py-8">
        <EmptyState
          icon={AlertCircle}
          title="No tier list data found"
          description="Please start by selecting a source for your tier list"
          action={
            <button
              onClick={() => router.push('/tier-lists/new')}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create New Tier List
            </button>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <button
          onClick={() => {
            if (confirm('Are you sure? Unsaved changes will be lost.')) {
              router.push('/tier-lists/new');
            }
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to source selection
        </button>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium">Saving your tier list...</p>
            </div>
          </div>
        </div>
      )}

      <TierListBuilder
        initialTracks={data.tracks}
        tierLabels={data.tierLabels}
        onSave={handleSave}
        autoSaveKey="tierlist-draft"
      />
    </PageTransition>
  );
}
