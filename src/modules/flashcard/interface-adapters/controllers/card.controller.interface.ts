import type { Card } from '@/modules/flashcard/entities/models/card';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type CreateCardResponse = {
  card: Card;
};

export type UpdateCardResponse = {
  card: Card;
};

export type ICreateCardController = (
  auth: AuthContext | null,
  deckId: string,
  input: unknown,
) => Promise<CreateCardResponse>;

export type IUpdateCardController = (
  auth: AuthContext | null,
  deckId: string,
  cardId: string,
  input: unknown,
) => Promise<UpdateCardResponse>;

export type IDeleteCardController = (
  auth: AuthContext | null,
  deckId: string,
  cardId: string,
) => Promise<void>;
