import { createDbConnection } from '@/lib/DBConnection';
import { Env } from '@/lib/Env';

declare global {
  var cachedDrizzle: ReturnType<typeof createDbConnection> | undefined;
  var cachedDrizzleUrl: string | undefined;
}

const db =
  globalThis.cachedDrizzle && globalThis.cachedDrizzleUrl === Env.DATABASE_URL
    ? globalThis.cachedDrizzle
    : createDbConnection();

if (Env.NODE_ENV !== 'production') {
  globalThis.cachedDrizzle = db;
  globalThis.cachedDrizzleUrl = Env.DATABASE_URL;
}

export { db };
