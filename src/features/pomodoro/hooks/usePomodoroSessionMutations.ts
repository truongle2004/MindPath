'use client';

import { useMutation } from '@tanstack/react-query';
import {
  completePomodoroSession,
  createPomodoroSession,
} from '@/features/pomodoro/services/pomodoro.api';

export function usePomodoroSessionMutations() {
  const createSession = useMutation({
    mutationFn: createPomodoroSession,
  });
  const completeSession = useMutation({
    mutationFn: completePomodoroSession,
  });

  return { createSession, completeSession };
}
