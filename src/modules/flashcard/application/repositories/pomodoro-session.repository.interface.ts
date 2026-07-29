import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import type {
  CompletePomodoroSessionInput,
  CreatePomodoroSessionInput,
} from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type ICompletePomodoroSessionResult = {
  session: PomodoroSession;
  focusMinutes: number;
};

export type IPomodoroSessionRepository = {
  create: (userId: string, input: CreatePomodoroSessionInput) => Promise<PomodoroSession>;
  complete: (
    sessionId: string,
    userId: string,
    input: CompletePomodoroSessionInput,
  ) => Promise<ICompletePomodoroSessionResult | null>;
};
