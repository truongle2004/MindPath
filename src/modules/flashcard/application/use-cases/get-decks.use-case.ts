import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Deck } from '@/modules/flashcard/entities/models/deck';

export type IGetDecksUseCase = (userId: string) => Promise<Deck[]>;

/**
 * Returns all decks for a user.
 * @param deckRepository The deck repository.
 * @returns The get-decks use case.
 */
export const getDecksUseCase =
  (deckRepository: IDeckRepository): IGetDecksUseCase =>
  async (userId) =>
    await deckRepository.findByUserId(userId);
