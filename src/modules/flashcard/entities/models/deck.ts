import type * as z from 'zod';
import type { deckSchema } from '@/modules/flashcard/entities/models/deck.schema';

export type Deck = z.infer<typeof deckSchema>;
