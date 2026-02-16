# SpotifyVS 🎵

**Premium Tier Lists & Battle Platform for Spotify**

A Next.js application that lets you create interactive tier lists and run tournament-style battles with your Spotify music.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Progress](https://img.shields.io/badge/progress-60%25-blue)

## ✨ Quick Start

**New to this project? Start here:**
1. 📖 Read [QUICKSTART.md](./QUICKSTART.md) - Get up and running in 5 minutes
2. 📊 Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - See what's built and what's coming

## 📋 Features

### ✅ Fully Implemented
- **🎵 Tier Lists**: Create stunning tier rankings from your Spotify library
  - Drag-and-drop interface with smooth animations
  - Multiple sources: Top Tracks, Saved Songs, Playlists, Artist Discography
  - Customizable tier labels and colors
  - Auto-save functionality
  - View, edit, and delete tier lists

- **🎧 Audio Preview**: Listen to 30-second previews while ranking
  - Integrated audio player with controls
  - Queue management
  - Keyboard shortcuts (Space, Arrow keys)
  - Volume persistence

- **📱 Responsive Design**: Works beautifully on all devices
  - Mobile-optimized drag-and-drop
  - Touch support
  - Adaptive layouts

### 🚧 Coming Soon
- **⚔️ VS Battles**: Tournament-style music showdowns
- **📥 PNG Export**: Download tier lists as images
- **🔗 Public Sharing**: Share with view-only links
- **⚙️ Settings**: Customize defaults and preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: NextAuth.js v5 with Spotify OAuth
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **State**: Zustand + TanStack Query
- **API**: Spotify Web API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Spotify account
- Neon account (free tier)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see below)

# 3. Push database schema
npm run db:push

# 4. Start development server
npm run dev
```

Visit http://localhost:3000

### Environment Variables

Create `.env.local`:

```env
# Spotify OAuth (get from https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret  # Generate: openssl rand -base64 32

# Database (get from https://neon.tech)
POSTGRES_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

**Detailed setup instructions**: See [QUICKSTART.md](./QUICKSTART.md)

## 🎮 Usage

### Creating a Tier List

1. Click "New Tier List" from dashboard
2. Choose a source (Top Tracks, Saved Songs, Playlist, or Artist)
3. Configure your selection
4. Customize tier labels (default: S, A, B, C, D, F)
5. Drag and drop tracks to rank them
6. Save and share!

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save tier list |
| Space | Play/pause audio |
| ← → | Previous/next track |
| Escape | Cancel drag |

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── spotify/         # Spotify API proxies
│   │   └── tier-lists/      # Tier list CRUD
│   ├── tier-lists/
│   │   ├── new/            # Source selection wizard
│   │   ├── create/         # Drag-and-drop builder
│   │   └── [id]/           # View/edit tier list
│   └── dashboard/           # Main dashboard
├── components/
│   ├── track/              # Track card component
│   ├── audio/              # Audio player
│   ├── tier-list/          # Tier list UI components
│   └── ui/                 # Base UI components
├── hooks/                   # React hooks
├── lib/
│   ├── auth/               # NextAuth configuration
│   ├── db/                 # Database schema
│   └── spotify/            # Spotify API client
├── store/                   # Zustand state stores
└── types/                   # TypeScript types
```

## 🔨 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (DB GUI)
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Detailed setup guide
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Feature status and roadmap

## 🐛 Troubleshooting

### Database connection failed
- Verify `POSTGRES_URL` in `.env.local`
- Ensure `npm run db:push` completed successfully
- Restart dev server

### No tracks loading
- Sign in with Spotify
- Check you have Spotify activity (top tracks, saved songs)
- Try different sources

### Drag-and-drop not working
- Click and hold on track card
- Use drag handle (⋮⋮ icon)
- Mobile: long-press to drag

## 🎯 Implementation Progress

- ✅ **Core Infrastructure** - Complete
- ✅ **Authentication** - Complete
- ✅ **Tier List System** - Complete (100%)
- ⏳ **Battle System** - Not started (0%)
- ⏳ **PNG Export** - Not started (0%)
- ⏳ **Settings** - Not started (0%)
- ⏳ **Public Sharing** - Not started (0%)

**Overall: ~60% complete**

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for details.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📝 License

MIT

---

**Made with ♥️ and Next.js**
