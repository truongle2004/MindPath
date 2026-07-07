import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { databaseSchema } from '@/infrastructure/database/schema';
import { Env } from '@/libs/Env';

// Create a Neon project at https://console.neon.tech — see https://neon.com/docs/guides/drizzle
const sql = neon(Env.DATABASE_URL);

/**
 * Creates a Drizzle client backed by Neon's serverless HTTP driver.
 * @returns A Drizzle database client for the current schema.
 */
export const createDbConnection = () =>
  drizzle({
    client: sql,
    schema: databaseSchema,
  });

export type DbClient = ReturnType<typeof createDbConnection>;
