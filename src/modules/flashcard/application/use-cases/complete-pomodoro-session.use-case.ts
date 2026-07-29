import { NotFoundError } from '@/lib/errors/not-found-error';
import type {
  ICompletePomodoroSessionResult,
  IPomodoroSessionRepository,
} from '@/modules/flashcard/application/repositories/pomodoro-session.repository.interface';
import type { CompletePomodoroSessionInput } from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type ICompletePomodoroSessionUseCase = (
  sessionId: string,
  userId: string,
  input: CompletePomodoroSessionInput,
) => Promise<ICompletePomodoroSessionResult>;

/**
 * Completes a Pomodoro session for the user.
 * @param pomodoroSessionRepository The Pomodoro session repository.
 * @returns The complete-Pomodoro-session use case.
 */
export const completePomodoroSessionUseCase =
  (pomodoroSessionRepository: IPomodoroSessionRepository): ICompletePomodoroSessionUseCase =>
  async (sessionId, userId, input) => {
    const result = await pomodoroSessionRepository.complete(sessionId, userId, input);

    if (!result) {
      throw new NotFoundError('Pomodoro session not found');
    }

    return result;
  };
