import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type {
  CreateDeckInput,
  UpdateDeckInput,
} from '@/modules/flashcard/entities/models/deck.schema';

export type IDeckRepository = {
  findByUserId: (userId: string) => Promise<Deck[]>;
  findByIdForUser: (deckId: string, userId: string) => Promise<Deck | null>;
  create: (userId: string, input: CreateDeckInput) => Promise<Deck>;
  update: (deckId: string, userId: string, input: UpdateDeckInput) => Promise<Deck | null>;
  delete: (deckId: string, userId: string) => Promise<boolean>;
};
