import type { cookies } from 'next/headers';
import type { DependencyContainer } from 'tsyringe';
import { Tokens } from '@/infrastructure/supabase/di/tokens';
import { createClient } from '@/utils/supabase/server';

/**
 * Registers request-scoped Supabase client dependencies.
 * @param container The request container to register dependencies on.
 * @param cookieStore The current request cookie store.
 */
export function registerSupabaseModule(
  container: DependencyContainer,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  container.register(Tokens.SupabaseServerClient, {
    useFactory: () => createClient(cookieStore),
  });
}
