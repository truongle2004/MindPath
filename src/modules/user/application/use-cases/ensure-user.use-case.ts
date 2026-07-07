import type { IUserRepository } from '@/modules/user/application/repositories/user.repository.interface';
import type { User } from '@/modules/user/entities/models/user';
import type { EnsureUserInput } from '@/modules/user/entities/models/user.schema';

export type IEnsureUserUseCase = (input: EnsureUserInput) => Promise<User>;

/**
 * Finds or creates a user synced from Clerk.
 * @param userRepository The user repository.
 * @returns The ensure-user use case.
 */
export const ensureUserUseCase =
  (userRepository: IUserRepository): IEnsureUserUseCase =>
  async (input) => {
    const existing = await userRepository.findByClerkId(input.clerkId);

    if (existing) {
      if (existing.email !== input.email || existing.username !== (input.username ?? null)) {
        return await userRepository.update(existing.id, input);
      }

      return existing;
    }

    return await userRepository.create(input);
  };
