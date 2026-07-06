import { createBrowserClient } from '@supabase/ssr';
import { Env } from '@/libs/Env';

/**
 * Creates a Supabase browser client for Client Components.
 * @returns A Supabase browser client.
 */
export const createClient = () => {
  const supabaseUrl = Env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = Env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
