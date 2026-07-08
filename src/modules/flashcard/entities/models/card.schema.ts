import * as z from 'zod';

export const cardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  front: z.string(),
  back: z.string(),
  cardType: z.string(),
  createdAt: z.string(),
  state: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  due: z.string(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reps: z.number(),
  lapses: z.number(),
  lastReview: z.string().nullable(),
});

export const createCardInputSchema = z.object({
  front: z.string().trim().min(1).max(2000),
  back: z.string().trim().min(1).max(2000),
});

export const updateCardInputSchema = createCardInputSchema.partial();

export const reviewCardInputSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export type CreateCardInput = z.infer<typeof createCardInputSchema>;
export type UpdateCardInput = z.infer<typeof updateCardInputSchema>;
export type ReviewCardInput = z.infer<typeof reviewCardInputSchema>;
