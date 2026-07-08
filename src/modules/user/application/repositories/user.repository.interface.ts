import type { User } from '@/modules/user/entities/models/user';
import type { EnsureUserInput } from '@/modules/user/entities/models/user.schema';

export type IUserRepository = {
  findByClerkId: (clerkId: string) => Promise<User | null>;
  create: (input: EnsureUserInput) => Promise<User>;
  update: (id: string, input: Partial<EnsureUserInput>) => Promise<User>;
};
