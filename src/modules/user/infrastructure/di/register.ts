import type { DependencyContainer } from 'tsyringe';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { ensureUserUseCase } from '@/modules/user/application/use-cases/ensure-user.use-case';
import { Tokens } from '@/modules/user/infrastructure/di/tokens';
import { createDrizzleUserRepository } from '@/modules/user/infrastructure/repositories/drizzle-user.repository';

/**
 * Registers user module dependencies on the root container.
 * @param container The container to register dependencies on.
 */
export function registerUserModule(container: DependencyContainer) {
  container.register(Tokens.UserRepository, {
    useFactory: (dependencyContainer) =>
      createDrizzleUserRepository(dependencyContainer.resolve(DbTokens.DbClient)),
  });

  container.register(Tokens.EnsureUserUseCase, {
    useFactory: (dependencyContainer) =>
      ensureUserUseCase(dependencyContainer.resolve(Tokens.UserRepository)),
  });
}
