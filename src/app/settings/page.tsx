'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  Music,
  LogOut,
  Save,
  User,
  Palette,
} from 'lucide-react';
import { PageTransition, StaggerChildren, StaggerItem } from '@/components/ui/page-transition';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';

const DEFAULT_TIER_LABELS = ['S', 'A', 'B', 'C', 'D', 'F'];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  // State
  const [tierLabels, setTierLabels] = useState<string[]>(DEFAULT_TIER_LABELS);
  const [autoPlayPreviews, setAutoPlayPreviews] = useState(true);
  const [defaultVolume, setDefaultVolume] = useState(70);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.defaultTierLabels) setTierLabels(data.defaultTierLabels);
        if (typeof data.autoPlayPreviews === 'boolean') setAutoPlayPreviews(data.autoPlayPreviews);
        if (data.preferences?.defaultVolume) setDefaultVolume(data.preferences.defaultVolume);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          defaultTierLabels: tierLabels,
          autoPlayPreviews,
          preferences: {
            defaultVolume,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTierLabel = () => {
    setTierLabels([...tierLabels, '']);
  };

  const handleUpdateTierLabel = (index: number, value: string) => {
    const newLabels = [...tierLabels];
    newLabels[index] = value.toUpperCase();
    setTierLabels(newLabels);
  };

  const handleRemoveTierLabel = (index: number) => {
    if (tierLabels.length > 1) {
      setTierLabels(tierLabels.filter((_, i) => i !== index));
    }
  };

  const handleResetTierLabels = () => {
    setTierLabels(DEFAULT_TIER_LABELS);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-4 text-spotify-green">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your SpotifyVS experience
          </p>
        </div>

        <StaggerChildren className="space-y-6">
          {/* Account Section */}
          <StaggerItem>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-card border-2 border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-spotify-green/10 rounded-lg">
                  <User className="w-5 h-5 text-spotify-green" />
                </div>
                <h2 className="text-2xl font-semibold">Account</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {session?.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-lg">{session?.user?.name}</div>
                    <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Appearance Section */}
          <StaggerItem>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-card border-2 border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-2xl font-semibold">Appearance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all flex items-center gap-3',
                        theme === 'light'
                          ? 'border-spotify-green bg-spotify-green/10'
                          : 'border-border hover:border-spotify-green/50'
                      )}
                    >
                      <Sun className="w-5 h-5" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all flex items-center gap-3',
                        theme === 'dark'
                          ? 'border-spotify-green bg-spotify-green/10'
                          : 'border-border hover:border-spotify-green/50'
                      )}
                    >
                      <Moon className="w-5 h-5" />
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Audio Preferences */}
          <StaggerItem>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-card border-2 border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold">Audio</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-play Previews</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically play track previews on hover
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoPlayPreviews(!autoPlayPreviews)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      autoPlayPreviews ? 'bg-spotify-green' : 'bg-border'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                        autoPlayPreviews ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Default Volume: {defaultVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={defaultVolume}
                    onChange={(e) => setDefaultVolume(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Tier List Defaults */}
          <StaggerItem>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-card border-2 border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Music className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-semibold">Tier List Defaults</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">Default Tier Labels</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleResetTierLabels}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Reset to Default
                      </button>
                      <button
                        onClick={handleAddTierLabel}
                        className="text-sm text-spotify-green hover:underline"
                      >
                        + Add Tier
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tierLabels.map((label, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => handleUpdateTierLabel(index, e.target.value)}
                          maxLength={3}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-border focus:border-spotify-green focus:outline-none bg-background"
                          placeholder={`Tier ${index + 1}`}
                        />
                        {tierLabels.length > 1 && (
                          <button
                            onClick={() => handleRemoveTierLabel(index)}
                            className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerChildren>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-spotify-green text-black font-semibold rounded-full hover:bg-spotify-green/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
