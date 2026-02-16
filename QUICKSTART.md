# SpotifyVS Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Database Setup (REQUIRED)

**Without this, the app won't work!**

1. **Create Neon Account:**
   - Visit https://neon.tech
   - Click "Sign Up" (it's free!)
   - Sign up with GitHub or email

2. **Create Project:**
   - Click "New Project"
   - Name it "spotifyvs"
   - Select region closest to you
   - Click "Create Project"

3. **Get Connection String:**
   - You'll see a connection string like this:
     ```
     postgresql://alex:AbC123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - Click the "Copy" button

4. **Update Environment File:**
   - Open `.env.local` in your project
   - Find the line: `POSTGRES_URL=placeholder_postgres_url`
   - Replace it with your connection string:
     ```env
     POSTGRES_URL=postgresql://alex:AbC123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - Save the file

5. **Create Database Tables:**
   ```bash
   npm run db:push
   ```

   You should see:
   ```
   ✓ Pushing schema to database...
   ✓ Done!
   ```

### Step 2: Start the App

```bash
npm run dev
```

Visit http://localhost:3000

### Step 3: Sign In

1. Click "Sign in with Spotify"
2. Authorize the app
3. You'll be redirected to the dashboard

### Step 4: Create Your First Tier List

1. **Click "New Tier List"** on the dashboard

2. **Choose "Top Tracks"**
   - Select "Last 6 Months"
   - Keep the default 50 tracks
   - Click "Continue to Tier Labels"

3. **Customize Tier Labels (Optional)**
   - Default labels are: S, A, B, C, D, F
   - You can rename them or add/remove tiers
   - Click "Create Tier List"

4. **Rank Your Tracks**
   - Drag tracks from the "Unranked" section to tier rows
   - Drop them in S tier (best) down to F tier (worst)
   - Hear previews by clicking the play button on any track

5. **Save Your Tier List**
   - Add a title (e.g., "My Top Tracks 2026")
   - Add a description (optional)
   - Click "Save" (or press Ctrl/Cmd + S)

6. **View Your Tier List**
   - You'll be redirected to the tier list detail page
   - Share it, export it, or edit it anytime!

## 🎵 Try These Features

### Audio Player
- Click play on any track to hear a 30-second preview
- Player appears at bottom of screen
- Keyboard shortcuts:
  - **Space**: Play/pause
  - **Left Arrow**: Previous track
  - **Right Arrow**: Next track

### Create from Different Sources
- **Saved Tracks**: Your liked songs
- **Playlist**: Choose any of your playlists
- **Artist**: Search for an artist and rank their top tracks

### Manage Tier Lists
- View all tier lists: `/tier-lists`
- Filter by: All / Public / Private
- Edit existing tier lists
- Delete tier lists
- Share tier lists (copy link)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Save tier list |
| Space | Play/pause audio |
| Left Arrow | Previous track |
| Right Arrow | Next track |
| Escape | Cancel drag (when dragging) |

## 🎨 Customization

### Change Tier Labels

You can customize tier labels when creating a tier list:
- Default: S, A, B, C, D, F
- Popular alternatives:
  - God, Great, Good, Okay, Bad, Trash
  - SSS, SS, S, A, B, C
  - 5★, 4★, 3★, 2★, 1★
  - Amazing, Good, Meh, Bad, Awful

### Theme Toggle

The app supports dark and light themes (auto-detected from system).
Settings page coming soon for manual toggle!

## 🐛 Troubleshooting

### "Database connection failed"
- Check that `POSTGRES_URL` in `.env.local` is correct
- Make sure you ran `npm run db:push`
- Restart the dev server (`npm run dev`)

### "No tracks loading"
- Make sure you're signed in with Spotify
- Check that you have Spotify activity (top tracks, saved songs, playlists)
- Try a different source (e.g., Saved Tracks instead of Top Tracks)

### "Drag and drop not working"
- Make sure you're clicking and holding on the track card
- Try dragging from the drag handle (six dots icon)
- On mobile: long-press to start dragging

### "Audio not playing"
- Not all tracks have preview URLs (Spotify limitation)
- Check your volume level
- Make sure browser audio is not muted

## 📱 Mobile Support

The app is responsive and works on mobile devices:
- Touch support for drag and drop (long-press)
- Simplified layouts for small screens
- Bottom player optimized for mobile

## 🔜 Coming Soon

Features not yet implemented but coming soon:
- ⚔️ **Battle System**: Tournament-style track battles
- 📥 **PNG Export**: Download tier lists as images
- ⚙️ **Settings**: Customize defaults and preferences
- 🔗 **Public Sharing**: Share tier lists with view-only links
- 🎉 **More Animations**: Confetti, transitions, and delightful interactions

## 🆘 Need Help?

- Check `IMPLEMENTATION_STATUS.md` for detailed feature list
- Review the plan document for architecture details
- Check console for error messages
- Make sure all dependencies are installed (`npm install`)

## 🎯 Quick Links

- Dashboard: http://localhost:3000/dashboard
- New Tier List: http://localhost:3000/tier-lists/new
- My Tier Lists: http://localhost:3000/tier-lists
- Settings: http://localhost:3000/settings (coming soon)

---

**Happy Ranking! 🎵**

If you complete these steps successfully, you'll have a working tier list creator. From there, you can explore creating tier lists from different sources, playing with drag-and-drop, and sharing your rankings!
