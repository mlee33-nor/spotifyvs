'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { TierLabel } from './tier-label';
import { TrackCard } from '@/components/track/track-card';
import { type Track } from '@/types/spotify';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/store/audio-store';

interface TierRowProps {
  label: string;
  tracks: Track[];
  isOver?: boolean;
}

export function TierRow({ label, tracks, isOver }: TierRowProps) {
  const { setNodeRef } = useDroppable({
    id: `tier-${label}`,
  });

  const { play, currentTrack, isPlaying } = useAudioStore();

  return (
    <div className="flex gap-4">
      <TierLabel label={label} />
      <SortableContext items={tracks.map(t => t.id)} strategy={horizontalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 min-h-[88px] flex gap-3 p-3 rounded-lg border-2 border-dashed transition-all',
            isOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/50',
            tracks.length === 0 && 'bg-muted/30'
          )}
        >
          {tracks.length === 0 ? (
            <div className="flex items-center justify-center w-full text-muted-foreground text-sm">
              Drag tracks here
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
              {tracks.map((track) => (
                <div key={track.id} className="flex-shrink-0 w-32">
                  <TrackCard
                    track={track}
                    variant="compact"
                    draggable
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => play(track)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
