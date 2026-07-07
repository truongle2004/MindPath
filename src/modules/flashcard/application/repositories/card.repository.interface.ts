import type { Card } from '@/modules/flashcard/entities/models/card';
import type {
  CreateCardInput,
  UpdateCardInput,
} from '@/modules/flashcard/entities/models/card.schema';

export type ICardRepository = {
  findByDeckId: (deckId: string) => Promise<Card[]>;
  findByIdForDeck: (cardId: string, deckId: string) => Promise<Card | null>;
  create: (deckId: string, input: CreateCardInput) => Promise<Card>;
  update: (cardId: string, deckId: string, input: UpdateCardInput) => Promise<Card | null>;
  delete: (cardId: string, deckId: string) => Promise<boolean>;
};
