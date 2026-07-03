import type { User } from '@/modules/user/entities/models/user';
import type { UserRow } from '@/modules/user/infrastructure/schema/users';

export const toUser = (row: UserRow): User => ({
  id: row.id,
  clerkId: row.clerkId,
  email: row.email,
  username: row.username,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
