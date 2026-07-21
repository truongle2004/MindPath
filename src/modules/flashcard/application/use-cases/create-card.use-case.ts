import { NotFoundError } from '@/lib/errors/not-found-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import type { CreateCardInput } from '@/modules/flashcard/entities/models/card.schema';

export type ICreateCardUseCase = (
  deckId: string,
  userId: string,
  input: CreateCardInput,
) => Promise<Card>;

/**
 * Creates a card in a deck owned by the user.
 * @param deckRepository The deck repository.
 * @param cardRepository The card repository.
 * @returns The create-card use case.
 */
export const createCardUseCase =
  (deckRepository: IDeckRepository, cardRepository: ICardRepository): ICreateCardUseCase =>
  async (deckId, userId, input) => {
    const deck = await deckRepository.findByIdForUser(deckId, userId);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    return await cardRepository.create(deckId, input);
  };
