import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type UpdateDeckResponse = {
  deck: Deck;
};

export type IUpdateDeckController = (
  auth: AuthContext | null,
  deckId: string,
  input: unknown,
) => Promise<UpdateDeckResponse>;

export type IDeleteDeckController = (auth: AuthContext | null, deckId: string) => Promise<void>;
