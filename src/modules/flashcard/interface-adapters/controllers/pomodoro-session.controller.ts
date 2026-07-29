import { InputParseError } from '@/lib/errors/input-parse-error';
import type { ICompletePomodoroSessionUseCase } from '@/modules/flashcard/application/use-cases/complete-pomodoro-session.use-case';
import type { ICreatePomodoroSessionUseCase } from '@/modules/flashcard/application/use-cases/create-pomodoro-session.use-case';
import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import {
  completePomodoroSessionInputSchema,
  createPomodoroSessionInputSchema,
} from '@/modules/flashcard/entities/models/pomodoro-session.schema';
import type { IEnsureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import type { AuthContext } from '@/modules/user/interface-adapters/auth-context';
import { resolveUserId } from '@/modules/user/interface-adapters/resolve-user-id';

type CreatePomodoroSessionResponse = {
  session: PomodoroSession;
};

type CompletePomodoroSessionResponse = {
  session: PomodoroSession;
  focusMinutes: number;
};

export type ICreatePomodoroSessionController = (
  auth: AuthContext | null,
  input: unknown,
) => Promise<CreatePomodoroSessionResponse>;

export type ICompletePomodoroSessionController = (
  auth: AuthContext | null,
  sessionId: string,
  input: unknown,
) => Promise<CompletePomodoroSessionResponse>;

/**
 * Starts a Pomodoro session for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param createPomodoroSessionUseCase The create-Pomodoro-session use case.
 * @returns The create-Pomodoro-session controller.
 */
export const createPomodoroSessionController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    createPomodoroSessionUseCase: ICreatePomodoroSessionUseCase,
  ): ICreatePomodoroSessionController =>
  async (auth, input) => {
    const parsed = createPomodoroSessionInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid Pomodoro session input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const session = await createPomodoroSessionUseCase(userId, parsed.data);

    return { session };
  };

/**
 * Completes a Pomodoro session for the authenticated user.
 * @param ensureUserUseCase The ensure-user use case.
 * @param completePomodoroSessionUseCase The complete-Pomodoro-session use case.
 * @returns The complete-Pomodoro-session controller.
 */
export const completePomodoroSessionController =
  (
    ensureUserUseCase: IEnsureUserUseCase,
    completePomodoroSessionUseCase: ICompletePomodoroSessionUseCase,
  ): ICompletePomodoroSessionController =>
  async (auth, sessionId, input) => {
    const parsed = completePomodoroSessionInputSchema.safeParse(input);

    if (!parsed.success) {
      throw new InputParseError('Invalid Pomodoro session input');
    }

    const userId = await resolveUserId(ensureUserUseCase, auth);
    const result = await completePomodoroSessionUseCase(sessionId, userId, parsed.data);

    return result;
  };
