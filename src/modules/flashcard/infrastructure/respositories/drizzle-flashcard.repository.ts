import { and, eq, lte } from 'drizzle-orm';
import { pickDefined } from '@/lib/pick-defined';
import type {
  CardRepository,
  CardReviewRepository,
  DeckRepository,
  PomodoroSessionRepository,
} from '@/modules/flashcard/application/repositories/flashcard.repository';
import {
  toCard,
  toCardReview,
  toDeck,
  toPomodoroSession,
} from '@/modules/flashcard/infrastructure/mappers/flashcard.mapper';
import { cardReviews, cards } from '@/modules/flashcard/infrastructure/schema/cards';
import { decks } from '@/modules/flashcard/infrastructure/schema/decks';
import { pomodoroSessions } from '@/modules/flashcard/infrastructure/schema/pomodoro-sessions';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Creates a Drizzle-backed deck repository.
 * @param db The database client.
 * @returns A deck repository implementation.
 */
export const createDrizzleDeckRepository = (db: DbClient): DeckRepository => ({
  findById: async (id) => {
    const [row] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
    return row ? toDeck(row) : null;
  },

  findByUserId: async (userId) => {
    const rows = await db.select().from(decks).where(eq(decks.userId, userId));
    return rows.map(toDeck);
  },

  create: async (input) => {
    const [row] = await db
      .insert(decks)
      .values({
        userId: input.userId,
        title: input.title,
        description: input.description ?? null,
        colorHex: input.colorHex ?? null,
        isPublic: input.isPublic ?? false,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create deck');
    }

    return toDeck(row);
  },

  update: async (id, input) => {
    const [row] = await db
      .update(decks)
      .set(
        pickDefined({
          title: input.title,
          description: input.description,
          colorHex: input.colorHex,
          isPublic: input.isPublic,
        }),
      )
      .where(eq(decks.id, id))
      .returning();

    return row ? toDeck(row) : null;
  },

  delete: async (id) => {
    await db.delete(decks).where(eq(decks.id, id));
  },
});

/**
 * Creates a Drizzle-backed card repository.
 * @param db The database client.
 * @returns A card repository implementation.
 */
export const createDrizzleCardRepository = (db: DbClient): CardRepository => ({
  findById: async (id) => {
    const [row] = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
    return row ? toCard(row) : null;
  },

  findByDeckId: async (deckId) => {
    const rows = await db.select().from(cards).where(eq(cards.deckId, deckId));
    return rows.map(toCard);
  },

  findDueByDeckId: async (deckId, before = new Date()) => {
    const rows = await db
      .select()
      .from(cards)
      .where(and(eq(cards.deckId, deckId), lte(cards.due, before)));

    return rows.filter((row) => row.state !== 'new').map(toCard);
  },

  create: async (input) => {
    const [row] = await db
      .insert(cards)
      .values({
        deckId: input.deckId,
        front: input.front,
        back: input.back,
        cardType: input.cardType ?? 'basic',
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create card');
    }

    return toCard(row);
  },

  update: async (id, input) => {
    const [row] = await db
      .update(cards)
      .set(
        pickDefined({
          front: input.front,
          back: input.back,
          cardType: input.cardType,
          stability: input.stability,
          difficulty: input.difficulty,
          due: input.due,
          elapsedDays: input.elapsedDays,
          scheduledDays: input.scheduledDays,
          reps: input.reps,
          lapses: input.lapses,
          state: input.state,
          lastReview: input.lastReview,
        }),
      )
      .where(eq(cards.id, id))
      .returning();

    return row ? toCard(row) : null;
  },

  delete: async (id) => {
    await db.delete(cards).where(eq(cards.id, id));
  },
});

/**
 * Creates a Drizzle-backed card review repository.
 * @param db The database client.
 * @returns A card review repository implementation.
 */
export const createDrizzleCardReviewRepository = (db: DbClient): CardReviewRepository => ({
  create: async (input) => {
    const [row] = await db
      .insert(cardReviews)
      .values({
        cardId: input.cardId,
        userId: input.userId,
        rating: input.rating,
        stabilityBefore: input.stabilityBefore,
        stabilityAfter: input.stabilityAfter,
        difficultyAfter: input.difficultyAfter,
        scheduledDays: input.scheduledDays,
        reviewedAt: input.reviewedAt ?? new Date(),
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create card review');
    }

    return toCardReview(row);
  },

  findByCardId: async (cardId) => {
    const rows = await db.select().from(cardReviews).where(eq(cardReviews.cardId, cardId));
    return rows.map(toCardReview);
  },
});

/**
 * Creates a Drizzle-backed pomodoro session repository.
 * @param db The database client.
 * @returns A pomodoro session repository implementation.
 */
export const createDrizzlePomodoroSessionRepository = (
  db: DbClient,
): PomodoroSessionRepository => ({
  findById: async (id) => {
    const [row] = await db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.id, id))
      .limit(1);
    return row ? toPomodoroSession(row) : null;
  },

  findByUserId: async (userId) => {
    const rows = await db
      .select()
      .from(pomodoroSessions)
      .where(eq(pomodoroSessions.userId, userId));
    return rows.map(toPomodoroSession);
  },

  create: async (input) => {
    const [row] = await db
      .insert(pomodoroSessions)
      .values({
        userId: input.userId,
        deckId: input.deckId ?? null,
        workMinutes: input.workMinutes ?? 25,
        breakMinutes: input.breakMinutes ?? 5,
        focusLabel: input.focusLabel ?? null,
        startedAt: input.startedAt,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create pomodoro session');
    }

    return toPomodoroSession(row);
  },

  update: async (id, input) => {
    const [row] = await db
      .update(pomodoroSessions)
      .set(
        pickDefined({
          completedCycles: input.completedCycles,
          isCompleted: input.isCompleted,
          endedAt: input.endedAt,
        }),
      )
      .where(eq(pomodoroSessions.id, id))
      .returning();

    return row ? toPomodoroSession(row) : null;
  },
});
