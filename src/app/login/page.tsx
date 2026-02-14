'use client';

import { signIn } from 'next-auth/react';
import { Music, Sparkles, Trophy, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const handleSpotifyLogin = async () => {
    await signIn('spotify', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SpotifyVS
            </h1>
          </div>

          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Rank Your Music.
            <br />
            <span className="text-muted-foreground">Battle Your Favorites.</span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Create stunning tier lists and run tournament-style battles with your Spotify library.
            Discover your true favorites through head-to-head matchups.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Drag & Drop Tier Lists</h3>
                <p className="text-sm text-muted-foreground">
                  Rank your songs from S-tier to F-tier with a beautiful, intuitive interface.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Tournament Battles</h3>
                <p className="text-sm text-muted-foreground">
                  Run bracket-style tournaments to find your ultimate favorite track.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Share & Export</h3>
                <p className="text-sm text-muted-foreground">
                  Export beautiful PNG images and share your rankings with friends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Get Started</h3>
              <p className="text-muted-foreground">
                Connect your Spotify account to begin ranking your music
              </p>
            </div>

            <button
              onClick={handleSpotifyLogin}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            >
              <Music className="h-5 w-5" />
              Login with Spotify
            </button>

            <div className="space-y-3 text-center text-sm text-muted-foreground">
              <p>
                We only request read access to your library.
                <br />
                No API keys needed from you.
              </p>
              <p className="text-xs">
                By continuing, you agree to connect your Spotify account and allow us to access your
                music library to create tier lists and battles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
