import type {
  Badge,
  DailyProgress,
  Streak,
  UpsertDailyProgressInput,
  UserBadge,
  UserStats,
} from '@/modules/gamification/entities/models/gamification';

export type UserStatsRepository = {
  findByUserId: (userId: string) => Promise<UserStats | null>;
  createForUser: (userId: string) => Promise<UserStats>;
};

export type StreakRepository = {
  findByUserAndDate: (userId: string, streakDate: string) => Promise<Streak | null>;
  upsert: (streak: Omit<Streak, 'id'>) => Promise<Streak>;
};

export type BadgeRepository = {
  findAll: () => Promise<Badge[]>;
  findById: (id: string) => Promise<Badge | null>;
};

export type UserBadgeRepository = {
  findByUserId: (userId: string) => Promise<UserBadge[]>;
  award: (userId: string, badgeId: string) => Promise<UserBadge>;
};

export type DailyProgressRepository = {
  findByUserAndDate: (userId: string, date: string) => Promise<DailyProgress | null>;
  upsert: (input: UpsertDailyProgressInput) => Promise<DailyProgress>;
};
