import type { Card } from '@/modules/flashcard/entities/models/card';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type ReviewCardResponse = {
  card: Card;
};

export type IReviewCardController = (
  auth: AuthContext | null,
  deckId: string,
  cardId: string,
  input: unknown,
) => Promise<ReviewCardResponse>;
