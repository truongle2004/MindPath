import * as z from 'zod';

export const userSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string(),
  username: z.string().nullable(),
});

const ensureUserInputSchema = z.object({
  clerkId: z.string().min(1),
  email: z.email(),
  username: z.string().nullable().optional(),
});

export type EnsureUserInput = z.infer<typeof ensureUserInputSchema>;
