import { NotFoundError } from '@/lib/errors/not-found-error';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { IPomodoroSessionRepository } from '@/modules/flashcard/application/repositories/pomodoro-session.repository.interface';
import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import type { CreatePomodoroSessionInput } from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type ICreatePomodoroSessionUseCase = (
  userId: string,
  input: CreatePomodoroSessionInput,
) => Promise<PomodoroSession>;

/**
 * Starts a Pomodoro session for the user.
 * @param deckRepository The deck repository.
 * @param pomodoroSessionRepository The Pomodoro session repository.
 * @returns The create-Pomodoro-session use case.
 */
export const createPomodoroSessionUseCase =
  (
    deckRepository: IDeckRepository,
    pomodoroSessionRepository: IPomodoroSessionRepository,
  ): ICreatePomodoroSessionUseCase =>
  async (userId, input) => {
    if (input.deckId) {
      const deck = await deckRepository.findByIdForUser(input.deckId, userId);

      if (!deck) {
        throw new NotFoundError('Deck not found');
      }
    }

    return await pomodoroSessionRepository.create(userId, input);
  };
