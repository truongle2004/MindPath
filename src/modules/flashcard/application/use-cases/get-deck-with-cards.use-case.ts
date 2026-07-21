import { NotFoundError } from '@/lib/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { Deck } from '@/modules/flashcard/entities/models/deck';

type GetDeckWithCardsResult = {
  deck: Deck;
  cards: Card[];
};

export type IGetDeckWithCardsUseCase = (
  deckId: string,
  userId: string,
) => Promise<GetDeckWithCardsResult>;

/**
 * Returns a deck and its cards for an authenticated user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The get-deck-with-cards use case.
 */
export const getDeckWithCardsUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IGetDeckWithCardsUseCase =>
  async (deckId, userId) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    const cards = await cardRepository.findByDeckId(deckId);

    return { deck, cards };
  };
