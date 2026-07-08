import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type GetDecksResponse = {
  decks: Deck[];
};

export type IGetDecksController = (auth: AuthContext | null) => Promise<GetDecksResponse>;
