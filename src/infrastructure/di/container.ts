import 'reflect-metadata';
import { cookies } from 'next/headers';
import type { DependencyContainer, InjectionToken } from 'tsyringe';
import { container as rootContainer } from 'tsyringe';
import {
  registerTodosModule,
  registerTodosSupabaseModule,
} from '@/core/infrastructure/todos/di/register';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { registerSupabaseModule } from '@/infrastructure/supabase/di/register';
import { db } from '@/libs/DB';

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
  registerTodosModule(target);

  isRootRegistered = true;
}

/**
 * Returns the root dependency container with singleton registrations applied.
 * @returns The root TSyringe container.
 */
export function getRootContainer() {
  registerRootDependencies(rootContainer);
  return rootContainer;
}

/**
 * Creates a request-scoped child container for Supabase dependencies.
 * @returns A child container bound to the current request cookies.
 */
export async function createRequestContainer() {
  const cookieStore = await cookies();
  const requestContainer = getRootContainer().createChildContainer();

  registerSupabaseModule(requestContainer, cookieStore);
  registerTodosSupabaseModule(requestContainer, cookieStore);

  return requestContainer;
}

/**
 * Resolves a singleton dependency from the root container.
 * @param token The injection token to resolve.
 * @returns The resolved dependency instance.
 */
export function resolve<T>(token: InjectionToken<T>): T {
  return getRootContainer().resolve(token);
}

/**
 * Resolves a request-scoped dependency from a child container.
 * @param token The injection token to resolve.
 * @returns The resolved dependency instance for the current request.
 */
export async function resolveRequest<T>(token: InjectionToken<T>): Promise<T> {
  const requestContainer = await createRequestContainer();
  return requestContainer.resolve(token);
}
