import { InputParseError } from '@/core/entities/errors/input-parse-error';
import type { IDeleteDeckUseCase } from '@/modules/flashcard/application/use-cases/delete-deck.use-case';
import type { IUpdateDeckUseCase } from '@/modules/flashcard/application/use-cases/update-deck.use-case';
import { updateDeckInputSchema } from '@/modules/flashcard/entities/models/deck.schema';
import type {
  IDeleteDeckController,
  IUpdateDeckController,
  UpdateDeckResponse,
} from '@/modules/flashcard/interface-adapters/controllers/update-deck.controller.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

/**
 * Updates a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param updateDeckUseCase The update-deck use case.
 * @returns The update-deck controller.
 */
export const updateDeckController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    updateDeckUseCase: IUpdateDeckUseCase,
  ): IUpdateDeckController =>
  async (auth, deckId, input): Promise<UpdateDeckResponse> => {
    const parsed = updateDeckInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid deck input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const deck = await updateDeckUseCase(deckId, userId, parsed.data);

    return { deck };
  };

/**
 * Deletes a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param deleteDeckUseCase The delete-deck use case.
 * @returns The delete-deck controller.
 */
export const deleteDeckController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    deleteDeckUseCase: IDeleteDeckUseCase,
  ): IDeleteDeckController =>
  async (auth, deckId) => {
    const userId = await resolveUserId(ensureUserUseCase, auth);
    await deleteDeckUseCase(deckId, userId);
  };
