import { NotFoundError } from '@/core/entities/errors/not-found-error';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { UpdateDeckInput } from '@/modules/flashcard/entities/models/deck.schema';

export type IUpdateDeckUseCase = (
  deckId: string,
  userId: string,
  input: UpdateDeckInput,
) => Promise<Deck>;

/**
 * Updates a deck owned by the user.
 * @param deckRepository The deck repository.
 * @returns The update-deck use case.
 */
export const updateDeckUseCase =
  (deckRepository: IDeckRepository): IUpdateDeckUseCase =>
  async (deckId, userId, input) => {
    const deck = await deckRepository.update(deckId, userId, input);

    if (!deck) {
      throw new NotFoundError('Deck not found');
    }

    return deck;
  };
