import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: [
    './src/modules/user/infrastructure/schema/users.ts',
    './src/modules/flashcard/infrastructure/schema/decks.ts',
    './src/modules/flashcard/infrastructure/schema/cards.ts',
    './src/modules/flashcard/infrastructure/schema/pomodoro-sessions.ts',
    './src/modules/gamification/infrastructure/schema/gamification.ts',
    './src/infrastructure/database/counter.ts',
    './src/core/infrastructure/todos/schema/todos.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
