import { InputParseError } from '@/core/entities/errors/input-parse-error';
import type { ICreateCardUseCase } from '@/modules/flashcard/application/use-cases/create-card.use-case';
import type { IDeleteCardUseCase } from '@/modules/flashcard/application/use-cases/delete-card.use-case';
import type { IUpdateCardUseCase } from '@/modules/flashcard/application/use-cases/update-card.use-case';
import {
  createCardInputSchema,
  updateCardInputSchema,
} from '@/modules/flashcard/entities/models/card.schema';
import type {
  CreateCardResponse,
  ICreateCardController,
  IDeleteCardController,
  IUpdateCardController,
  UpdateCardResponse,
} from '@/modules/flashcard/interface-adapters/controllers/card.controller.interface';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

/**
 * Creates a card in a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param createCardUseCase The create-card use case.
 * @returns The create-card controller.
 */
export const createCardController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    createCardUseCase: ICreateCardUseCase,
  ): ICreateCardController =>
  async (auth, deckId, input): Promise<CreateCardResponse> => {
    const parsed = createCardInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid card input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const card = await createCardUseCase(deckId, userId, parsed.data);

    return { card };
  };

/**
 * Updates a card in a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param updateCardUseCase The update-card use case.
 * @returns The update-card controller.
 */
export const updateCardController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    updateCardUseCase: IUpdateCardUseCase,
  ): IUpdateCardController =>
  async (auth, deckId, cardId, input): Promise<UpdateCardResponse> => {
    const parsed = updateCardInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid card input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const card = await updateCardUseCase(deckId, cardId, userId, parsed.data);

    return { card };
  };

/**
 * Deletes a card from a deck for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param deleteCardUseCase The delete-card use case.
 * @returns The delete-card controller.
 */
export const deleteCardController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    deleteCardUseCase: IDeleteCardUseCase,
  ): IDeleteCardController =>
  async (auth, deckId, cardId) => {
    const userId = await resolveUserId(ensureUserUseCase, auth);
    await deleteCardUseCase(deckId, cardId, userId);
  };
