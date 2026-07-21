import type { InjectionToken } from 'tsyringe';
import type { DbClient } from '@/lib/DBConnection';

/** Shared infrastructure injection tokens. */
export const Tokens = {
  DbClient: Symbol('DbClient') as InjectionToken<DbClient>,
};
