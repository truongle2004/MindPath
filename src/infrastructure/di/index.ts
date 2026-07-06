import { Tokens as TodosTokens } from '@/core/infrastructure/todos/di/tokens';
import { resolve, resolveRequest } from '@/infrastructure/di/container';
import { isSupabaseConfigured } from '@/libs/Env';

/**
 * Resolves the get-todos controller from the DI container.
 * @returns The controller for the current data source.
 */
export async function getTodosController() {
  if (isSupabaseConfigured()) {
    return await resolveRequest(TodosTokens.GetTodosController);
  }

  return resolve(TodosTokens.GetTodosController);
}
