# Cavaleiros da Francesinha

A trilingual (PT, EN, FR) guide that ranks Francesinha restaurants with a detailed 10-point score set by a group of expert friends, "the Knights". Live at [cavaleirosdafrancesinha.com](https://cavaleirosdafrancesinha.com).

## Features

- **Directory:** published restaurants with city and price filters, search, sorting by score, and pagination.
- **Restaurant pages:** photos, details, the Knights' score with its breakdown, published reviews, and structured data for search engines.
- **Map:** clustered pins of every published restaurant (Leaflet).
- **Leaderboard:** restaurants ranked by the Knights' score.
- **Blog and events:** each post or event is written once, in one language, and shown in every locale.
- **Contact form:** emailed to the team through Resend, protected by Cloudflare Turnstile.
- **Languages:** the browser's language when it is PT, EN or FR, otherwise English.
- **Admin back office:** restaurants (with Google Places search), Knights reviews with per-ingredient scores, ingredient and tag catalog with a translation hub, blog posts, events, and a dashboard.
- **Super admin:** a Users page in the admin menu to change roles and suspend accounts.

Community reviews (members posting their own reviews) are planned for a later phase.

## Tech stack

- Next.js 16 (App Router, Server Actions), React 19, TypeScript
- Tailwind CSS, Lucide icons
- Supabase (Postgres, Auth, Storage) on the free plan; Drizzle ORM for typed queries
- next-intl, Leaflet, Google Maps Places, Resend, Cloudflare Turnstile
- Playwright (desktop and mobile), axe accessibility checks
- Hosted on Vercel

## Getting started

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm run dev`, then open http://localhost:3000.

## Database changes

Schema changes are Supabase CLI migrations in `supabase/migrations`. There is no staging project, so every change reaches the live database:

1. Create a migration: `npm run db:new <name>`, then write the SQL.
2. Take a backup first (see below).
3. Review the SQL, then apply it: `supabase db push`.
4. Check what is applied: `npm run db:status`.

Never use `drizzle-kit push` or the SQL editor for schema changes. `src/db/schema.ts` mirrors the database for typed queries and must be updated with each migration.

Backup (Postgres 17 tools from Homebrew, keep the file private):

```bash
/opt/homebrew/opt/postgresql@17/bin/pg_dump "<session pooler connection string>" -Fc -f ~/cdf-backup-$(date +%F).dump
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks (run in CI) |
| `npm run test:readonly` | Playwright tests that never write data (public pages, accessibility, access control) |
| `npm test` | All Playwright tests; data-writing tests run only when `E2E_ALLOW_MUTATIONS=true` |
| `npm run db:new` / `npm run db:status` | New Supabase migration / list applied migrations |

Tests run against the live database: keep `E2E_ALLOW_MUTATIONS` unset or `false`.
