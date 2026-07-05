import type { InjectionToken } from 'tsyringe';
import type { SupabaseServerClient } from '@/utils/supabase/server';

/** Supabase infrastructure injection tokens. */
export const Tokens = {
  SupabaseServerClient: Symbol('SupabaseServerClient') as InjectionToken<SupabaseServerClient>,
};
