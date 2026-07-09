import { NotFoundError } from '@/entities/errors/not-found-error';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';

export type IDeleteDeckUseCase = (deckId: string, userId: string) => Promise<void>;

/**
 * Deletes a deck owned by the user.
 * @param deckRepository The deck repository.
 * @returns The delete-deck use case.
 */
export const deleteDeckUseCase =
  (deckRepository: IDeckRepository): IDeleteDeckUseCase =>
  async (deckId, userId) => {
    const deleted = await deckRepository.delete(deckId, userId);

    if (!deleted) {
      throw new NotFoundError('Deck not found');
    }
  };
