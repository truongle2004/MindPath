import { NotFoundError } from '@/lib/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { UpdateCardInput } from '@/modules/flashcard/entities/models/card.schema';

export type IUpdateCardUseCase = (
  deckId: string,
  cardId: string,
  userId: string,
  input: UpdateCardInput,
) => Promise<Card>;

/**
 * Updates a card in a deck owned by the user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The update-card use case.
 */
export const updateCardUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): IUpdateCardUseCase =>
  async (deckId, cardId, userId, input) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    const card = await cardRepository.update(cardId, deckId, input);

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    return card;
  };
