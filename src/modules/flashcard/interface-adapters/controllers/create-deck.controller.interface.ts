import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';

export type CreateDeckResponse = {
  deck: Deck;
};

export type ICreateDeckController = (
  auth: AuthContext | null,
  input: unknown,
) => Promise<CreateDeckResponse>;
