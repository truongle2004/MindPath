import { eq } from 'drizzle-orm';
import { pickDefined } from '@/lib/pick-defined';
import type { UserRepository } from '@/modules/user/application/repositories/user.repository';
import { toUser } from '@/modules/user/infrastructure/mappers/user.mapper';
import { users } from '@/modules/user/infrastructure/schema/users';
import type { DbClient } from '@/utils/DBConnection';

/**
 * Creates a Drizzle-backed user repository.
 * @param db The database client.
 * @returns A user repository implementation.
 */
export const createDrizzleUserRepository = (db: DbClient): UserRepository => ({
  findById: async (id) => {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ? toUser(row) : null;
  },

  findByClerkId: async (clerkId) => {
    const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return row ? toUser(row) : null;
  },

  create: async (input) => {
    const [row] = await db
      .insert(users)
      .values({
        clerkId: input.clerkId,
        email: input.email,
        username: input.username ?? null,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    return toUser(row);
  },

  update: async (id, input) => {
    const [row] = await db
      .update(users)
      .set(pickDefined({ email: input.email, username: input.username }))
      .where(eq(users.id, id))
      .returning();

    return row ? toUser(row) : null;
  },

  delete: async (id) => {
    await db.delete(users).where(eq(users.id, id));
  },
});
