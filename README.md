# MindPath

MindPath helps you move forward with clarity, structure, and support. It is a Next.js application for thoughtful product development, with authentication, a PostgreSQL database, internationalization, and an interactive whiteboard.

## Features

- **Next.js App Router** with TypeScript and React 19
- **Authentication** with [Clerk](https://clerk.com) — sign up, sign in, dashboard, and user profile
- **Database** with [Drizzle ORM](https://orm.drizzle.team) and [Supabase](https://supabase.com) Postgres
- **Internationalization** with next-intl (English and Vietnamese)
- **UI** with Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com)
- **Whiteboard** with [Excalidraw](https://excalidraw.com) for visual thinking and planning
- **Security** with optional [Arcjet](https://arcjet.com) bot protection and WAF
- **Error monitoring** with [Sentry](https://sentry.io) and Spotlight in development
- **Logging** with LogTape and optional Better Stack ingestion
- **Type-safe environment variables** with T3 Env and Zod

## Requirements

- Node.js 24+
- npm
- A [Supabase](https://supabase.com) Postgres database (see [Supabase + Drizzle guide](https://supabase.com/docs/guides/database/drizzle))

## Getting started

Clone the repository and install dependencies:

```shell
git clone <your-repo-url> mindpath
cd mindpath
npm install
```

Copy the environment template and fill in the required values:

```shell
cp .env.example .env.local
```

At minimum, set these in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

Create a Clerk application at [clerk.com](https://clerk.com) and copy the keys from the dashboard.

Apply database migrations:

```shell
npm run db:migrate
```

Start the development server:

```shell
npm run dev
```

This launches Next.js with Sentry Spotlight. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

All environment variables are documented in [`.env.example`](.env.example). Required variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Supabase Postgres connection string (transaction pooler) |

Optional integrations include Arcjet, Sentry, Better Stack, and PostHog. See `.env.example` for details.

## Database

Use a [Supabase](https://supabase.com) Postgres database and set `DATABASE_URL` in `.env.local`. Use the **transaction pooler** connection string (port 6543). `npm run db:migrate` switches to the session pooler (5432) automatically for DDL. See the [Supabase Drizzle guide](https://supabase.com/docs/guides/database/drizzle) for setup.

| Command | Purpose |
| --- | --- |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:studio` | Open Drizzle Studio |

Schema lives under `src/modules/*/infrastructure/schema/` and `src/infrastructure/database/`. Migrations are stored in `migrations/`.

## Pages

| Route | Description |
| --- | --- |
| `/` | Home |
| `/about` | About MindPath |
| `/portfolio` | Portfolio listing |
| `/test` | Excalidraw whiteboard |
| `/sign-in`, `/sign-up` | Authentication |
| `/dashboard` | Protected dashboard (requires sign in) |

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build-local` | Production build (same as `build`) |
| `npm run build` | Production build with `DATABASE_URL` |
| `npm run start` | Run production build locally |
| `npm run lint` | Run linter |
| `npm run lint:fix` | Fix lint issues |
| `npm run check:types` | TypeScript type check |
| `npm run check:deps` | Find unused dependencies and exports |
| `npm run check:i18n` | Validate translations |
| `npm run commit` | Interactive conventional commit helper |

## Project structure

```shell
.
├── migrations/              # Database migrations
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components (including shadcn/ui)
│   ├── lib/                 # Shared utilities
│   ├── libs/                # Third-party integrations
│   ├── locales/             # i18n message files
│   ├── models/              # Drizzle schema
│   ├── styles/              # Global styles
│   ├── templates/           # Page templates
│   └── utils/               # App helpers and config
├── .env.example             # Environment variable template
└── drizzle.config.ts        # Drizzle ORM config
```

## Production

Set `DATABASE_URL`, Clerk keys, and any optional service keys in your hosting provider. Migrations run automatically during `npm run build`.

For a local production build:

```shell
npm run build
npm run start
```

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
