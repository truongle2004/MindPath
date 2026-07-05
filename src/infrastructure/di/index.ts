import { resolve, resolveRequest } from '@/infrastructure/di/container';
import { Tokens as SupabaseTokens } from '@/infrastructure/supabase/di/tokens';
import { isSupabaseConfigured } from '@/libs/Env';
import { Tokens as TodosTokens } from '@/core/infrastructure/todos/di/tokens';

export {
  createRequestContainer,
  getRootContainer,
  resolve,
  resolveRequest,
} from '@/infrastructure/di/container';
export { Tokens as DbTokens } from '@/infrastructure/di/tokens';

/**
 * Resolves the request-scoped Supabase server client.
 * @returns The Supabase client for the current request.
 */
export async function getSupabaseServerClient() {
  return await resolveRequest(SupabaseTokens.SupabaseServerClient);
}

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
