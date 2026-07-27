import * as z from 'zod';

export const pomodoroSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  deckId: z.string().nullable(),
  workMinutes: z.number(),
  breakMinutes: z.number(),
  completedCycles: z.number(),
  isCompleted: z.boolean(),
  focusLabel: z.string().nullable(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
});

export const createPomodoroSessionInputSchema = z.object({
  deckId: z.uuid().nullable().optional(),
  workMinutes: z.number().int().min(1).max(180).default(25),
  breakMinutes: z.number().int().min(1).max(60).default(5),
  focusLabel: z.string().trim().min(1).max(100).nullable().optional(),
});

export const completePomodoroSessionInputSchema = z.object({
  completedCycles: z.number().int().min(1).max(20),
});

export const createPomodoroSessionResponseSchema = z.object({
  session: pomodoroSessionSchema,
});

export const completePomodoroSessionResponseSchema = z.object({
  session: pomodoroSessionSchema,
  focusMinutes: z.number(),
});

export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionInputSchema>;
export type CompletePomodoroSessionInput = z.infer<typeof completePomodoroSessionInputSchema>;
