import type { Card } from '@/modules/flashcard/entities/models/card';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type GetDueCardsResponse = {
  cards: Card[];
};

export type IGetDueCardsController = (
  auth: AuthContext | null,
  deckId: string,
) => Promise<GetDueCardsResponse>;
