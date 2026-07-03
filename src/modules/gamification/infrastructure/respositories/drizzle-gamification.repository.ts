import { and, eq } from 'drizzle-orm';
import { pickDefined } from '@/lib/pick-defined';
import type {
  BadgeRepository,
  DailyProgressRepository,
  StreakRepository,
  UserBadgeRepository,
  UserStatsRepository,
} from '@/modules/gamification/application/repositories/gamification.repository';
import {
  toBadge,
  toDailyProgress,
  toStreak,
  toUserBadge,
  toUserStats,
} from '@/modules/gamification/infrastructure/mappers/gamification.mapper';
import {
  badges,
  dailyProgress,
  streaks,
  userBadges,
  userStats,
} from '@/modules/gamification/infrastructure/schema/gamification';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Creates a Drizzle-backed user stats repository.
 * @param db The database client.
 * @returns A user stats repository implementation.
 */
export const createDrizzleUserStatsRepository = (db: DbClient): UserStatsRepository => ({
  findByUserId: async (userId) => {
    const [row] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    return row ? toUserStats(row) : null;
  },

  createForUser: async (userId) => {
    const [row] = await db.insert(userStats).values({ userId }).returning();

    if (!row) {
      throw new Error('Failed to create user stats');
    }

    return toUserStats(row);
  },
});

/**
 * Creates a Drizzle-backed streak repository.
 * @param db The database client.
 * @returns A streak repository implementation.
 */
export const createDrizzleStreakRepository = (db: DbClient): StreakRepository => ({
  findByUserAndDate: async (userId, streakDate) => {
    const [row] = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.userId, userId), eq(streaks.streakDate, streakDate)))
      .limit(1);

    return row ? toStreak(row) : null;
  },

  upsert: async (input) => {
    const [row] = await db
      .insert(streaks)
      .values({
        userId: input.userId,
        streakDate: input.streakDate,
        currentStreak: input.currentStreak,
        longestStreak: input.longestStreak,
        completedToday: input.completedToday,
      })
      .onConflictDoUpdate({
        target: [streaks.userId, streaks.streakDate],
        set: {
          currentStreak: input.currentStreak,
          longestStreak: input.longestStreak,
          completedToday: input.completedToday,
        },
      })
      .returning();

    if (!row) {
      throw new Error('Failed to upsert streak');
    }

    return toStreak(row);
  },
});

/**
 * Creates a Drizzle-backed badge repository.
 * @param db The database client.
 * @returns A badge repository implementation.
 */
export const createDrizzleBadgeRepository = (db: DbClient): BadgeRepository => ({
  findAll: async () => {
    const rows = await db.select().from(badges);
    return rows.map(toBadge);
  },

  findById: async (id) => {
    const [row] = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
    return row ? toBadge(row) : null;
  },
});

/**
 * Creates a Drizzle-backed user badge repository.
 * @param db The database client.
 * @returns A user badge repository implementation.
 */
export const createDrizzleUserBadgeRepository = (db: DbClient): UserBadgeRepository => ({
  findByUserId: async (userId) => {
    const rows = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
    return rows.map(toUserBadge);
  },

  award: async (userId, badgeId) => {
    const [row] = await db.insert(userBadges).values({ userId, badgeId }).returning();

    if (!row) {
      throw new Error('Failed to award badge');
    }

    return toUserBadge(row);
  },
});

/**
 * Creates a Drizzle-backed daily progress repository.
 * @param db The database client.
 * @returns A daily progress repository implementation.
 */
export const createDrizzleDailyProgressRepository = (db: DbClient): DailyProgressRepository => ({
  findByUserAndDate: async (userId, date) => {
    const [row] = await db
      .select()
      .from(dailyProgress)
      .where(and(eq(dailyProgress.userId, userId), eq(dailyProgress.date, date)))
      .limit(1);

    return row ? toDailyProgress(row) : null;
  },

  upsert: async (input) => {
    const [row] = await db
      .insert(dailyProgress)
      .values({
        userId: input.userId,
        date: input.date,
        xpEarned: input.xpEarned ?? 0,
        focusMinutes: input.focusMinutes ?? 0,
        cardsReviewed: input.cardsReviewed ?? 0,
        pomodoroCycles: input.pomodoroCycles ?? 0,
        cardsNew: input.cardsNew ?? 0,
        cardsAgain: input.cardsAgain ?? 0,
        streakDay: input.streakDay ?? 0,
      })
      .onConflictDoUpdate({
        target: [dailyProgress.userId, dailyProgress.date],
        set: pickDefined({
          xpEarned: input.xpEarned,
          focusMinutes: input.focusMinutes,
          cardsReviewed: input.cardsReviewed,
          pomodoroCycles: input.pomodoroCycles,
          cardsNew: input.cardsNew,
          cardsAgain: input.cardsAgain,
          streakDay: input.streakDay,
        }),
      })
      .returning();

    if (!row) {
      throw new Error('Failed to upsert daily progress');
    }

    return toDailyProgress(row);
  },
});
