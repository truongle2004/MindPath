import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Todos table stored in Postgres via Drizzle. */
export const todosSchema = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});
