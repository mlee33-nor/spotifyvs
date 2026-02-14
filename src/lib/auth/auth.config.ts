import NextAuth, { NextAuthConfig, User, Session } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { JWT } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Spotify OAuth scopes needed for the app
 */
const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-read-playback-state',
].join(' ');

/**
 * Refresh Spotify access token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = 'https://accounts.spotify.com/api/token';
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Update token in database
    if (token.userId) {
      await db
        .update(users)
        .set({
          accessToken: refreshedTokens.access_token,
          tokenExpiresAt: new Date(Date.now() + refreshedTokens.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(eq(users.id, token.userId as string));
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * NextAuth configuration
 */
export const authConfig: NextAuthConfig = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'spotify' && profile) {
        try {
          // Check if user exists
          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.spotifyId, profile.id as string))
            .limit(1);

          const isPremium = (profile as any).product === 'premium';
          const tokenExpiresAt = account.expires_at
            ? new Date(account.expires_at * 1000)
            : new Date(Date.now() + 3600 * 1000);

          if (existingUsers.length > 0) {
            // Update existing user
            await db
              .update(users)
              .set({
                email: profile.email!,
                displayName: (profile as any).display_name,
                imageUrl: (profile as any).images?.[0]?.url,
                isPremium,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                tokenExpiresAt,
                updatedAt: new Date(),
              })
              .where(eq(users.spotifyId, profile.id as string));
          } else {
            // Create new user
            await db.insert(users).values({
              spotifyId: profile.id as string,
              email: profile.email!,
              displayName: (profile as any).display_name,
              imageUrl: (profile as any).images?.[0]?.url,
              isPremium,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              tokenExpiresAt,
            });
          }

          return true;
        } catch (error) {
          console.error('Error saving user to database:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, profile, user }): Promise<JWT> {
      // Initial sign in
      if (account && profile) {
        // Fetch the user from database to get our internal ID
        const dbUsers = await db
          .select()
          .from(users)
          .where(eq(users.spotifyId, profile.id as string))
          .limit(1);

        if (dbUsers.length > 0) {
          const dbUser = dbUsers[0];
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
            userId: dbUser.id,
            spotifyId: dbUser.spotifyId,
            isPremium: dbUser.isPremium,
          } as JWT;
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.userId as string,
          spotifyId: token.spotifyId as string,
          isPremium: token.isPremium as boolean,
        };
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
