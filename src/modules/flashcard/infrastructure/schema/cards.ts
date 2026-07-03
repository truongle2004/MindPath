import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { decks } from '@/modules/flashcard/infrastructure/schema/decks';
import { users } from '@/modules/user/infrastructure/schema/users';

export const cards = pgTable(
  'cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => decks.id, { onDelete: 'cascade' }),
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
  (table) => [
    index('idx_cards_deck_id').on(table.deckId),
    index('idx_cards_due')
      .on(table.due)
      .where(sql`${table.state} != 'new'`),
  ],
);

export const cardReviews = pgTable(
  'card_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: smallint('rating').notNull(),
    stabilityBefore: real('stability_before').notNull(),
    stabilityAfter: real('stability_after').notNull(),
    difficultyAfter: real('difficulty_after').notNull(),
    scheduledDays: integer('scheduled_days').notNull(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_card_reviews_card_id').on(table.cardId),
    index('idx_card_reviews_user_date').on(table.userId, table.reviewedAt.desc()),
  ],
);

export type CardRow = typeof cards.$inferSelect;
export type NewCardRow = typeof cards.$inferInsert;
export type CardReviewRow = typeof cardReviews.$inferSelect;
export type NewCardReviewRow = typeof cardReviews.$inferInsert;

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  reviews: many(cardReviews),
}));

export const cardReviewsRelations = relations(cardReviews, ({ one }) => ({
  card: one(cards, {
    fields: [cardReviews.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [cardReviews.userId],
    references: [users.id],
  }),
}));
