import * as z from 'zod';

export const cardSchema = z.object({
  id: z.string(),
  deckId: z.string(),
  front: z.string(),
  back: z.string(),
  cardType: z.string(),
  createdAt: z.string(),
  state: z.string(),
});

export const createCardInputSchema = z.object({
  front: z.string().trim().min(1).max(2000),
  back: z.string().trim().min(1).max(2000),
});

export const updateCardInputSchema = createCardInputSchema.partial();

export type CreateCardInput = z.infer<typeof createCardInputSchema>;
export type UpdateCardInput = z.infer<typeof updateCardInputSchema>;
