import type { CreateUserInput, UpdateUserInput, User } from '@/modules/user/entities/models/user';

export type UserRepository = {
  findById: (id: string) => Promise<User | null>;
  findByClerkId: (clerkId: string) => Promise<User | null>;
  create: (input: CreateUserInput) => Promise<User>;
  update: (id: string, input: UpdateUserInput) => Promise<User | null>;
  delete: (id: string) => Promise<void>;
};
