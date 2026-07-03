import type {
  Card,
  CardReview,
  CardState,
  CardType,
  Deck,
  PomodoroSession,
  ReviewRating,
} from '@/modules/flashcard/entities/models/flashcard';
import type { CardReviewRow, CardRow } from '@/modules/flashcard/infrastructure/schema/cards';
import type { DeckRow } from '@/modules/flashcard/infrastructure/schema/decks';
import type { PomodoroSessionRow } from '@/modules/flashcard/infrastructure/schema/pomodoro-sessions';

const toCardType = (value: string): CardType => {
  if (value === 'basic' || value === 'cloze' || value === 'image') {
    return value;
  }
  return 'basic';
};

const toCardState = (value: string): CardState => {
  if (value === 'new' || value === 'learning' || value === 'review' || value === 'relearning') {
    return value;
  }
  return 'new';
};

const toReviewRating = (value: number): ReviewRating => {
  if (value === 1 || value === 2 || value === 3 || value === 4) {
    return value;
  }
  return 1;
};

export const toDeck = (row: DeckRow): Deck => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  description: row.description,
  colorHex: row.colorHex,
  isPublic: row.isPublic,
  createdAt: row.createdAt,
});

export const toCard = (row: CardRow): Card => ({
  id: row.id,
  deckId: row.deckId,
  front: row.front,
  back: row.back,
  cardType: toCardType(row.cardType),
  createdAt: row.createdAt,
  stability: row.stability,
  difficulty: row.difficulty,
  due: row.due,
  elapsedDays: row.elapsedDays,
  scheduledDays: row.scheduledDays,
  reps: row.reps,
  lapses: row.lapses,
  state: toCardState(row.state),
  lastReview: row.lastReview,
});

export const toCardReview = (row: CardReviewRow): CardReview => ({
  id: row.id,
  cardId: row.cardId,
  userId: row.userId,
  rating: toReviewRating(row.rating),
  stabilityBefore: row.stabilityBefore,
  stabilityAfter: row.stabilityAfter,
  difficultyAfter: row.difficultyAfter,
  scheduledDays: row.scheduledDays,
  reviewedAt: row.reviewedAt,
});

export const toPomodoroSession = (row: PomodoroSessionRow): PomodoroSession => ({
  id: row.id,
  userId: row.userId,
  deckId: row.deckId,
  workMinutes: row.workMinutes,
  breakMinutes: row.breakMinutes,
  completedCycles: row.completedCycles,
  isCompleted: row.isCompleted,
  focusLabel: row.focusLabel,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
});
