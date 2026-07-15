import { and, eq, lte } from 'drizzle-orm';
import { DatabaseOperationError } from '@/entities/errors/database-operation-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import { cardsSchema } from '@/modules/flashcard/infrastructure/schema/cards';
import { cardReviewsSchema } from '@/modules/gamification/infrastructure/schema/gamification';
import type { DbClient } from '@/utils/DBConnection';

function mapCard(row: typeof cardsSchema.$inferSelect): Card {
  return {
    id: row.id,
    deckId: row.deckId,
    front: row.front,
    back: row.back,
    cardType: row.cardType,
    createdAt: row.createdAt.toISOString(),
    state: row.state,
    stability: row.stability,
    difficulty: row.difficulty,
    due: row.due.toISOString(),
    elapsedDays: row.elapsedDays,
    scheduledDays: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    lastReview: row.lastReview?.toISOString() ?? null,
  };
}

/**
 * Creates a Drizzle-backed card repository.
 * @param db The database client.
 * @returns A card repository instance.
 */
export const createDrizzleCardRepository = (db: DbClient): ICardRepository => ({
  findByDeckId: async (deckId) => {
    const rows = await db
      .select()
      .from(cardsSchema)
      .where(eq(cardsSchema.deckId, deckId))
      .orderBy(cardsSchema.createdAt);

    return rows.map(mapCard);
  },

  findByIdForDeck: async (cardId, deckId) => {
    const rows = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [row] = rows;

    if (!row || row.deckId !== deckId) {
      return null;
    }

    return mapCard(row);
  },

  findDueForDeck: async (deckId) => {
    const now = new Date();
    const rows = await db
      .select()
      .from(cardsSchema)
      .where(and(eq(cardsSchema.deckId, deckId), lte(cardsSchema.due, now)))
      .orderBy(cardsSchema.due);

    return rows.map(mapCard);
  },

  create: async (deckId, input) => {
    try {
      const rows = await db
        .insert(cardsSchema)
        .values({ deckId, front: input.front, back: input.back })
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to create card');
      }

      return mapCard(row);
    } catch {
      throw new DatabaseOperationError('Failed to create card');
    }
  },

  update: async (cardId, deckId, input) => {
    const existing = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [card] = existing;

    if (!card || card.deckId !== deckId) {
      return null;
    }

    const updates: Partial<typeof cardsSchema.$inferInsert> = {};

    if (input.front !== undefined) {
      updates.front = input.front;
    }

    if (input.back !== undefined) {
      updates.back = input.back;
    }

    try {
      const rows = await db
        .update(cardsSchema)
        .set(updates)
        .where(eq(cardsSchema.id, cardId))
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to update card');
      }

      return mapCard(row);
    } catch {
      throw new DatabaseOperationError('Failed to update card');
    }
  },

  applyFsrsReview: async (cardId, deckId, fsrsUpdate, reviewEntry) => {
    const existing = await db.select().from(cardsSchema).where(eq(cardsSchema.id, cardId)).limit(1);
    const [card] = existing;

    if (!card || card.deckId !== deckId) {
      return null;
    }

    try {
      const [updatedCard] = await db
        .update(cardsSchema)
        .set({
          stability: fsrsUpdate.stability,
          difficulty: fsrsUpdate.difficulty,
          due: fsrsUpdate.due,
          elapsedDays: fsrsUpdate.elapsedDays,
          scheduledDays: fsrsUpdate.scheduledDays,
          reps: fsrsUpdate.reps,
          lapses: fsrsUpdate.lapses,
          state: fsrsUpdate.state,
          lastReview: fsrsUpdate.lastReview,
        })
        .where(eq(cardsSchema.id, cardId))
        .returning();

      if (!updatedCard) {
        throw new DatabaseOperationError('Failed to update card FSRS state');
      }

      await db.insert(cardReviewsSchema).values({
        cardId: reviewEntry.cardId,
        userId: reviewEntry.userId,
        rating: reviewEntry.rating,
        stabilityBefore: reviewEntry.stabilityBefore,
        stabilityAfter: reviewEntry.stabilityAfter,
        difficultyAfter: reviewEntry.difficultyAfter,
        scheduledDays: reviewEntry.scheduledDays,
      });

      return mapCard(updatedCard);
    } catch {
      throw new DatabaseOperationError('Failed to apply FSRS review');
    }
  },

  delete: async (cardId, deckId) => {
    const rows = await db
      .delete(cardsSchema)
      .where(eq(cardsSchema.id, cardId))
      .returning({ id: cardsSchema.id, deckId: cardsSchema.deckId });

    const [row] = rows;

    if (!row || row.deckId !== deckId) {
      return false;
    }

    return true;
  },
});
