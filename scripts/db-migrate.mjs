import { spawnSync } from 'node:child_process';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

// Transaction pooler (6543) often fails DDL; session pooler (5432) is required for migrate.
if (url.includes(':6543/')) {
  process.env.DATABASE_URL = url.replace(':6543/', ':5432/');
  console.log('Using session pooler (5432) for migrations');
}

const result = spawnSync('npx', ['drizzle-kit', 'migrate'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
