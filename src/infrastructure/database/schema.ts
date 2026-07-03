import { counterSchema } from '@/infrastructure/database/counter';
import {
  cardReviews,
  cardReviewsRelations,
  cards,
  cardsRelations,
} from '@/modules/flashcard/infrastructure/schema/cards';
import { decks } from '@/modules/flashcard/infrastructure/schema/decks';
import {
  decksRelations,
  pomodoroSessions,
  pomodoroSessionsRelations,
} from '@/modules/flashcard/infrastructure/schema/pomodoro-sessions';
import {
  badges,
  dailyProgress,
  dailyProgressRelations,
  streaks,
  streaksRelations,
  userBadges,
  userBadgesRelations,
  userStats,
  userStatsRelations,
} from '@/modules/gamification/infrastructure/schema/gamification';
import { users } from '@/modules/user/infrastructure/schema/users';

export const databaseSchema = {
  users,
  decks,
  cards,
  cardReviews,
  pomodoroSessions,
  userStats,
  streaks,
  badges,
  userBadges,
  dailyProgress,
  counterSchema,
  decksRelations,
  cardsRelations,
  cardReviewsRelations,
  pomodoroSessionsRelations,
  userStatsRelations,
  streaksRelations,
  userBadgesRelations,
  dailyProgressRelations,
};

export type DatabaseSchema = typeof databaseSchema;
