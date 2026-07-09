import type { IGetDeckWithCardsUseCase } from '@/modules/flashcard/application/use-cases/get-deck-with-cards.use-case';
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

export type GetDeckResponse = {
  deck: Deck;
  cards: Card[];
};

export type IGetDeckController = (
  auth: AuthContext | null,
  deckId: string,
) => Promise<GetDeckResponse>;

/**
 * Returns a deck and its cards for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param getDeckWithCardsUseCase The get-deck-with-cards use case.
 * @returns The get-deck controller.
 */
export const getDeckController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    getDeckWithCardsUseCase: IGetDeckWithCardsUseCase,
  ): IGetDeckController =>
  async (auth: AuthContext | null, deckId: string): Promise<GetDeckResponse> => {
    const userId = await resolveUserId(ensureUserUseCase, auth);

    return await getDeckWithCardsUseCase(deckId, userId);
  };
