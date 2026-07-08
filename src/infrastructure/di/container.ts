import 'reflect-metadata';
import type { DependencyContainer, InjectionToken } from 'tsyringe';
import { container as rootContainer } from 'tsyringe';
import { registerTodosModule } from '@/core/infrastructure/todos/di/register';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { db } from '@/libs/DB';
import { registerFlashcardModule } from '@/modules/flashcard/infrastructure/di/register';
import { registerUserModule } from '@/modules/user/infrastructure/di/register';

let isRootRegistered = false;

/**
 * Registers singleton dependencies shared across requests.
 * @param target The container to register dependencies on.
 */
function registerRootDependencies(target: DependencyContainer) {
  if (isRootRegistered) {
    return;
  }

  target.register(DbTokens.DbClient, { useValue: db });
  registerUserModule(target);
  registerTodosModule(target);
  registerFlashcardModule(target);

  isRootRegistered = true;
}

/**
 * Returns the root dependency container with singleton registrations applied.
 * @returns The root TSyringe container.
 */
function getRootContainer() {
  registerRootDependencies(rootContainer);
  return rootContainer;
}

/**
 * Resolves a singleton dependency from the root container.
 * @param token The injection token to resolve.
 * @returns The resolved dependency instance.
 */
export function resolve<T>(token: InjectionToken<T>): T {
  return getRootContainer().resolve(token);
}
