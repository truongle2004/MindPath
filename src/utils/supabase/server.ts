import { createServerClient } from '@supabase/ssr';
import type { cookies } from 'next/headers';
import { Env } from '@/libs/Env';

/**
 * Creates a Supabase server client bound to the current request cookies.
 * @param cookieStore The current request cookie store.
 * @returns A Supabase server client for Server Components and route handlers.
 */
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const supabaseUrl = Env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = Env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component. Safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
};

export type SupabaseServerClient = ReturnType<typeof createClient>;
