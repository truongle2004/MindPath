import type { cookies } from 'next/headers';
import type { DependencyContainer } from 'tsyringe';
import { getTodosUseCase } from '@/core/application/use-cases/todos/get-todos.use-case';
import { getTodosController } from '@/core/interface-adapters/controllers/todos/get-todos.controller';
import { Tokens } from '@/core/infrastructure/todos/di/tokens';
import { createDrizzleTodoRepository } from '@/core/infrastructure/todos/repositories/drizzle-todo.repository';
import { createSupabaseTodoRepository } from '@/core/infrastructure/todos/repositories/supabase-todo.repository';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';
import { isSupabaseConfigured } from '@/libs/Env';
import { createClient } from '@/utils/supabase/server';

/**
 * Registers todo module dependencies on the root container using Drizzle.
 * @param container The container to register dependencies on.
 */
export function registerTodosModule(container: DependencyContainer) {
  container.register(Tokens.TodoRepository, {
    useFactory: (dependencyContainer) =>
      createDrizzleTodoRepository(dependencyContainer.resolve(DbTokens.DbClient)),
  });

  container.register(Tokens.GetTodosUseCase, {
    useFactory: (dependencyContainer) =>
      getTodosUseCase(dependencyContainer.resolve(Tokens.TodoRepository)),
  });

  container.register(Tokens.GetTodosController, {
    useFactory: (dependencyContainer) =>
      getTodosController(dependencyContainer.resolve(Tokens.GetTodosUseCase)),
  });
}

/**
 * Overrides todo repository with Supabase for request-scoped containers.
 * @param container The request container to register dependencies on.
 * @param cookieStore The current request cookie store.
 */
export function registerTodosSupabaseModule(
  container: DependencyContainer,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  if (!isSupabaseConfigured()) {
    return;
  }

  container.register(Tokens.TodoRepository, {
    useFactory: () => createSupabaseTodoRepository(createClient(cookieStore)),
  });

  container.register(Tokens.GetTodosUseCase, {
    useFactory: (dependencyContainer) =>
      getTodosUseCase(dependencyContainer.resolve(Tokens.TodoRepository)),
  });

  container.register(Tokens.GetTodosController, {
    useFactory: (dependencyContainer) =>
      getTodosController(dependencyContainer.resolve(Tokens.GetTodosUseCase)),
  });
}
