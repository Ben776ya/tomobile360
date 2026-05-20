# Tomobile 360 — Marketplace Automobile au Maroc

Plateforme automobile complète pour le marché marocain : catalogue véhicules neufs, annonces d'occasion, articles, vidéos, forum communautaire, magazine et services partenaires.

**Production** : [tomobile360.ma](https://tomobile360.ma) *(domaine en cours de raccordement)*

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + tailwindcss-animate |
| UI | Radix primitives + Lucide Icons |
| DB / Auth / Storage | Supabase (PostgreSQL 17, RLS, Storage, Auth) |
| Hosting | Vercel |
| Validation | Zod |
| Testing | Vitest + Testing Library + happy-dom |
| Markdown | react-markdown + remark-gfm |

## Getting started

### Prerequisites
- Node.js 20 LTS (or newer)
- Access to the Supabase project (`atbkdxmxuqorebrttzma`)
- A `.env.local` filled in (see below)

### Install + run
```bash
git clone https://github.com/Ben776ya/tomobile360.git
cd tomobile360
npm install
npm run dev          # localhost:3000
```

### Environment variables (`.env.local`)
```env
# Supabase — required
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only

# YouTube — required for /admin/sync-videos
YOUTUBE_API_KEY=<youtube-data-api-v3-key>

# Legal identifiers — REQUIRED for production builds
# next build throws if any of the three below are missing.
NEXT_PUBLIC_RC_NUMBER="RC Casablanca XXXXXX"
NEXT_PUBLIC_ICE_NUMBER="001234567000099"
NEXT_PUBLIC_DIRECTOR_NAME="Director Full Name"

# Optional
NEXT_PUBLIC_CAPITAL_SOCIAL="100 000 MAD"
NEXT_PUBLIC_CNDP_DECLARATION="D-GC-001/2026"
NEXT_PUBLIC_WHATSAPP_DISPLAY="+212 6XX XX XX XX"
NEXT_PUBLIC_WHATSAPP_E164="2126XXXXXXXX"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry — error reporting (public-by-design, safe in client bundle).
# When unset, Sentry is silently skipped at build time.
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<orgid>.ingest.<region>.sentry.io/<projectid>
# SENTRY_AUTH_TOKEN=    # CI-only, enables source-map upload
# SENTRY_ORG=tomobile360
# SENTRY_PROJECT=tomobile360
```

The same values must be set in **Vercel → Settings → Environment Variables** for Production *and* Preview environments. See [USER_DATA_REQUIRED.md](./USER_DATA_REQUIRED.md) for the full deploy checklist.

### Commands
```bash
npm run dev              # Dev server with HMR
npm run build            # Production build (runs validate-content first)
npm run start            # Serve production build
npm run lint             # next lint + eslint-plugin-security
npm run test             # Vitest single run
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest with v8 coverage
bash scripts/prelaunch-scan.sh   # 6 placeholder/branding scans (CI-blocking)
```

## Architecture

```
src/
├── app/                 # App Router pages + route handlers
│   ├── (auth)/          # Login, signup, password reset
│   ├── admin/           # Admin dashboard (server-side checkAdmin gate)
│   ├── api/             # Route handlers (health, blog, moccaz, revalidate)
│   ├── actions/         # Server actions (import-cars, sync-youtube)
│   ├── neuf/            # New vehicles (catalog + brand/model detail)
│   ├── occasion/        # Used vehicles
│   ├── actu/            # Articles/blog
│   ├── magazine/        # Print magazine archive
│   ├── videos/          # Video gallery (YouTube + Supabase storage)
│   ├── forum/           # Community forum
│   ├── services/        # SOFAC, AtlantaSanad, DabaPneus, NARSA, etc.
│   ├── coups-de-coeur/  # Editorial picks
│   ├── sitemap.ts       # Dynamic sitemap (vehicles + articles + statics)
│   └── robots.ts        # Crawler directives
│
├── components/          # admin/, home/, layout/, vehicles/, blog/, narsa/, seo/, ui/
├── lib/
│   ├── supabase/        # browser / server / middleware clients
│   ├── actions/         # Server-action helpers (admin, brands, contact, ...)
│   ├── validations.ts   # Zod schemas (single source of truth)
│   ├── rate-limit.ts    # In-memory rate limiter (5 req / hour per IP)
│   ├── business-info.ts # Legal identity (env-driven)
│   ├── utils.ts         # cn, formatPrice, formatDate, safeJsonLd
│   └── types.ts         # DB types
│
└── middleware.ts        # /admin gate (server-side, redirects non-admin)
```

## Security model

- **Auth**: Supabase Auth + RLS-enabled tables. `profiles.is_admin = true` grants admin access.
- **Admin gate**: middleware redirects non-admin users from `/admin/*` server-side, *and* the admin layout re-checks via `checkAdmin()`. The old client-side `AdminAuthGate` was removed in 2026-05.
- **Server actions**: every mutation calls `checkAdmin()` before touching the service-role client.
- **Input validation**: Zod schemas in `src/lib/validations.ts`. All admin mutations use `validateAction(schema, data)` with `.strict()` to prevent mass-assignment.
- **Rate limits**: public-write actions (`submitContactMessage`, `subscribeNewsletter`, `submitControleBooking`) capped at 5 attempts / hour / IP via `rateLimit()`.
- **CSP**: configured in `next.config.js`. Includes `unsafe-eval`/`unsafe-inline` for Next.js hydration; everything else is locked down.
- **HSTS + X-Frame-Options + Referrer-Policy + Permissions-Policy**: all set.
- **Error reporting**: `@sentry/nextjs` wired into client, server, and edge runtimes plus `error.tsx`/`global-error.tsx` and the 5 mutation server actions. Activates only when `NEXT_PUBLIC_SENTRY_DSN` is set. Events are proxied via `/monitoring` to bypass ad-blockers.

## Database

Supabase project `atbkdxmxuqorebrttzma` (eu-central-1, Postgres 17). Tables (24):

`brands`, `models`, `vehicles_new`, `vehicles_used`, `dealerships`, `promotions`, `comparisons`, `articles`, `blog_posts`, `blog_images`, `videos`, `narsa_videos`, `magazines`, `fiches_techniques`, `forum_categories`, `forum_topics`, `forum_posts`, `favorites`, `profiles`, `newsletter_subscribers`, `contact_messages`, `service_bookings`, plus two locked-down archive tables.

RLS is enabled on every public-schema table. The Supabase MCP advisor's expected state post-launch is: **0 ERRORs, ≤ 5 WARNs** (the remaining WARNs are the 6 view-counter SECURITY DEFINER functions and 3 public-form INSERT policies — both intentional, both have app-layer mitigations).

Migrations are stored in `migrations/` (gitignored — one-time SQL scripts) and replayed in the Supabase SQL editor. The audit-trail of migrations applied lives in `supabase_migrations.schema_migrations`.

## Storage buckets

| Bucket | Public read | Notes |
|---|---|---|
| `blog-images` | yes (direct URL) | LIST capability removed 2026-05 |
| `magazines` | yes | same |
| `narsa-videos` | yes | same |
| `images` | private | Vehicle photos under `vehicles/` |

## Locale

French only for v1 (`<html lang="fr">`). Prices, dates, and number formatting use the `fr-MA` ICU locale via `Intl`. Adding Arabic in v2 would require a `[locale]` route segment + `next-intl` — not a hack on hardcoded strings.

## Pre-launch checklist

See [USER_DATA_REQUIRED.md](./USER_DATA_REQUIRED.md) for the complete pre-deploy checklist (legal IDs, CNDP declaration, email aliases, SPF/DKIM/DMARC, magazine content, partner data).

## Known footguns on Windows

- `npm run validate-content` (the prefix in `npm run build`) emits a libuv assertion at shutdown under Node 24 — workaround: invoke `npx next build` directly when the validate step is not needed.
- Webpack chunk loading can race on consecutive builds — delete `.next/` if you see `Cannot find module './<n>.js'`.
- Set `NODE_OPTIONS=--max-old-space-size=4096` via `cross-env` (already done in `npm run build`).

## License

Proprietary — All rights reserved to Tomobile 360.
