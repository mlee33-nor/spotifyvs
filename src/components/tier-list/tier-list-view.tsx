'use client';

import { TierRow } from './tier-row';
import { type Track } from '@/types/spotify';

interface TierListViewProps {
  tiers: Record<string, Track[]>;
  tierLabels: string[];
  id?: string;
}

export function TierListView({ tiers, tierLabels, id }: TierListViewProps) {
  return (
    <div id={id} className="space-y-4">
      {tierLabels.map((label) => {
        const tierTracks = tiers[label] || [];
        return <TierRow key={label} label={label} tracks={tierTracks} />;
      })}
    </div>
  );
}
