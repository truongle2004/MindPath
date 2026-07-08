import { eq } from 'drizzle-orm';
import { DatabaseOperationError } from '@/core/entities/errors/database-operation-error';
import type { ICardRepository } from '@/modules/flashcard/application/repositories/card.repository.interface';
import type { Card } from '@/modules/flashcard/entities/models/card';
import { cardsSchema } from '@/modules/flashcard/infrastructure/schema/cards';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Maps a database row to a card entity.
 * @param row The database row.
 * @returns The card entity.
 */
function mapCard(row: typeof cardsSchema.$inferSelect): Card {
  return {
    id: row.id,
    deckId: row.deckId,
    front: row.front,
    back: row.back,
    cardType: row.cardType,
    createdAt: row.createdAt.toISOString(),
    state: row.state,
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

  create: async (deckId, input) => {
    try {
      const rows = await db
        .insert(cardsSchema)
        .values({
          deckId,
          front: input.front,
          back: input.back,
        })
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
