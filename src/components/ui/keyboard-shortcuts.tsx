'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Audio Player
  { keys: ['Space'], description: 'Play/Pause current track', category: 'Audio Player' },
  { keys: ['←', '→'], description: 'Previous/Next track', category: 'Audio Player' },
  { keys: ['↑', '↓'], description: 'Volume up/down', category: 'Audio Player' },

  // Battles
  { keys: ['1'], description: 'Vote for track 1', category: 'Battles' },
  { keys: ['2'], description: 'Vote for track 2', category: 'Battles' },
  { keys: ['Z'], description: 'Undo last vote', category: 'Battles' },

  // Tier Lists
  { keys: ['Ctrl', 'S'], description: 'Save tier list (Mac: ⌘S)', category: 'Tier Lists' },

  // Global
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Global' },
  { keys: ['Esc'], description: 'Close modal/dialog', category: 'Global' },
];

export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key to open
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const categories = [...new Set(SHORTCUTS.map((s) => s.category))];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-4 z-40 p-3 bg-card border-2 border-border rounded-full shadow-lg hover:border-spotify-green transition-colors"
        title="Keyboard Shortcuts (Press ?)"
      >
        <Keyboard className="w-5 h-5" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="bg-card border-2 border-border rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-spotify-green/10 rounded-lg">
                      <Keyboard className="w-6 h-6 text-spotify-green" />
                    </div>
                    <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-border rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Shortcuts List */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {categories.map((category) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {SHORTCUTS.filter((s) => s.category === category).map(
                          (shortcut, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-background rounded-lg"
                            >
                              <span className="text-sm">{shortcut.description}</span>
                              <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, i) => (
                                  <span key={i} className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-border rounded text-xs font-mono">
                                      {key}
                                    </kbd>
                                    {i < shortcut.keys.length - 1 && (
                                      <span className="text-muted-foreground text-xs">+</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background/50 text-center text-sm text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-border rounded text-xs">?</kbd> anytime to
                  view shortcuts
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
