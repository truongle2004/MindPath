import type { IGetDecksUseCase } from '@/modules/flashcard/application/use-cases/get-decks.use-case';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

export type GetDecksResponse = {
  decks: Deck[];
};

export type IGetDecksController = (auth: AuthContext | null) => Promise<GetDecksResponse>;

/**
 * Returns all decks for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param getDecksUseCase The get-decks use case.
 * @returns The get-decks controller.
 */
export const getDecksController =
  (ensureUserUseCase: IEnsureUserUseCase, getDecksUseCase: IGetDecksUseCase): IGetDecksController =>
  async (auth: AuthContext | null): Promise<GetDecksResponse> => {
    const userId = await resolveUserId(ensureUserUseCase, auth);
    const decks = await getDecksUseCase(userId);

    return { decks };
  };
