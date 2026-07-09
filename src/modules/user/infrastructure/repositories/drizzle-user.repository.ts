import { eq } from 'drizzle-orm';
import { DatabaseOperationError } from '@/entities/errors/database-operation-error';
import type { IUserRepository } from '@/modules/user/application/repositories/user.repository.interface';
import type { User } from '@/modules/user/entities/models/user';
import { usersSchema } from '@/modules/user/infrastructure/schema/users';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Maps a database row to a user entity.
 * @param row The database row.
 * @returns The user entity.
 */
function mapUser(row: typeof usersSchema.$inferSelect): User {
  return {
    id: row.id,
    clerkId: row.clerkId,
    email: row.email,
    username: row.username,
  };
}

/**
 * Creates a Drizzle-backed user repository.
 * @param db The database client.
 * @returns A user repository instance.
 */
export const createDrizzleUserRepository = (db: DbClient): IUserRepository => ({
  findByClerkId: async (clerkId) => {
    const rows = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.clerkId, clerkId))
      .limit(1);

    const [row] = rows;

    if (!row) {
      return null;
    }

    return mapUser(row);
  },

  create: async (input) => {
    try {
      const rows = await db
        .insert(usersSchema)
        .values({
          clerkId: input.clerkId,
          email: input.email,
          username: input.username ?? null,
        })
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to create user');
      }

      return mapUser(row);
    } catch {
      throw new DatabaseOperationError('Failed to create user');
    }
  },

  update: async (id, input) => {
    try {
      const rows = await db
        .update(usersSchema)
        .set({
          email: input.email,
          username: input.username ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(usersSchema.id, id))
        .returning();

      const [row] = rows;

      if (!row) {
        throw new DatabaseOperationError('Failed to update user');
      }

      return mapUser(row);
    } catch {
      throw new DatabaseOperationError('Failed to update user');
    }
  },
});
