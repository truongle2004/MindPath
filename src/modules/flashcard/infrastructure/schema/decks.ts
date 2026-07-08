import { boolean, char, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersSchema } from '@/modules/user/infrastructure/schema/users';

/** Flashcard decks owned by a user. */
export const decksSchema = pgTable('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersSchema.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  colorHex: char('color_hex', { length: 7 }),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});
