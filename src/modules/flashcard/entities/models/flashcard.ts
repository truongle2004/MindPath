export type CardType = 'basic' | 'cloze' | 'image';

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type ReviewRating = 1 | 2 | 3 | 4;

export type Deck = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  colorHex: string | null;
  isPublic: boolean;
  createdAt: Date;
};

export type CreateDeckInput = {
  userId: string;
  title: string;
  description?: string | null;
  colorHex?: string | null;
  isPublic?: boolean;
};

export type UpdateDeckInput = {
  title?: string;
  description?: string | null;
  colorHex?: string | null;
  isPublic?: boolean;
};

export type Card = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: CardType;
  createdAt: Date;
  stability: number;
  difficulty: number;
  due: Date;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: CardState;
  lastReview: Date | null;
};

export type CreateCardInput = {
  deckId: string;
  front: string;
  back: string;
  cardType?: CardType;
};

export type UpdateCardInput = {
  front?: string;
  back?: string;
  cardType?: CardType;
  stability?: number;
  difficulty?: number;
  due?: Date;
  elapsedDays?: number;
  scheduledDays?: number;
  reps?: number;
  lapses?: number;
  state?: CardState;
  lastReview?: Date | null;
};

export type CardReview = {
  id: string;
  cardId: string;
  userId: string;
  rating: ReviewRating;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyAfter: number;
  scheduledDays: number;
  reviewedAt: Date;
};

export type CreateCardReviewInput = {
  cardId: string;
  userId: string;
  rating: ReviewRating;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyAfter: number;
  scheduledDays: number;
  reviewedAt?: Date;
};

export type PomodoroSession = {
  id: string;
  userId: string;
  deckId: string | null;
  workMinutes: number;
  breakMinutes: number;
  completedCycles: number;
  isCompleted: boolean;
  focusLabel: string | null;
  startedAt: Date;
  endedAt: Date | null;
};

export type CreatePomodoroSessionInput = {
  userId: string;
  deckId?: string | null;
  workMinutes?: number;
  breakMinutes?: number;
  focusLabel?: string | null;
  startedAt: Date;
};

export type UpdatePomodoroSessionInput = {
  completedCycles?: number;
  isCompleted?: boolean;
  endedAt?: Date | null;
};
