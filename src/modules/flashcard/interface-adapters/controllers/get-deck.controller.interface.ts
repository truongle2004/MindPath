import type { Card } from '@/modules/flashcard/entities/models/card';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type GetDeckResponse = {
  deck: Deck;
  cards: Card[];
};

export type IGetDeckController = (
  auth: AuthContext | null,
  deckId: string,
) => Promise<GetDeckResponse>;
