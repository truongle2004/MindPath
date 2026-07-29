import type { PomodoroSession } from '@/modules/flashcard/entities/models/pomodoro-session';
import type {
  CompletePomodoroSessionInput,
  CreatePomodoroSessionInput,
} from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type CreatePomodoroSessionResponseDto = {
  session: PomodoroSession;
};

export type CompletePomodoroSessionResponseDto = {
  session: PomodoroSession;
  focusMinutes: number;
};

export type CreatePomodoroSessionDto = CreatePomodoroSessionInput;

export type CompletePomodoroSessionDto = CompletePomodoroSessionInput;
