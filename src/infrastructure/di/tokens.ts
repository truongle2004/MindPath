import type { InjectionToken } from 'tsyringe';
import type { DbClient } from '@/utils/DBConnection';

/** Shared infrastructure injection tokens. */
export const Tokens = {
  DbClient: Symbol('DbClient') as InjectionToken<DbClient>,
};
