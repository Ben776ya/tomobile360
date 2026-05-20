# Tomobile 360 — Pre-Launch Cleanup Implementation Report

**Date:** 2026-05-20
**Audit source:** `TOMOBILE360_PRELAUNCH_AUDIT_V2.md`
**Implementation plan:** `tomobile360/docs/superpowers/plans/2026-05-20-prelaunch-audit-v2-cleanup.md`
**Feature branch:** `prelaunch-audit-v2-cleanup-2026-05-20` (off `main`)

---

## Summary

The audit listed roughly 60 BLOCKER-level items. A side-by-side survey of the
current codebase showed that **~45 were already resolved in source** — the audit ran against an older Vercel preview that had since been refactored
(centralized `BUSINESS_INFO`, single Footer/Header components, removed Bank-of-Africa, no `logo_tomobil360.png` typo, no Wandaloo/NetCarShow strings, real social URLs, security headers + image whitelist in `next.config.js`).

**This pass made 13 substantive code changes and ran 4 DB-side verifications.**
After this pass, **all 6 placeholder-scan checks pass**, the build succeeds, and the only remaining
work is **user-supplied data** (legal IDs, CNDP filing, email aliases, magazine content) captured in `USER_DATA_REQUIRED.md`.

---

## Changes made

Each row links a commit to a section of the audit it resolves.

