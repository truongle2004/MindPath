import {
  createDrizzleCardRepository,
  createDrizzleCardReviewRepository,
  createDrizzleDeckRepository,
  createDrizzlePomodoroSessionRepository,
} from '@/modules/flashcard/infrastructure/respositories/drizzle-flashcard.repository';
import {
  createDrizzleBadgeRepository,
  createDrizzleDailyProgressRepository,
  createDrizzleStreakRepository,
  createDrizzleUserBadgeRepository,
  createDrizzleUserStatsRepository,
} from '@/modules/gamification/infrastructure/respositories/drizzle-gamification.repository';
import { createDrizzleUserRepository } from '@/modules/user/infrastructure/respositories/drizzle-user.repository';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Wires Drizzle repository implementations for all modules.
 * @param db The database client.
 * @returns Repository instances for each bounded context.
 */
export const createRepositories = (db: DbClient) => ({
  user: createDrizzleUserRepository(db),
  deck: createDrizzleDeckRepository(db),
  card: createDrizzleCardRepository(db),
  cardReview: createDrizzleCardReviewRepository(db),
  pomodoroSession: createDrizzlePomodoroSessionRepository(db),
  userStats: createDrizzleUserStatsRepository(db),
  streak: createDrizzleStreakRepository(db),
  badge: createDrizzleBadgeRepository(db),
  userBadge: createDrizzleUserBadgeRepository(db),
  dailyProgress: createDrizzleDailyProgressRepository(db),
});

export type Repositories = ReturnType<typeof createRepositories>;
