'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useAudioStore } from '@/store/audio-store';
import { useAudio } from '@/hooks/use-audio';
import { cn } from '@/lib/utils';

export function AudioPlayer() {
  useAudio(); // Initialize audio system

  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    queueIndex,
    currentTime,
    duration,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
  } = useAudioStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else if (currentTrack) {
            resume();
          }
          break;
        case 'ArrowLeft':
          if (currentTrack) {
            if (currentTime > 3) {
              seek(0);
            } else {
              previous();
            }
          }
          break;
        case 'ArrowRight':
          if (currentTrack) {
            next();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTrack, currentTime, pause, resume, seek, next, previous]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg bg-opacity-95"
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-12 h-12 flex-shrink-0">
                {currentTrack.albumArt ? (
                  <Image
                    src={currentTrack.albumArt}
                    alt={currentTrack.albumName}
                    fill
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentTrack.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.artistName}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={previous}
                disabled={!hasPrevious}
                className={cn(
                  'p-2 rounded-full hover:bg-accent transition-colors',
                  !hasPrevious && 'opacity-50 cursor-not-allowed'
                )}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={isPlaying ? pause : resume}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5" fill="currentColor" />
                )}
              </button>

              <button
                onClick={next}
                disabled={!hasNext}
                className={cn(
                  'p-2 rounded-full hover:bg-accent transition-colors',
                  !hasNext && 'opacity-50 cursor-not-allowed'
                )}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time Display */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                className="p-2 rounded-full hover:bg-accent transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-muted rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
