import * as z from 'zod';

export const deckSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  colorHex: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  cardCount: z.number().optional(),
});

export const createDeckInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/u)
    .nullable()
    .optional(),
});

export const updateDeckInputSchema = createDeckInputSchema.partial();

export type CreateDeckInput = z.infer<typeof createDeckInputSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckInputSchema>;
