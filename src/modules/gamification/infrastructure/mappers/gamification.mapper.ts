import type {
  Badge,
  BadgeTriggerType,
  DailyProgress,
  Streak,
  UserBadge,
  UserStats,
} from '@/modules/gamification/entities/models/gamification';
import type {
  BadgeRow,
  DailyProgressRow,
  StreakRow,
  UserBadgeRow,
  UserStatsRow,
} from '@/modules/gamification/infrastructure/schema/gamification';

const toBadgeTriggerType = (value: string): BadgeTriggerType => {
  if (
    value === 'streak_days' ||
    value === 'cards_reviewed' ||
    value === 'focus_minutes' ||
    value === 'pomodoro_cycles' ||
    value === 'level_reached'
  ) {
    return value;
  }
  return 'cards_reviewed';
};

export const toUserStats = (row: UserStatsRow): UserStats => ({
  id: row.id,
  userId: row.userId,
  xpTotal: row.xpTotal,
  level: row.level,
  totalFocusMinutes: row.totalFocusMinutes,
  totalCardsReviewed: row.totalCardsReviewed,
  totalSessions: row.totalSessions,
  updatedAt: row.updatedAt,
});

export const toStreak = (row: StreakRow): Streak => ({
  id: row.id,
  userId: row.userId,
  streakDate: row.streakDate,
  currentStreak: row.currentStreak,
  longestStreak: row.longestStreak,
  completedToday: row.completedToday,
});

export const toBadge = (row: BadgeRow): Badge => ({
  id: row.id,
  name: row.name,
  description: row.description,
  iconKey: row.iconKey,
  triggerType: toBadgeTriggerType(row.triggerType),
  triggerValue: row.triggerValue,
});

export const toUserBadge = (row: UserBadgeRow): UserBadge => ({
  id: row.id,
  userId: row.userId,
  badgeId: row.badgeId,
  earnedAt: row.earnedAt,
});

export const toDailyProgress = (row: DailyProgressRow): DailyProgress => ({
  id: row.id,
  userId: row.userId,
  date: row.date,
  xpEarned: row.xpEarned,
  focusMinutes: row.focusMinutes,
  cardsReviewed: row.cardsReviewed,
  pomodoroCycles: row.pomodoroCycles,
  cardsNew: row.cardsNew,
  cardsAgain: row.cardsAgain,
  streakDay: row.streakDay,
});
