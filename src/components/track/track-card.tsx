'use client';

import { motion } from 'framer-motion';
import { Music, Play, Pause, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { type Track } from '@/types/spotify';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type TrackCardVariant = 'default' | 'compact' | 'draggable' | 'selectable';

interface TrackCardProps {
  track: Track;
  variant?: TrackCardVariant;
  selected?: boolean;
  isPlaying?: boolean;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
  draggable?: boolean;
}

export function TrackCard({
  track,
  variant = 'default',
  selected = false,
  isPlaying = false,
  onClick,
  onPlay,
  className,
  draggable = false,
}: TrackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: track.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasPreview = Boolean(track.previewUrl);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay && hasPreview) {
      onPlay();
    }
  };

  const MotionDiv = motion.div;

  // Compact variant for small displays
  if (variant === 'compact') {
    return (
      <MotionDiv
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 p-2 rounded-md bg-card border border-border cursor-pointer',
          'hover:bg-accent/50 transition-colors',
          selected && 'ring-2 ring-primary',
          className
        )}
        onClick={onClick}
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.albumName}
              fill
              className="rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Music className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {hasPreview && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" fill="white" />
              ) : (
                <Play className="w-4 h-4 text-white" fill="white" />
              )}
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
        </div>
      </MotionDiv>
    );
  }

  // Draggable variant with drag handle
  if (variant === 'draggable' || draggable) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group',
          isDragging && 'opacity-50',
          className
        )}
      >
        <MotionDiv
          layoutId={`track-${track.id}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg bg-card border border-border',
            'hover:shadow-lg hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing',
            selected && 'ring-2 ring-primary',
          )}
          onClick={onClick}
        >
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="relative w-12 h-12 flex-shrink-0">
            {track.albumArt ? (
              <Image
                src={track.albumArt}
                alt={track.albumName}
                fill
                className="rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            {hasPreview && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" fill="white" />
                ) : (
                  <Play className="w-5 h-5 text-white" fill="white" />
                )}
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{track.name}</p>
            <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
            <p className="text-xs text-muted-foreground truncate">{track.albumName}</p>
          </div>
        </MotionDiv>
      </div>
    );
  }

  // Selectable variant for choosing tracks
  if (variant === 'selectable') {
    return (
      <MotionDiv
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative p-4 rounded-lg bg-card border-2 cursor-pointer',
          'hover:shadow-lg transition-all',
          selected ? 'border-primary bg-primary/5' : 'border-border',
          className
        )}
        onClick={onClick}
      >
        <div className="relative w-full aspect-square mb-3">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.albumName}
              fill
              className="rounded object-cover"
            />
          ) : (
            <div className="w-full h-full rounded bg-muted flex items-center justify-center">
              <Music className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {hasPreview && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" fill="white" />
              ) : (
                <Play className="w-8 h-8 text-white" fill="white" />
              )}
            </button>
          )}
          {selected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="font-medium truncate">{track.name}</p>
          <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
          <p className="text-xs text-muted-foreground truncate">{track.albumName}</p>
        </div>
      </MotionDiv>
    );
  }

  // Default variant
  return (
    <MotionDiv
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative p-4 rounded-lg bg-card border border-border cursor-pointer',
        'hover:shadow-lg hover:border-primary/50 transition-all',
        selected && 'ring-2 ring-primary',
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-full aspect-square mb-3">
        {track.albumArt ? (
          <Image
            src={track.albumArt}
            alt={track.albumName}
            fill
            className="rounded object-cover"
          />
        ) : (
          <div className="w-full h-full rounded bg-muted flex items-center justify-center">
            <Music className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {hasPreview && (
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white" fill="white" />
            )}
          </button>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-medium truncate">{track.name}</p>
        <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
        <p className="text-xs text-muted-foreground truncate">{track.albumName}</p>
      </div>
    </MotionDiv>
  );
}
