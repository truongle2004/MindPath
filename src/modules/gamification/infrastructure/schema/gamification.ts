import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '@/modules/user/infrastructure/schema/users';

export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  xpTotal: integer('xp_total').default(0).notNull(),
  level: smallint('level').default(1).notNull(),
  totalFocusMinutes: integer('total_focus_minutes').default(0).notNull(),
  totalCardsReviewed: integer('total_cards_reviewed').default(0).notNull(),
  totalSessions: integer('total_sessions').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const streaks = pgTable(
  'streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    streakDate: date('streak_date').notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    completedToday: boolean('completed_today').default(false).notNull(),
  },
  (table) => [uniqueIndex('idx_streaks_user_date').on(table.userId, table.streakDate)],
);

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 80 }).notNull().unique(),
  description: text('description').notNull(),
  iconKey: varchar('icon_key', { length: 50 }).notNull(),
  triggerType: varchar('trigger_type', { length: 40 }).notNull(),
  triggerValue: integer('trigger_value').notNull(),
});

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('idx_user_badges_unique').on(table.userId, table.badgeId)],
);

export const dailyProgress = pgTable(
  'daily_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
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

export type UserStatsRow = typeof userStats.$inferSelect;
export type StreakRow = typeof streaks.$inferSelect;
export type BadgeRow = typeof badges.$inferSelect;
export type UserBadgeRow = typeof userBadges.$inferSelect;
export type DailyProgressRow = typeof dailyProgress.$inferSelect;

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  user: one(users, {
    fields: [dailyProgress.userId],
    references: [users.id],
  }),
}));
