export type BadgeTriggerType =
  | 'streak_days'
  | 'cards_reviewed'
  | 'focus_minutes'
  | 'pomodoro_cycles'
  | 'level_reached';

export type UserStats = {
  id: string;
  userId: string;
  xpTotal: number;
  level: number;
  totalFocusMinutes: number;
  totalCardsReviewed: number;
  totalSessions: number;
  updatedAt: Date;
};

export type Streak = {
  id: string;
  userId: string;
  streakDate: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  triggerType: BadgeTriggerType;
  triggerValue: number;
};

export type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
};

export type DailyProgress = {
  id: string;
  userId: string;
  date: string;
  xpEarned: number;
  focusMinutes: number;
  cardsReviewed: number;
  pomodoroCycles: number;
  cardsNew: number;
  cardsAgain: number;
  streakDay: number;
};

export type UpsertDailyProgressInput = {
  userId: string;
  date: string;
  xpEarned?: number;
  focusMinutes?: number;
  cardsReviewed?: number;
  pomodoroCycles?: number;
  cardsNew?: number;
  cardsAgain?: number;
  streakDay?: number;
};
