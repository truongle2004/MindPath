import type { Card } from '@/modules/flashcard/entities/models/card';
import type {
  CreateCardInput,
  UpdateCardInput,
} from '@/modules/flashcard/entities/models/card.schema';

export type FsrsUpdate = {
  stability: number;
  difficulty: number;
  due: Date;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: string;
  lastReview: Date;
};

export type CardReviewEntry = {
  cardId: string;
  userId: string;
  rating: number;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyAfter: number;
  scheduledDays: number;
};

export type ICardRepository = {
  findByDeckId: (deckId: string) => Promise<Card[]>;
  findByIdForDeck: (cardId: string, deckId: string) => Promise<Card | null>;
  findDueForDeck: (deckId: string) => Promise<Card[]>;
  create: (deckId: string, input: CreateCardInput) => Promise<Card>;
  update: (cardId: string, deckId: string, input: UpdateCardInput) => Promise<Card | null>;
  applyFsrsReview: (
    cardId: string,
    deckId: string,
    fsrsUpdate: FsrsUpdate,
    reviewEntry: CardReviewEntry,
  ) => Promise<Card | null>;
  delete: (cardId: string, deckId: string) => Promise<boolean>;
};
