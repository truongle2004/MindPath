import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import type { CreateDeckInput } from '@/modules/flashcard/entities/models/deck.schema';

export type ICreateDeckUseCase = (userId: string, input: CreateDeckInput) => Promise<Deck>;

/**
 * Creates a deck for a user.
 * @param deckRepository The deck repository.
 * @returns The create-deck use case.
 */
export const createDeckUseCase =
  (deckRepository: IDeckRepository): ICreateDeckUseCase =>
  async (userId, input) =>
    await deckRepository.create(userId, input);
