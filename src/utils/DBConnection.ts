import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { databaseSchema } from '@/infrastructure/database/schema';
import { Env } from '@/libs/Env';

declare global {
  var cachedPostgresClient: ReturnType<typeof postgres> | undefined;
  var cachedPostgresUrl: string | undefined;
}

/**
 * Returns a postgres client, reusing the cached instance when the URL is unchanged.
 * @returns The postgres client for the current DATABASE_URL.
 */
function getPostgresClient() {
  if (globalThis.cachedPostgresClient && globalThis.cachedPostgresUrl === Env.DATABASE_URL) {
    return globalThis.cachedPostgresClient;
  }

  if (globalThis.cachedPostgresClient) {
    void globalThis.cachedPostgresClient.end({ timeout: 0 });
  }

  const client = postgres(Env.DATABASE_URL, {
    prepare: false,
    max: 1,
    ssl: 'require',
  });

  if (Env.NODE_ENV !== 'production') {
    globalThis.cachedPostgresClient = client;
    globalThis.cachedPostgresUrl = Env.DATABASE_URL;
  }

  return client;
}

/**
 * Creates a Drizzle client backed by Supabase Postgres.
 * @returns A Drizzle database client for the current schema.
 */
export const createDbConnection = () =>
  drizzle({
    client: getPostgresClient(),
    schema: databaseSchema,
  });

export type DbClient = ReturnType<typeof createDbConnection>;
