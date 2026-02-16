import { create } from 'zustand';
import { type Track } from '@/types/spotify';

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
  autoPlay: boolean;
  crossfadeDuration: number;
  audioElement: HTMLAudioElement | null;
  nextAudioElement: HTMLAudioElement | null;
  currentTime: number;
  duration: number;
}

interface AudioActions {
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  toggleAutoPlay: () => void;
  setCrossfadeDuration: (duration: number) => void;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  setNextAudioElement: (element: HTMLAudioElement | null) => void;
  updateTime: (time: number, duration: number) => void;
  reset: () => void;
}

type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  currentTrack: null,
  isPlaying: false,
  volume: typeof window !== 'undefined' ? parseFloat(localStorage.getItem('audio-volume') || '0.7') : 0.7,
  queue: [],
  queueIndex: -1,
  autoPlay: typeof window !== 'undefined' ? localStorage.getItem('audio-autoplay') === 'true' : true,
  crossfadeDuration: typeof window !== 'undefined' ? parseInt(localStorage.getItem('audio-crossfade') || '3') : 3,
  audioElement: null,
  nextAudioElement: null,
  currentTime: 0,
  duration: 0,
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  ...initialState,

  play: (track: Track) => {
    const { audioElement, volume } = get();

    if (!audioElement || !track.previewUrl) return;

    // Stop current playback
    audioElement.pause();
    audioElement.currentTime = 0;

    // Load and play new track
    audioElement.src = track.previewUrl;
    audioElement.volume = volume;
    audioElement.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
    });
  },

  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },

  resume: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.play().catch((error) => {
        console.error('Failed to resume audio:', error);
      });
    }
    set({ isPlaying: true });
  },

  next: () => {
    const { queue, queueIndex, autoPlay } = get();
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      set({ queueIndex: nextIndex });
      if (autoPlay) {
        get().play(queue[nextIndex]);
      }
    }
  },

  previous: () => {
    const { queue, queueIndex, autoPlay } = get();
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      set({ queueIndex: prevIndex });
      if (autoPlay) {
        get().play(queue[prevIndex]);
      }
    }
  },

  seek: (time: number) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (volume: number) => {
    const { audioElement, nextAudioElement } = get();
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (audioElement) {
      audioElement.volume = clampedVolume;
    }
    if (nextAudioElement) {
      nextAudioElement.volume = clampedVolume;
    }

    localStorage.setItem('audio-volume', clampedVolume.toString());
    set({ volume: clampedVolume });
  },

  setQueue: (tracks: Track[], startIndex = 0) => {
    set({ queue: tracks, queueIndex: startIndex });
    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      get().play(tracks[startIndex]);
    }
  },

  toggleAutoPlay: () => {
    const newAutoPlay = !get().autoPlay;
    localStorage.setItem('audio-autoplay', newAutoPlay.toString());
    set({ autoPlay: newAutoPlay });
  },

  setCrossfadeDuration: (duration: number) => {
    localStorage.setItem('audio-crossfade', duration.toString());
    set({ crossfadeDuration: duration });
  },

  setAudioElement: (element: HTMLAudioElement | null) => {
    set({ audioElement: element });
  },

  setNextAudioElement: (element: HTMLAudioElement | null) => {
    set({ nextAudioElement: element });
  },

  updateTime: (time: number, duration: number) => {
    set({ currentTime: time, duration });
  },

  reset: () => {
    const { audioElement, nextAudioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    if (nextAudioElement) {
      nextAudioElement.pause();
      nextAudioElement.src = '';
    }
    set({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      queueIndex: -1,
      currentTime: 0,
      duration: 0,
    });
  },
}));
