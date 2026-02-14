import { pgTable, text, timestamp, boolean, jsonb, integer, varchar, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * Users table - stores Spotify user data and OAuth tokens
 */
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  spotifyId: text('spotify_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  imageUrl: text('image_url'),
  isPremium: boolean('is_premium').default(false),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  spotifyIdIdx: index('spotify_id_idx').on(table.spotifyId),
  emailIdx: index('email_idx').on(table.email),
}));

/**
 * Tier Lists table - user-created tier rankings
 */
export const tierLists = pgTable('tier_lists', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  // tiers structure: { S: [tracks], A: [tracks], B: [tracks], C: [tracks], D: [tracks], F: [tracks] }
  tiers: jsonb('tiers').notNull(),
  // sourceMetadata: { type: 'playlist' | 'top_tracks' | 'saved_tracks' | 'artist', id?: string, name?: string }
  sourceMetadata: jsonb('source_metadata'),
  thumbnailUrl: text('thumbnail_url'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('tier_lists_user_id_idx').on(table.userId),
  isPublicIdx: index('tier_lists_is_public_idx').on(table.isPublic),
  createdAtIdx: index('tier_lists_created_at_idx').on(table.createdAt),
}));

/**
 * Battles table - tournament-style versus battles
 */
export const battles = pgTable('battles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  format: integer('format').notNull(), // 4, 8, 16, 32, or 64
  // state structure: { rounds: Round[], currentRound: number, currentMatchup: number }
  state: jsonb('state').notNull(),
  // participants: array of track objects
  participants: jsonb('participants').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'), // 'in_progress' | 'completed'
  winnerId: text('winner_id'), // Spotify track ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('battles_user_id_idx').on(table.userId),
  statusIdx: index('battles_status_idx').on(table.status),
  createdAtIdx: index('battles_created_at_idx').on(table.createdAt),
}));

/**
 * Shared Content table - public sharing links with analytics
 */
export const sharedContent = pgTable('shared_content', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  shareId: varchar('share_id', { length: 21 }).notNull().unique(), // nanoid
  contentType: varchar('content_type', { length: 20 }).notNull(), // 'tier_list' | 'battle'
  contentId: text('content_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  shareIdIdx: index('shared_content_share_id_idx').on(table.shareId),
  contentIdIdx: index('shared_content_content_id_idx').on(table.contentId),
  userIdIdx: index('shared_content_user_id_idx').on(table.userId),
}));

/**
 * User Preferences table - user settings and preferences
 */
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 10 }).default('dark'), // 'dark' | 'light'
  defaultTierLabels: jsonb('default_tier_labels').default(['S', 'A', 'B', 'C', 'D', 'F']),
  autoPlayPreviews: boolean('auto_play_previews').default(true),
  crossfadeDuration: integer('crossfade_duration').default(3), // seconds
  // Additional preferences stored as flexible JSON
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_preferences_user_id_idx').on(table.userId),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type TierList = typeof tierLists.$inferSelect;
export type NewTierList = typeof tierLists.$inferInsert;
export type Battle = typeof battles.$inferSelect;
export type NewBattle = typeof battles.$inferInsert;
export type SharedContent = typeof sharedContent.$inferSelect;
export type NewSharedContent = typeof sharedContent.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
