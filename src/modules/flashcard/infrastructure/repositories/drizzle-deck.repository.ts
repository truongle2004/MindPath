import { count, eq } from 'drizzle-orm';
import { DatabaseOperationError } from '@/core/entities/errors/database-operation-error';
import type { IDeckRepository } from '@/modules/flashcard/application/repositories/deck.repository.interface';
import type { Deck } from '@/modules/flashcard/entities/models/deck';
import { cardsSchema } from '@/modules/flashcard/infrastructure/schema/cards';
import { decksSchema } from '@/modules/flashcard/infrastructure/schema/decks';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Maps a database row to a deck entity.
 * @param row The database row.
 * @param cardCount Optional card count for list views.
 * @returns The deck entity.
 */
function mapDeck(row: typeof decksSchema.$inferSelect, cardCount?: number): Deck {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    colorHex: row.colorHex,
    isPublic: row.isPublic,
    createdAt: row.createdAt.toISOString(),
    cardCount,
  };
}

/**
 * Creates a Drizzle-backed deck repository.
 * @param db The database client.
 * @returns A deck repository instance.
 */
export const createDrizzleDeckRepository = (db: DbClient): IDeckRepository => ({
  findByUserId: async (userId) => {
    const rows = await db
      .select({
        deck: decksSchema,
        cardCount: count(cardsSchema.id),
      })
      .from(decksSchema)
      .leftJoin(cardsSchema, eq(cardsSchema.deckId, decksSchema.id))
      .where(eq(decksSchema.userId, userId))
      .groupBy(decksSchema.id)
      .orderBy(decksSchema.createdAt);

    return rows.map((row) => mapDeck(row.deck, row.cardCount));
  },

  findByIdForUser: async (deckId, userId) => {
    const rows = await db
      .select({
        deck: decksSchema,
        cardCount: count(cardsSchema.id),
      })
      .from(decksSchema)
      .leftJoin(cardsSchema, eq(cardsSchema.deckId, decksSchema.id))
      .where(eq(decksSchema.id, deckId))
      .groupBy(decksSchema.id)
      .limit(1);

    const [row] = rows;

    if (!row || row.deck.userId !== userId) {
      return null;
    }

    return mapDeck(row.deck, row.cardCount);
  },

  create: async (userId, input) => {
    try {
      const rows = await db
        .insert(decksSchema)
        .values({
          userId,
          title: input.title,
          description: input.description ?? null,
          colorHex: input.colorHex ?? null,
        })
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to create deck');
      }

      return mapDeck(row, 0);
    } catch {
      throw new DatabaseOperationError('Failed to create deck');
    }
  },

  update: async (deckId, userId, input) => {
    const existing = await db.select().from(decksSchema).where(eq(decksSchema.id, deckId)).limit(1);

    const [deck] = existing;

    if (!deck || deck.userId !== userId) {
      return null;
    }

    const updates: Partial<typeof decksSchema.$inferInsert> = {};

    if (input.title !== undefined) {
      updates.title = input.title;
    }

    if (input.description !== undefined) {
      updates.description = input.description;
    }

    if (input.colorHex !== undefined) {
      updates.colorHex = input.colorHex;
    }

    try {
      const rows = await db
        .update(decksSchema)
        .set(updates)
        .where(eq(decksSchema.id, deckId))
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to update deck');
      }

      return mapDeck(row);
    } catch {
      throw new DatabaseOperationError('Failed to update deck');
    }
  },

  delete: async (deckId, userId) => {
    const rows = await db
      .delete(decksSchema)
      .where(eq(decksSchema.id, deckId))
      .returning({ id: decksSchema.id, userId: decksSchema.userId });

    const [row] = rows;

    if (!row || row.userId !== userId) {
      return false;
    }

    return true;
  },
});
