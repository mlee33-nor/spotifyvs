'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { TrackCard } from '@/components/track/track-card';
import { type Track } from '@/types/spotify';
import { cn } from '@/lib/utils';
import { StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { useAudioStore } from '@/store/audio-store';

interface UnrankedPoolProps {
  tracks: Track[];
  isOver?: boolean;
}

export function UnrankedPool({ tracks, isOver }: UnrankedPoolProps) {
  const { setNodeRef } = useDroppable({
    id: 'unranked',
  });

  const { play, currentTrack, isPlaying } = useAudioStore();

  return (
    <div className="border-t-2 border-border pt-6">
      <h3 className="text-lg font-semibold mb-4">
        Unranked Tracks ({tracks.length})
      </h3>
      <SortableContext items={tracks.map(t => t.id)} strategy={rectSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-all',
            isOver ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/30'
          )}
        >
          {tracks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              All tracks ranked! 🎉
            </div>
          ) : (
            <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <StaggerItem key={track.id}>
                  <TrackCard
                    track={track}
                    variant="draggable"
                    draggable
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => play(track)}
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
