import type {
  Card,
  CardReview,
  CreateCardInput,
  CreateCardReviewInput,
  CreateDeckInput,
  CreatePomodoroSessionInput,
  Deck,
  PomodoroSession,
  UpdateCardInput,
  UpdateDeckInput,
  UpdatePomodoroSessionInput,
} from '@/modules/flashcard/entities/models/flashcard';

export type DeckRepository = {
  findById: (id: string) => Promise<Deck | null>;
  findByUserId: (userId: string) => Promise<Deck[]>;
  create: (input: CreateDeckInput) => Promise<Deck>;
  update: (id: string, input: UpdateDeckInput) => Promise<Deck | null>;
  delete: (id: string) => Promise<void>;
};

export type CardRepository = {
  findById: (id: string) => Promise<Card | null>;
  findByDeckId: (deckId: string) => Promise<Card[]>;
  findDueByDeckId: (deckId: string, before?: Date) => Promise<Card[]>;
  create: (input: CreateCardInput) => Promise<Card>;
  update: (id: string, input: UpdateCardInput) => Promise<Card | null>;
  delete: (id: string) => Promise<void>;
};

export type CardReviewRepository = {
  create: (input: CreateCardReviewInput) => Promise<CardReview>;
  findByCardId: (cardId: string) => Promise<CardReview[]>;
};

export type PomodoroSessionRepository = {
  findById: (id: string) => Promise<PomodoroSession | null>;
  findByUserId: (userId: string) => Promise<PomodoroSession[]>;
  create: (input: CreatePomodoroSessionInput) => Promise<PomodoroSession>;
  update: (id: string, input: UpdatePomodoroSessionInput) => Promise<PomodoroSession | null>;
};
