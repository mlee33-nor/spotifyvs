import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AudioPlayer } from "@/components/audio/audio-player";
import { KeyboardShortcutsButton } from "@/components/ui/keyboard-shortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotifyVS - Premium Tier Lists & Battle Platform",
  description: "Create stunning tier lists and tournament-style battles with your Spotify music. Rank your favorite songs, run versus battles, and share with friends.",
  keywords: ["spotify", "tier list", "music ranking", "versus battle", "tournament bracket", "music comparison"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <AudioPlayer />
          <KeyboardShortcutsButton />
        </Providers>
      </body>
    </html>
  );
}
