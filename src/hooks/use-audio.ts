'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/store/audio-store';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    autoPlay,
    setAudioElement,
    setNextAudioElement,
    updateTime,
    next,
  } = useAudioStore();

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio();
    nextAudioRef.current = new Audio();

    setAudioElement(audioRef.current);
    setNextAudioElement(nextAudioRef.current);

    // Handle track end
    const handleEnded = () => {
      if (autoPlay) {
        next();
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoPlay, next, setAudioElement, setNextAudioElement]);

  // Update time
  useEffect(() => {
    if (!audioRef.current) return;

    const updateTimeLoop = () => {
      if (audioRef.current) {
        updateTime(audioRef.current.currentTime, audioRef.current.duration);
      }
      animationFrameRef.current = requestAnimationFrame(updateTimeLoop);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTimeLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateTime]);

  return {
    currentTrack,
    isPlaying,
    volume,
  };
}
