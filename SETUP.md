# SpotifyVS Setup Guide

## Phase 1: Project Foundation & Authentication ✅

### What's Been Completed

1. **Project Structure**
   - ✅ Next.js 15 with TypeScript and App Router
   - ✅ Tailwind CSS 4 with Spotify green theme colors
   - ✅ shadcn/ui components initialized
   - ✅ Project directory structure created

2. **Dependencies Installed**
   - ✅ NextAuth.js v5 for authentication
   - ✅ spotify-web-api-node for Spotify API
   - ✅ Drizzle ORM for database
   - ✅ TanStack Query for server state
   - ✅ Zustand for client state
   - ✅ Framer Motion for animations
   - ✅ @dnd-kit for drag-and-drop
   - ✅ All supporting libraries

3. **Core Files Created**
   - ✅ Database schema (`src/lib/db/schema.ts`)
   - ✅ NextAuth configuration (`src/lib/auth/auth.config.ts`)
   - ✅ Spotify API client (`src/lib/spotify/client.ts`)
   - ✅ Zustand stores for tier lists and battles
   - ✅ Type definitions for Spotify data
   - ✅ Login and Dashboard pages

4. **Configuration**
   - ✅ Tailwind with Spotify green colors and tier gradients
   - ✅ TypeScript strict mode
   - ✅ App layout with providers (Session, Query, Theme)
   - ✅ Authentication flow (login → dashboard)

---

## Next Steps: Required Setup

### 1. Create Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in app details:
   - **App Name**: SpotifyVS (or your choice)
   - **App Description**: Music ranking and battle platform
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/spotify`
   - **API Scopes**: (will be requested automatically by NextAuth)
4. Save your app and copy:
   - **Client ID**
   - **Client Secret**

### 2. Set Up Database

**Option A: Neon (Recommended)**
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string

**Option B: Vercel Postgres (Deprecated)**
Note: @vercel/postgres is deprecated. If you still want to use it:
1. Go to Vercel Dashboard → Storage
2. Create a Postgres database
3. Copy connection strings

### 3. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your `.env.local`:
   ```env
   # Spotify OAuth
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_generated_secret_here

   # Database
   POSTGRES_URL=your_postgres_connection_string
   ```

3. Generate NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```

### 4. Run Database Migrations

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you should be redirected to the login page.

---

## Project Structure

```
spotifyvs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Dashboard (protected)
│   │   └── api/auth/           # NextAuth API routes
│   ├── components/             # React components
│   │   ├── tier-list/          # Tier list components (Phase 2)
│   │   ├── battle/             # Battle components (Phase 3)
│   │   ├── spotify/            # Music player components (Phase 4)
│   │   └── shared/             # Shared UI components
│   ├── lib/                    # Core utilities
│   │   ├── auth/               # NextAuth configuration
│   │   ├── db/                 # Database schema and client
│   │   ├── spotify/            # Spotify API client
│   │   ├── audio/              # Audio playback (Phase 4)
│   │   └── battle/             # Battle logic (Phase 3)
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state stores
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── drizzle/                    # Database migrations (generated)
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio (database GUI)

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

## What's Next?

Once you've completed the setup above, the next phases to implement are:

### Phase 2: Tier List Builder
- Create tier list creation wizard
- Build drag-and-drop UI components
- Implement save/load functionality
- Add export to PNG

### Phase 3: Battle System
- Tournament bracket generation
- Head-to-head matchup UI
- Progress tracking
- Winner celebration

### Phase 4: Music Playback
- Audio player with preview URLs
- Mini player component
- Auto-play functionality
- Settings page

### Phase 5: Polish & Advanced Features
- Animations with Framer Motion
- Command menu (Cmd+K)
- Advanced filtering
- Public discovery page
- Mobile optimization

### Phase 6: Production Deployment
- Vercel deployment
- Custom domain
- SEO optimization
- Error tracking with Sentry

---

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
- Ensure your `.env.local` has correct connection strings
- Check that database is accessible
- Verify firewall settings for cloud databases

### Spotify OAuth errors
- Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/spotify`
- Check Client ID and Secret are correct
- Ensure app is not in Development Mode restrictions

### TypeScript errors
```bash
npm run build
```
This will show all TypeScript errors that need to be fixed.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Need Help?

- Check the plan document for detailed implementation steps
- Review the code comments in critical files
- Test the application flow step by step
- Use Drizzle Studio to inspect the database

**Current Status**: Phase 1 Complete ✅ - Ready for database setup and first login!
