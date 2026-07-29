import type {
  CompletePomodoroSessionDto,
  CompletePomodoroSessionResponseDto,
  CreatePomodoroSessionDto,
  CreatePomodoroSessionResponseDto,
} from '@/features/pomodoro/types/pomodoro-api.types';
import { httpJson } from '@/lib/Fetcher';
import {
  completePomodoroSessionResponseSchema,
  createPomodoroSessionResponseSchema,
} from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export async function createPomodoroSession(props: {
  input: CreatePomodoroSessionDto;
}): Promise<CreatePomodoroSessionResponseDto> {
  return await httpJson('/api/pomodoro', {
    method: 'POST',
    schema: createPomodoroSessionResponseSchema,
    body: props.input,
  });
}

export async function completePomodoroSession(props: {
  sessionId: string;
  input: CompletePomodoroSessionDto;
}): Promise<CompletePomodoroSessionResponseDto> {
  return await httpJson(`/api/pomodoro/${props.sessionId}/complete`, {
    method: 'PATCH',
    schema: completePomodoroSessionResponseSchema,
    body: props.input,
  });
}
