import { todosSchema } from '@/core/infrastructure/todos/schema/todos';
import { counterSchema } from '@/infrastructure/database/counter';
import { cardsSchema } from '@/modules/flashcard/infrastructure/schema/cards';
import { decksSchema } from '@/modules/flashcard/infrastructure/schema/decks';
import { pomodoroSessionsSchema } from '@/modules/flashcard/infrastructure/schema/pomodoro-sessions';
import {
  badgesSchema,
  cardReviewsSchema,
  dailyProgressSchema,
  streaksSchema,
  userBadgesSchema,
  userStatsSchema,
} from '@/modules/gamification/infrastructure/schema/gamification';
import { usersSchema } from '@/modules/user/infrastructure/schema/users';

export const databaseSchema = {
  counterSchema,
  todosSchema,
  usersSchema,
  decksSchema,
  cardsSchema,
  pomodoroSessionsSchema,
  badgesSchema,
  userStatsSchema,
  streaksSchema,
  userBadgesSchema,
  dailyProgressSchema,
  cardReviewsSchema,
};
