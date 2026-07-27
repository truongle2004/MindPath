import type * as z from 'zod';
import type { pomodoroSessionSchema } from '@/modules/flashcard/entities/models/pomodoro-session.schema';

export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>;
