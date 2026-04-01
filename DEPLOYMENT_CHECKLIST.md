# Deployment Checklist - Tomobile 360

## Pre-Deploy

### Database Migrations

- [ ] Run `migrations/add-newsletter-subscribers.sql` in Supabase SQL Editor
  - Creates `newsletter_subscribers` table with `id`, `email`, `subscribed_at`, `is_active` columns
  - Enables RLS: anon and authenticated users can INSERT (subscribe), no public SELECT/UPDATE/DELETE
  - Admin reads via service role key (bypasses RLS)
  - Verify: query `SELECT count(*) FROM newsletter_subscribers` returns 0 (table exists, empty)

### Environment Variables

- [ ] Verify `.env.local` (or Vercel environment settings) has all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `YOUTUBE_API_KEY`
  - `NEXT_PUBLIC_SITE_URL` (must be `https://tomobile360.ma` in production)

### Contact Info

- [ ] Update `TOMOBILE_PHONE` constant in `src/app/neuf/[brand]/[model]/[id]/page.tsx` with real business phone number
  - Currently a placeholder — WhatsApp CTA links to this number
  - Format: country code without `+` (e.g., `212600000000` for Moroccan number)
- [ ] Verify `contact@tomobile360.ma` email is active and receiving mail

### Build

- [ ] Run `npm run build` locally — must complete with zero errors
- [ ] Verify no `console.log` debug statements remain in production code

## Deploy

- [ ] Push to production branch / trigger Vercel deployment
- [ ] Verify deployment completes successfully (check Vercel build logs)

## Post-Deploy Verification

### ISR Cache Revalidation

The `/api/revalidate` endpoint busts the ISR cache for specific paths. It requires an authenticated admin session (cookie-based Supabase auth — no API key).

**How the endpoint works:**

1. Verifies user is authenticated via Supabase session cookie (returns 401 if not)
2. Checks `profiles.is_admin = true` for that user (returns 403 if not admin)
3. Validates `path` query param starts with `/` (returns 400 if missing or invalid)
4. Calls `revalidatePath(path)` from Next.js cache
5. Returns `{ "revalidated": true, "path": "/", "timestamp": 1234567890 }`

**How to use after data changes:**

1. Log in as admin at `https://tomobile360.ma/admin`
2. From the same browser session (same tab or window), open DevTools console
3. Run:

```javascript
fetch('/api/revalidate?path=/', { method: 'POST' })
  .then(r => r.json()).then(console.log)
```

Replace `/` with the specific path you want to revalidate.

**Important limitation:** This endpoint uses cookie-based session auth — NOT a secret API key. You cannot use `curl` with a bearer token or secret. You must have an active admin browser session. The fetch call above works because the browser automatically sends the session cookie.

**Key paths to revalidate after data changes:**

| Path | TTL (seconds) | When to Revalidate |
|------|---------------|-------------------|
| `/` | 60 | After updating homepage content (hero, featured vehicles) |
| `/neuf` | 60 | After adding or editing new vehicles |
| `/neuf/[brand]` | 60 | After adding/editing vehicles for a specific brand |
| `/occasion` | dynamic | After approving used listings |
| `/actu` | 30 | After publishing or editing articles |
| `/videos` | 30 | After YouTube sync |
| `/coups-de-coeur` | 60 | After toggling coup de coeur on/off for vehicles |
| `/forum` | 30 | After forum moderation actions |

**Note:** ISR automatically revalidates each page after its TTL expires. Manual revalidation via this endpoint is only needed when you need changes to appear immediately (e.g., right after a deployment or an urgent content correction).

### Smoke Tests

Run through each of the following manually after deployment:

- [ ] Homepage loads with all sections visible: hero, brand navigation, coups de coeur, articles, videos
- [ ] `/neuf` — vehicle grid loads, brand filter works, model filter works
- [ ] `/neuf/[brand]/[model]/[id]` — detail page loads, WhatsApp CTA opens `wa.me` link with correct phone number
- [ ] `/occasion` — used listings load, search and filters work
- [ ] `/occasion/[id]` — seller contact info is hidden when logged out (PII gating)
- [ ] `/actu` — articles load, category tabs filter correctly
- [ ] `/actu/[slug]` — article detail page renders with OG meta tags (view source, check `<meta property="og:title">`)
- [ ] `/videos` — video grid loads
- [ ] `/forum` — forum topics load
- [ ] Newsletter: submit an email address in the footer subscribe form — verify a new row appears in the `newsletter_subscribers` table in Supabase
- [ ] `/admin` — non-admin users are redirected away (test with a regular user account or logged-out session)
- [ ] View page source on any vehicle detail page — confirm `<meta property="og:title">`, `<meta property="og:image">`, and `<link rel="canonical">` are present

### Error Handling

- [ ] Navigate to `/occasion/nonexistent-id` — should show the Next.js 404 page, not a white screen
- [ ] Navigate to `/neuf/nonexistent-brand/nonexistent-model/nonexistent-id` — should show 404
- [ ] Check browser console on all major pages — no uncaught errors or failed network requests

### Performance

- [ ] Run Lighthouse on homepage — target 80+ performance score on mobile
- [ ] Verify no layout shift on hero section image load (CLS)
