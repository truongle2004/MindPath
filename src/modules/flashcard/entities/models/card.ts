import type * as z from 'zod';
import type { cardSchema } from '@/modules/flashcard/entities/models/card.schema';

export type Card = z.infer<typeof cardSchema>;
