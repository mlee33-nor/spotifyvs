'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TierRow } from './tier-row';
import { UnrankedPool } from './unranked-pool';
import { TrackCard } from '@/components/track/track-card';
import { useTierListStore } from '@/store/tier-list-store';
import { type Track } from '@/types/spotify';
import { Save, RotateCcw } from 'lucide-react';

interface TierListBuilderProps {
  initialTracks: Track[];
  tierLabels: string[];
  onSave?: (data: { title: string; description: string; tiers: Record<string, Track[]> }) => void;
  autoSaveKey?: string;
}

export function TierListBuilder({
  initialTracks,
  tierLabels,
  onSave,
  autoSaveKey,
}: TierListBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const { tiers, initializeTiers, moveTrack, getTierList, resetTiers } = useTierListStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize tiers on mount
  useEffect(() => {
    // Try to restore from localStorage if autoSaveKey is provided
    if (autoSaveKey) {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setTitle(data.title || '');
          setDescription(data.description || '');
          initializeTiers(initialTracks, tierLabels, data.tiers);
          return;
        } catch (e) {
          console.error('Failed to restore tier list:', e);
        }
      }
    }

    initializeTiers(initialTracks, tierLabels);
  }, [initialTracks, tierLabels, autoSaveKey]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!autoSaveKey) return;

    const timeoutId = setTimeout(() => {
      const data = {
        title,
        description,
        tiers: getTierList(),
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(data));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, description, tiers, autoSaveKey]);

  // Find the active track
  const activeTrack = activeId ? findTrack(activeId) : null;

  function findTrack(id: string): Track | null {
    for (const tier of Object.values(tiers)) {
      const track = tier.tracks.find(t => t.id === id);
      if (track) return track;
    }
    return null;
  }

  function findContainer(id: string): string | null {
    if (id === 'unranked') return 'unranked';

    for (const [tierLabel, tier] of Object.entries(tiers)) {
      if (id === `tier-${tierLabel}`) return tierLabel;
      if (tier.tracks.some(t => t.id === id)) return tierLabel;
    }

    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      setOverId(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    setOverId(overContainer);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // If dropping on the same container, no need to move
    if (activeContainer === overContainer) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    // Move track to new container
    if (overContainer) {
      moveTrack(active.id as string, activeContainer, overContainer, 0);
    }

    setActiveId(null);
    setOverId(null);
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverId(null);
  }

  function handleSave() {
    if (!onSave) return;

    onSave({
      title: title.trim() || 'Untitled Tier List',
      description: description.trim(),
      tiers: getTierList(),
    });
  }

  function handleReset() {
    if (confirm('Are you sure you want to reset? This will move all tracks back to unranked.')) {
      resetTiers();
      setTitle('');
      setDescription('');
      if (autoSaveKey) {
        localStorage.removeItem(autoSaveKey);
      }
    }
  }

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [title, description, tiers]);

  const unrankedTracks = tiers.unranked?.tracks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 space-y-3 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter tier list title..."
            className="w-full text-2xl font-bold px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-border hover:border-destructive hover:text-destructive transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!onSave}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Tier List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-4">
          {tierLabels.map((label) => (
            <TierRow
              key={label}
              label={label}
              tracks={tiers[label]?.tracks || []}
              isOver={overId === label}
            />
          ))}
        </div>

        <UnrankedPool tracks={unrankedTracks} isOver={overId === 'unranked'} />

        <DragOverlay>
          {activeTrack ? (
            <div className="rotate-3 scale-110 cursor-grabbing">
              <TrackCard track={activeTrack} variant="compact" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground text-center space-y-1">
        <p>Drag tracks to rank them in tiers</p>
        <p>Press Ctrl/Cmd + S to save</p>
      </div>
    </div>
  );
}
