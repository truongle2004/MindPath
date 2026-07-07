import { index, integer, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { decksSchema } from '@/modules/flashcard/infrastructure/schema/decks';

/** Flashcards with FSRS scheduling state. */
export const cardsSchema = pgTable(
  'cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => decksSchema.id, { onDelete: 'cascade' }),
    front: text('front').notNull(),
    back: text('back').notNull(),
    cardType: varchar('card_type', { length: 20 }).default('basic').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    stability: real('stability').default(0).notNull(),
    difficulty: real('difficulty').default(0).notNull(),
    due: timestamp('due', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    elapsedDays: integer('elapsed_days').default(0).notNull(),
    scheduledDays: integer('scheduled_days').default(0).notNull(),
    reps: integer('reps').default(0).notNull(),
    lapses: integer('lapses').default(0).notNull(),
    state: varchar('state', { length: 20 }).default('new').notNull(),
    lastReview: timestamp('last_review', { withTimezone: true, mode: 'date' }),
  },
  (table) => [index('idx_cards_deck_id').on(table.deckId), index('idx_cards_due').on(table.due)],
);
