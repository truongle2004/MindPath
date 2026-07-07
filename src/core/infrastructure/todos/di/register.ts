import type { DependencyContainer } from 'tsyringe';
import { getTodosUseCase } from '@/core/application/use-cases/todos/get-todos.use-case';
import { Tokens } from '@/core/infrastructure/todos/di/tokens';
import { createDrizzleTodoRepository } from '@/core/infrastructure/todos/repositories/drizzle-todo.repository';
import { getTodosController } from '@/core/interface-adapters/controllers/todos/get-todos.controller';
import { Tokens as DbTokens } from '@/infrastructure/di/tokens';

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
