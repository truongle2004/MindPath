import { NotFoundError } from '@/lib/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';

export type IGetDueCardsUseCase = (deckId: string, userId: string) => Promise<Card[]>;

/**
 * Returns cards due for review in a deck owned by the user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The get-due-cards use case.
 */
export const getDueCardsUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IGetDueCardsUseCase =>
  async (deckId, userId) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    return await cardRepository.findDueForDeck(deckId);
  };
