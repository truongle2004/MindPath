import type { IGetDueCardsUseCase } from '@/modules/flashcard/application/use-cases/get-due-cards.use-case';
import type {
  GetDueCardsResponse,
  IGetDueCardsController,
} from '@/modules/flashcard/interface-adapters/controllers/get-due-cards.controller.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

/**
 * Returns cards due for review in a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param getDueCardsUseCase The get-due-cards use case.
 * @returns The get-due-cards controller.
 */
export const getDueCardsController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    getDueCardsUseCase: IGetDueCardsUseCase,
  ): IGetDueCardsController =>
  async (auth, deckId): Promise<GetDueCardsResponse> => {
    const userId = await resolveUserId(ensureUserUseCase, auth);
    const cards = await getDueCardsUseCase(deckId, userId);

    return { cards };
  };
