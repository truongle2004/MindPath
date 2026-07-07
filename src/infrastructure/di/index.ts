import { Tokens as TodosTokens } from '@/core/infrastructure/todos/di/tokens';
import { resolve } from '@/infrastructure/di/container';

/**
 * Resolves the get-todos controller from the DI container.
 * @returns The controller backed by the Drizzle todo repository.
 */
export function getTodosController() {
  return resolve(TodosTokens.GetTodosController);
}
