'use client';

import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Music, List, Swords, Settings, LogOut, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardClientProps {
  session: Session;
}

export function DashboardClient({ session }: DashboardClientProps) {
  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">SpotifyVS</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user.isPremium && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Premium
              </span>
            )}
            <div className="flex items-center gap-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground text-lg">
            What would you like to create today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/tier-lists/new"
            className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <List className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">New Tier List</h3>
              <p className="text-muted-foreground">
                Rank your favorite songs from S-tier to F-tier with drag-and-drop
              </p>
              <div className="flex items-center gap-2 mt-4 text-primary font-semibold">
                <Plus className="h-5 w-5" />
                <span>Create Tier List</span>
              </div>
            </div>
          </Link>

          <Link
            href="/battles/new"
            className="group relative overflow-hidden bg-gradient-to-br from-destructive/10 to-destructive/5 border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl group-hover:bg-destructive/10 transition-colors" />
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Swords className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold mb-2">New Battle</h3>
              <p className="text-muted-foreground">
                Run tournament-style battles to find your ultimate favorite track
              </p>
              <div className="flex items-center gap-2 mt-4 text-destructive font-semibold">
                <Plus className="h-5 w-5" />
                <span>Start Battle</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <List className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tier Lists</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <Link
              href="/tier-lists"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Swords className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Battles</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            <Link
              href="/battles"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Settings</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
            <Link
              href="/settings"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Configure <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