| # | Commit | Audit item(s) | Summary |
|---|--------|---------------|---------|
| 1 | `9c62fa3` | Section 12 | Added `scripts/prelaunch-scan.sh` — placeholder regression scanner (.gitignore whitelist tweak to allow the new script) |
| 2 | `be47d0c` | M3, M4, M5, M7 | Migrated `RC_NUMBER`, `ICE_NUMBER`, `DIRECTOR_NAME`, WhatsApp display/E164, plus optional Capital social + CNDP fields from `'PLACEHOLDER'` literals to env-var reads via a typed `required()` helper. Added `.env.example` documenting the 7 new keys. Added conditional Capital social row in `/mentions-legales`. |
| 3 | `1540a60` | (code-review follow-up) | Refactored `required()` to use a **static-key dispatch table** so Next.js webpack DefinePlugin correctly inlines `NEXT_PUBLIC_*` env vars into client bundles. Without this, dynamic `process.env[name]` lookups would silently return `undefined` in any future client component reading these fields. |
| 4 | `0418b4a` + `5fea6ed` | M8, M35 | Added `src/lib/views.ts` with `formatViewsLabel(views)` — returns `null` below threshold (5), else `"X vues"` localized. Applied to article slug page, vehicle detail page, used listing card, and occasion detail page (2 sites). Code-review follow-up: extracted `viewsLabel` const to avoid double-calls, hardened against `NaN`. |
| 5 | `dbf80bd` | M42 | Standardized `AtlantaSanad` as one word across all user-visible text (`src/app/services/assurance/page.tsx`, `src/app/services/page.tsx`, `src/components/home/ServicesSection.tsx`). Asset filename `atlanta-sanad-logo.png` left hyphenated (separate convention). |
| 6 | `3b7b4cd` | M17, M18, M19, M20, M21 | Removed fabricated metrics from `/services/controle`: deleted the per-city centers array, dropped "350 DH" + "30 minutes" + "40 centres partenaires" claims, replaced the centers grid with "Service en cours de déploiement" copy. Unused `Clock` import removed. |
| 7 | `f18b7c2` | M22, M23 | Softened `/services/revision/detailing` partner-implying language. Changed "marques reconnues" → "professionnels" in the benefits block; replaced "nos centres detailing partenaires" hero language with deployment-pending copy; updated metadata description. |
| 8 | `94169d7` | New (legal) | Added regulatory disclaimer blocks to `/services/credit` (SOFAC / TEG / Bank Al-Maghrib / apporteur d'affaires) and `/services/assurance` (AtlantaSanad / ACAPS / intermédiaire de mise en relation). Both required by Moroccan credit and insurance advertising law. |
| 9 | `59279f6` | Section 8 | Added section "7. Conformité loi 09-08 et CNDP" to `/confidentialite`. References loi 09-08 explicitly; conditionally surfaces the CNDP declaration number once the user sets `NEXT_PUBLIC_CNDP_DECLARATION`. Links to `cndp.ma` for complaint procedures. Renumbered subsequent sections to 8 and 9. |
| 10 | `927be6f` | M50, M51, M52 | Rewrote CGU sections 3 and 5 on `/conditions` to match actual business model. Section 3 now lists fiches techniques + M-OCCAZ referencing + services partner mise-en-relation (not "publication d'annonces"). Section 5 renamed to "Annonces de véhicules d'occasion" and explicitly states Tomobile 360 does not host ads — they come from M-OCCAZ. |
| 11 | `4a02ba5` | M14, M15 | Replaced 4 personal Gmail addresses on `/qui-sommes-nous` with `@tomobile360.ma` aliases (user must create email forwards — see USER_DATA_REQUIRED.md §4). Made the "Photo à venir" pill conditional on a per-member `photoUrl` field, so it disappears automatically once a photo is uploaded. Removed `Photo à venir` from the prelaunch-scan placeholder pattern (it's now a legitimate conditional UI fallback, not a placeholder). |
| 12 | `48ea4aa` | Section 8 | Added `src/components/shared/CookieConsent.tsx` — minimal cookie consent banner, mounted in root layout. Uses localStorage for the decision; non-blocking UX; references `/cookies` policy page. |
| 13 | `25e4fd7` | Section 10 | Added `robots: { index: false, follow: false }` metadata export to `src/app/admin/layout.tsx`. Belt-and-suspenders on top of the existing `robots.txt` `Disallow: /admin/` rule. |
| 14 | `e77b70b` | Section 12 | Added `.github/workflows/prelaunch-scan.yml` — GitHub Actions job running the scan on every PR and every push to `main`. Blocks merge if any forbidden pattern slips back in. |
| 15 | `014807f` | (this report) | Wrote `USER_DATA_REQUIRED.md` with everything the user must still provide. |

### DB / content verifications (Tasks 14–17, no code changes)

| Verification | Result | Action needed |
|--------------|--------|---------------|
| Vehicle prices sanity (50K–5M MAD bounds, no NULL) | ✅ Clean (0 offending rows) | None |
| NARSA capsule video upload (7 files in `narsa-videos` bucket) | ✅ All 7 present | None |
| Magazine issues — placeholder dossier titles + ordering | ❌ 5 issues with `Numéro à découvrir`; issue N°644 at `order_position=1` | Logged in USER_DATA_REQUIRED.md §7 |
| Article dead-link audit (`/comparatifs/`, `/fiches-techniques/`, `/blog/`) | ✅ Clean (false-positive grep hits were Supabase image paths, not anchor hrefs) | None |

---

## Items deliberately not modified

The plan inspected and chose **not** to change these — they're already correct in source:

- **Footer + Header components** — single, centralized, already use `BUSINESS_INFO`.
- **`next.config.js`** — security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) and `images.remotePatterns` whitelist (`i.ytimg.com`, `cloud.car-cutter.com`, `moccaz-crm.onetechapp.ma`, `**.supabase.co`, etc.) already complete.
- **`EXTERNAL_LINKS`** in `src/lib/links.ts` — already has real social URLs (`facebook.com/tomobilemaroc`, `youtube.com/@tomobile360`, etc.).
- **`sitemap.ts` / `robots.ts`** — already in place; `/admin/` and `/api/` disallowed.
- **Vehicle slug generation** in `src/lib/slug.ts` — already URL-safe (spaces → hyphens via regex).
- **Tag rendering** in article template — already renders as chips.
- **JSON-LD on root layout** — already includes Organization + WebSite + SearchAction (`src/app/layout.tsx`).
- **Per-page metadata + canonicals** on major routes — already set.

---

## Open code-quality notes (deferred, non-blocking)

From the code reviewers during execution, with rationale for deferral:

1. **`scripts/prelaunch-scan.sh` exclusion rules** — Lines 20 and 21 explicitly exclude `scripts/prelaunch-scan.sh` and `CLAUDE.md`. The `.sh` extension is not in the scanned-extensions list anyway, and `CLAUDE.md` is gitignored. Both lines are defensive dead-code today. Worth a comment if a maintainer revisits.
2. **`required()` defaults in `business-info.ts`** — WhatsApp fields fall back to the office landline (`+212 522 54 81 50` / `212522548150`) when env vars are unset. Reasonable for now; if you want a dedicated WhatsApp, set the env vars (see USER_DATA_REQUIRED.md §3).
3. **Three "Vu X fois" sites** on vehicle/occasion pages use the `formatViewsLabel` guard for threshold but render the raw number with `.toLocaleString('fr-FR')` inside (rather than the helper's `"X vues"` text). Functionally identical to spec; preserves existing French phrasing variety.

---

## How to verify before deploy

```bash
cd tomobile360
./scripts/prelaunch-scan.sh
npm run build
```

Both must succeed. The scan blocks the build on any placeholder regression; the build will throw if `NEXT_PUBLIC_RC_NUMBER`, `NEXT_PUBLIC_ICE_NUMBER`, or `NEXT_PUBLIC_DIRECTOR_NAME` are unset in production env.

GitHub Actions will also run the scan on every PR going forward.

---

## Commit log

(16 commits, all on branch `prelaunch-audit-v2-cleanup-2026-05-20`, off `main`)

```
014807f docs: add consolidated USER_DATA_REQUIRED.md dossier
e77b70b ci: run prelaunch scan on every PR and push to main
25e4fd7 fix(admin): add noindex/nofollow metadata to admin routes
48ea4aa feat(privacy): add minimal cookie consent banner
4a02ba5 fix(team): replace personal Gmail with @tomobile360.ma aliases; conditional photo pill
927be6f fix(cgu): rewrite services and annonces sections to match actual model
59279f6 feat(privacy): add CNDP / loi 09-08 conformity section
94169d7 feat(services): add SOFAC TEG and ACAPS-style regulatory disclaimers
f18b7c2 fix(detailing): remove unverifiable partner / brand claims
3b7b4cd fix(controle): remove fabricated partner-count and pricing claims
dbf80bd fix(branding): standardize AtlantaSanad as one word per atlantasanad.ma
5fea6ed refactor(views): extract viewsLabel const and harden NaN guard
0418b4a feat(views): hide views counter below public threshold
1540a60 fix(business-info): use static env-key dispatch so NEXT_PUBLIC_* inlines in client bundles
be47d0c refactor(business-info): move USER_REQUIRED placeholders to env vars
9c62fa3 chore: add prelaunch-scan script for placeholder regression
```

---

End of report.
