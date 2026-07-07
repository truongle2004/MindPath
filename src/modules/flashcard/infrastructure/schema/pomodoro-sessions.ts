import { boolean, index, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { decksSchema } from '@/modules/flashcard/infrastructure/schema/decks';
import { usersSchema } from '@/modules/user/infrastructure/schema/users';

/** Pomodoro focus sessions optionally linked to a deck. */
export const pomodoroSessionsSchema = pgTable(
  'pomodoro_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    deckId: uuid('deck_id').references(() => decksSchema.id, { onDelete: 'set null' }),
    workMinutes: smallint('work_minutes').default(25).notNull(),
    breakMinutes: smallint('break_minutes').default(5).notNull(),
    completedCycles: smallint('completed_cycles').default(0).notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    focusLabel: varchar('focus_label', { length: 100 }),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [index('idx_pomodoro_user_id').on(table.userId, table.startedAt)],
);
