import { NotFoundError } from '@/core/entities/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';

export type IDeleteCardUseCase = (deckId: string, cardId: string, userId: string) => Promise<void>;

/**
 * Deletes a card from a deck owned by the user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The delete-card use case.
 */
export const deleteCardUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IDeleteCardUseCase =>
  async (deckId, cardId, userId) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    const deleted = await cardRepository.delete(cardId, deckId);

    if (!deleted) {
      throw new NotFoundError('Card not found');
    }
  };
