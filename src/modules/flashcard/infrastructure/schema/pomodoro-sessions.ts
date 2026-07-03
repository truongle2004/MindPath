import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { cards } from '@/modules/flashcard/infrastructure/schema/cards';
import { decks } from '@/modules/flashcard/infrastructure/schema/decks';
import { users } from '@/modules/user/infrastructure/schema/users';

export const pomodoroSessions = pgTable(
  'pomodoro_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deckId: uuid('deck_id').references(() => decks.id, { onDelete: 'set null' }),
    workMinutes: smallint('work_minutes').default(25).notNull(),
    breakMinutes: smallint('break_minutes').default(5).notNull(),
    completedCycles: smallint('completed_cycles').default(0).notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    focusLabel: varchar('focus_label', { length: 100 }),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [index('idx_pomodoro_user_id').on(table.userId, table.startedAt.desc())],
);

export type PomodoroSessionRow = typeof pomodoroSessions.$inferSelect;
export type NewPomodoroSessionRow = typeof pomodoroSessions.$inferInsert;

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  cards: many(cards),
  pomodoroSessions: many(pomodoroSessions),
}));

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
  user: one(users, {
    fields: [pomodoroSessions.userId],
    references: [users.id],
  }),
  deck: one(decks, {
    fields: [pomodoroSessions.deckId],
    references: [decks.id],
  }),
}));
