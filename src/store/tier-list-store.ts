import { create } from 'zustand';
import { Track } from '@/types/spotify';

export interface TierListState {
  // Tier structure: Record<tierLabel, Track[]>
  tiers: Record<string, Track[]>;
  // Unranked tracks pool
  unranked: Track[];
  // Current tier list metadata
  title: string;
  description: string;
  // Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  initializeTiers: (tracks: Track[], tierLabels?: string[]) => void;
  moveTrack: (trackId: string, fromTier: string | 'unranked', toTier: string | 'unranked', index?: number) => void;
  addTier: (label: string) => void;
  removeTier: (label: string) => void;
  reorderTier: (tierLabel: string, fromIndex: number, toIndex: number) => void;
  resetTiers: () => void;
  getTierList: () => { tiers: Record<string, Track[]>; unranked: Track[] };
}

const DEFAULT_TIER_LABELS = ['S', 'A', 'B', 'C', 'D', 'F'];

export const useTierListStore = create<TierListState>((set, get) => ({
  tiers: {},
  unranked: [],
  title: 'Untitled Tier List',
  description: '',

  setTitle: (title) => set({ title }),

  setDescription: (description) => set({ description }),

  initializeTiers: (tracks, tierLabels = DEFAULT_TIER_LABELS) => {
    const initialTiers: Record<string, Track[]> = {};
    tierLabels.forEach(label => {
      initialTiers[label] = [];
    });

    set({
      tiers: initialTiers,
      unranked: [...tracks],
    });
  },

  moveTrack: (trackId, fromTier, toTier, index) => {
    const state = get();
    let track: Track | undefined;

    // Remove track from source
    if (fromTier === 'unranked') {
      const trackIndex = state.unranked.findIndex(t => t.id === trackId);
      if (trackIndex === -1) return;
      track = state.unranked[trackIndex];
      state.unranked.splice(trackIndex, 1);
    } else {
      const trackIndex = state.tiers[fromTier]?.findIndex(t => t.id === trackId);
      if (trackIndex === -1 || trackIndex === undefined) return;
      track = state.tiers[fromTier][trackIndex];
      state.tiers[fromTier].splice(trackIndex, 1);
    }

    if (!track) return;

    // Add track to destination
    if (toTier === 'unranked') {
      if (index !== undefined) {
        state.unranked.splice(index, 0, track);
      } else {
        state.unranked.push(track);
      }
    } else {
      if (!state.tiers[toTier]) {
        state.tiers[toTier] = [];
      }
      if (index !== undefined) {
        state.tiers[toTier].splice(index, 0, track);
      } else {
        state.tiers[toTier].push(track);
      }
    }

    set({
      tiers: { ...state.tiers },
      unranked: [...state.unranked],
    });
  },

  addTier: (label) => {
    const state = get();
    if (state.tiers[label]) return; // Tier already exists

    set({
      tiers: {
        ...state.tiers,
        [label]: [],
      },
    });
  },

  removeTier: (label) => {
    const state = get();
    if (!state.tiers[label]) return;

    // Move tracks from removed tier to unranked
    const tracksToMove = state.tiers[label];
    const { [label]: removed, ...remainingTiers } = state.tiers;

    set({
      tiers: remainingTiers,
      unranked: [...state.unranked, ...tracksToMove],
    });
  },

  reorderTier: (tierLabel, fromIndex, toIndex) => {
    const state = get();
    const tier = state.tiers[tierLabel];
    if (!tier) return;

    const [movedTrack] = tier.splice(fromIndex, 1);
    tier.splice(toIndex, 0, movedTrack);

    set({
      tiers: { ...state.tiers },
    });
  },

  resetTiers: () => {
    const state = get();
    const allTracks: Track[] = [
      ...state.unranked,
      ...Object.values(state.tiers).flat(),
    ];

    const initialTiers: Record<string, Track[]> = {};
    DEFAULT_TIER_LABELS.forEach(label => {
      initialTiers[label] = [];
    });

    set({
      tiers: initialTiers,
      unranked: allTracks,
    });
  },

  getTierList: () => {
    const state = get();
    return {
      tiers: state.tiers,
      unranked: state.unranked,
    };
  },
}));
