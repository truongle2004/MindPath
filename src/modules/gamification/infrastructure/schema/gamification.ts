import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersSchema } from '@/modules/user/infrastructure/schema/users';

/** Badge definitions seeded at deployment. */
export const badgesSchema = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 80 }).notNull().unique(),
  description: text('description').notNull(),
  iconKey: varchar('icon_key', { length: 50 }).notNull(),
  triggerType: varchar('trigger_type', { length: 40 }).notNull(),
  triggerValue: integer('trigger_value').notNull(),
});

/** Per-user gamification stats. */
export const userStatsSchema = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersSchema.id, { onDelete: 'cascade' })
    .unique(),
  xpTotal: integer('xp_total').default(0).notNull(),
  level: smallint('level').default(1).notNull(),
  totalFocusMinutes: integer('total_focus_minutes').default(0).notNull(),
  totalCardsReviewed: integer('total_cards_reviewed').default(0).notNull(),
  totalSessions: integer('total_sessions').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/** Daily streak records. */
export const streaksSchema = pgTable(
  'streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    streakDate: date('streak_date').notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    completedToday: boolean('completed_today').default(false).notNull(),
  },
  (table) => [uniqueIndex('idx_streaks_user_date').on(table.userId, table.streakDate)],
);

/** Badges earned by users. */
export const userBadgesSchema = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badgesSchema.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('idx_user_badges_unique').on(table.userId, table.badgeId)],
);

/** Denormalized daily progress summaries. */
export const dailyProgressSchema = pgTable(
  'daily_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    xpEarned: integer('xp_earned').default(0).notNull(),
    focusMinutes: integer('focus_minutes').default(0).notNull(),
    cardsReviewed: integer('cards_reviewed').default(0).notNull(),
    pomodoroCycles: smallint('pomodoro_cycles').default(0).notNull(),
    cardsNew: integer('cards_new').default(0).notNull(),
    cardsAgain: integer('cards_again').default(0).notNull(),
    streakDay: integer('streak_day').default(0).notNull(),
  },
  (table) => [uniqueIndex('idx_daily_progress_user_date').on(table.userId, table.date)],
);

/** Immutable card review audit log. */
export const cardReviewsSchema = pgTable(
  'card_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    rating: smallint('rating').notNull(),
    stabilityBefore: real('stability_before').notNull(),
    stabilityAfter: real('stability_after').notNull(),
    difficultyAfter: real('difficulty_after').notNull(),
    scheduledDays: integer('scheduled_days').notNull(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_card_reviews_card_id').on(table.cardId),
    index('idx_card_reviews_user_date').on(table.userId, table.reviewedAt),
  ],
);
