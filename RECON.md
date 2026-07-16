# RECON.md — "Google Traffic" Workstream, Phase 0

**Date:** 2026-07-16
**Scope:** Read-only reconnaissance. No code was modified (R1).
**Repo root:** `tomobile360/` (Next.js 14 App Router, TypeScript, Supabase, deployed on Vercel).
**Method:** Direct reads of the model template + SEO helpers, plus four parallel exploration agents covering SEO infra, GA4/CTAs, the homepage empty-state, and the `/neuf` listing. All findings below carry `file:line` anchors.

---

## 0. TL;DR — what's true vs. what the brief assumed

Three parts of the brief rest on premises that the code contradicts. Flagging up front so we correct course before Phase 1:

| Brief's premise | Reality in code | Impact |
|---|---|---|
| **1A:** "Pages serve on `www`, canonicals point to non-`www` → inconsistency." | The **entire codebase is non-`www` apex** (`https://tomobile360.ma`) — `metadataBase`, sitemap, robots, every canonical, every JSON-LD. There is **zero `www` in app code.** The real gap: **no apex↔www 301 redirect exists at all**, and `next.config.js` currently marks **both** hosts indexable. | The decision "www becomes the canonical host" would mean flipping ~40 hardcoded literals + 6 local constants **to** www — the more invasive option. Making **apex** canonical is far more surgical (R2). **This is decision #1 below.** |
| **1B:** "`/neuf` emits the homepage's og:url/title/image." | `/neuf` **has its own** static metadata + canonical (`neuf/page.tsx:13,17`). The model page is the **best-covered** route (full `generateMetadata` + OG + twitter). The **only** route with no page-level metadata is the **homepage itself** (`app/page.tsx` has no metadata export → inherits root default). | Phase 1B shrinks to: (a) give the homepage its own explicit metadata block, (b) sweep remaining routes for missing/!own canonicals. Model+`/neuf` OG already correct. |
| **R4:** "version counts must read `variant_list`, not an aggregated field." | The **detail page reads `variant_list` correctly** (`page.tsx:79,89`). The **`/neuf` listing does NOT** — it derives `versionCount` from `groupVehicles.length` (`group-by-model.ts:82`), i.e. counts sibling rows, not variants. | The R4 bug is **live on the listing**, dormant on detail. Any version-count we touch must switch to `variant_list`. |

Everything else in the brief is broadly accurate. Details follow.

---

## 1. Repo & stack facts

- Next.js **14.2.x** App Router, React 18, TS 5, Tailwind, Supabase (`@supabase/ssr`), Sentry, Vercel Analytics + Speed Insights.
- Model detail route is **`/neuf/[brand]/[model]`** (model-level, one page per model). The old `/neuf/[brand]/[model]/[id]` is **301-redirected** to it (`next.config.js:113-124`). *(CLAUDE.md is stale here — it still references the `[id]` route.)*
- `revalidate = 60` (ISR) on catalog/detail pages.
- Site host is hardcoded as `https://tomobile360.ma` in ~40 files; `NEXT_PUBLIC_SITE_URL` is documented but **referenced nowhere in `src`**; `src/lib/links.ts:11 DOMAIN` exists but isn't consumed by metadata/sitemap/robots.

---

## 2. Canonical host, metadata, OG (Phase 1A / 1B)

**Host — everything is non-`www` apex.** `metadataBase = new URL('https://tomobile360.ma')` (`layout.tsx:44`); default OG `url` (`:53`); global canonical `/` (`:73`). Duplicated `BASE_URL/SITE_URL/DOMAIN` constants (all apex): `sitemap.ts:5`, `Breadcrumbs.tsx:5`, `MagazineSection.tsx:6`, `magazine/page.tsx:8`, `services/securite-routiere/page.tsx:8`, `lib/links.ts:11`. Plus ~40 inline literals (full list captured during recon; canonicals in the model page at `neuf/[brand]/[model]/page.tsx:115,259`).

**No host redirect.** `next.config.js` has exactly one redirect (`[id]→model`) and **no** apex↔www rule. Its `headers()` marks any host that is *neither* apex *nor* www as `noindex` (`next.config.js:63-64`) — so **both** apex and www are currently indexable = duplicate-host risk.

**generateMetadata coverage:**
- Full own canonical + OG: `neuf/[brand]/[model]` (`:108`), `actu/[slug]` (`:43`), `occasion/[id]` (`:51`), `videos/[id]` (`:22`), `actu` (`:16`), `forum/[category]` (`:18`).
- Static own metadata: `/neuf`, `/neuf/{promotions,populaires,nouveautes,comparer}`, `/occasion`, `/forum`, `/coups-de-coeur`, `/videos`, `/magazine`, all `/services/*`, legal pages, `/contact`, `/qui-sommes-nous`.
- **No page-level metadata (inherits root default): the homepage `app/page.tsx`.** This is the actual OG/canonical gap.

**Model page OG image** already = first curated vehicle image with fallback (`neuf/[brand]/[model]/page.tsx:120` → `vehicle.images?.[0] || '/og-image.png'`). Phase 1B's "generalize the model OG image" is effectively already done here.

## 3. Sitemap & robots (Phase 1A verification)

- `sitemap.ts` (`BASE_URL` apex): static list + dynamic `blog_posts` (`/actu/{slug}`), **model pages** `/neuf/{brand}/{model}` (`:70-80`), used listings `/occasion/{id}`.
- **Missing from sitemap** (pages that exist): `/magazine`, `/services/securite-routiere`, `/services/revision/detailing`, `/services/revision/dabapneu`, `/actu/tag/[tag]`. (`/login` correctly absent.)
- `robots.ts`: allow `/`, disallow `/admin/`,`/api/`; sitemap URL apex; no `host` field.
- **Phase 3 note:** `/outils/cout-100km` must be added to the sitemap when built.

## 4. Existing JSON-LD (Phase 2D baseline)

Helper: `components/seo/JsonLd.tsx` (wraps in `@context`/`@graph`). Present schemas:
- **Global** (`layout.tsx:94-133`): `WebSite` + `SearchAction` + `AutoDealer` + `ContactPoint`.
- **Model page** (`neuf/[brand]/[model]/page.tsx:261-312`): `Car` + `Brand` + `Offer`/`AggregateOffer` (MAD, only when priced). Already solid.
- **`BreadcrumbList`**: emitted by the shared `Breadcrumbs` component (`Breadcrumbs.tsx:30`) — **and the model page already uses it** (`:291`), rendering both a visible trail *and* the schema. (Its `BASE_URL` is apex, `:5`.)
- Other routes: `occasion/[id]` (`Car`+`Offer`), `actu/[slug]` (`NewsArticle`), `videos/[id]` (`VideoObject`), etc.
- **`FAQPage`: does not exist anywhere.** This is net-new for Phase 2C/2D.

So on model pages, Phase 2D reduces to **adding `FAQPage`** (mirroring the visible FAQ) — `Car`, `Offer`, and `BreadcrumbList` are already present and correct.

## 5. GA4 & conversion events (Phase 1C)

**GA4 is completely absent** — no gtag, no `dataLayer`, no `@next/third-parties`, no measurement ID, no `trackEvent` helper. Present: **Vercel Web Analytics** (pageviews only, `layout.tsx:8,144`) + Sentry (errors). Phase 1C is a **from-scratch build**.

**Every lead CTA fires nothing today:**

| CTA (KPI #2) | Where | Mechanism |
|---|---|---|
| WhatsApp (detail sidebar + sticky) | `neuf/[brand]/[model]/page.tsx:407,518` | inline `<a href="wa.me/…">` |
| WhatsApp (used) | `occasion/[id]/page.tsx:347,435` | inline `<a>` |
| WhatsApp (contact) | `contact/page.tsx:215` | `<a href={whatsappLink()}>` |
| Dealer contact | `shared/ContactDealerDialog.tsx:40` | `window.open(wa.me)` |
| Test drive | `shared/TestDriveDialog.tsx:40` | `window.open(wa.me)` |
| Estimation | `occasion/estimation/page.tsx:251` | client calc; "vendre" → m-occaz |
| Newsletter | `Footer.tsx:111` → `actions/newsletter.ts` | server action |
| Contact form | `contact/page.tsx:90` → `actions/contact.ts` | server action |

Architecture note: the two dialogs are shared (instrument once), but the **highest-value WhatsApp links are inline `<a>` duplicated per page** and don't use the `whatsappLink()` helper (`business-info.ts:69`). Plan introduces a shared tracked-link/`trackEvent` helper first, then wires both. Newsletter/contact are **server actions** → fire the GA4 event **client-side** on submit success (client gtag can't run server-side without the Measurement Protocol; client-side event on the form is simpler and sufficient for KPI #2).

## 6. Homepage empty-state — ROOT CAUSE (Phase 1D)

Section "Notre sélection du moment" is rendered by **`<FeatureGrid />` with no props** (`app/page.tsx:103`) — a **`'use client'`** component that fetches its own data **client-side** (anon key) at `FeatureGrid.tsx:283-288`:

```
.from('vehicles_new')
.select('… coup_de_coeur_reason, brands:brand_id(name), models:model_id(name)')
.eq('is_coup_de_coeur', true)
.eq('coup_de_coeur_category', category)   // category ∈ {voiture, suv, pickup}
.limit(10)
```

**Primary cause:** the curation flags were **wiped by a migration and never re-set in prod.** `migrations/rework-coup-de-coeur-categories.sql:6-9` unconditionally does `UPDATE vehicles_new SET is_coup_de_coeur=false, coup_de_coeur_category=NULL`, and changed the vocabulary from `performance/classique/offroad/renaissance` → `voiture/suv/pickup/electrique`. There is **no seed script**; re-tagging is manual via `/admin/coups-de-coeur`. If prod ran the migration but re-tagging happened only locally, prod matches **0 rows** → both cards show "Aucun modèle disponible" / "Aucun modèle électrique disponible" (`FeatureGrid.tsx:552-555`). *(Verify in prod: `select coup_de_coeur_category, count(*) from vehicles_new where is_coup_de_coeur group by 1;` — or just open `/admin/coups-de-coeur`.)*

**Secondary structural bug (independent):** the homepage tabs are only `voiture/suv/pickup` (`FeatureGrid.tsx:36-40`) — there is **no `electrique` tab** — yet admin + `/coups-de-coeur` treat `electrique` as a full 4th category. An admin who files an EV under `coup_de_coeur_category='electrique'` will see it on `/coups-de-coeur` but **never on the homepage**, whose electric card only reads rows tagged `voiture/suv/pickup`. So the electric card is structurally prone to emptiness regardless of curation.

**Ruled out:** case mismatch (`Electric` matches), `variant_list` (not touched here), `is_available` (not filtered here), RLS/env (same anon path powers `/neuf` in the same component).

**Fix implication:** Phase 1D's mandatory fallback (never render empty) is the robust code-side fix — when the curated slot is empty, fall back to popular models of that category. This survives both the wiped-flags and the `electrique`-mismatch conditions. Re-curating prod data is an operator action, not a code fix, but the fallback makes the page correct regardless.

## 7. `/neuf` listing hygiene (Phase 1E)

- **Duplicated filter — confirmed, but it's an intentional responsive pattern.** `VehicleFilters` is rendered twice: mobile `<details>` accordion `lg:hidden` (`page.tsx:232`) and desktop sidebar `hidden lg:block` (`page.tsx:267`), identical props. Both are in server HTML; CSS shows one. **Clarify intent (decision #2):** "remove the duplication" could mean (a) there's an actual visual double-render bug at some breakpoint (needs repro), or (b) reduce DOM weight / single-source the markup. Blindly deleting one block breaks either mobile or desktop.
- **Enum display — raw English shown** in dropdown options (`VehicleFilters.tsx:49-50,283-305`), chip labels (`:114-116`), and cards (`ModelCard.tsx:125,131`). A display map already exists as precedent: `FeatureGrid.tsx:43-48 FUEL_LABELS` (`Hybrid→Hybride`, `Electric→Électrique`, …) and admin `EngineSection.tsx:25-38` (`Manual→Manuelle`). Plan: create one shared `src/lib/vehicles/display-labels.ts`, apply at display sites only — **DB values untouched** (query params stay English, `page.tsx:83-84`).
- **Default sort — "Prix sur demande" interleaves.** Default is `newest` (`page.tsx:54`); its comparator only ranks `hasNewRelease` and ignores price (`page.tsx:143-146`), so null/0-price groups land arbitrarily. "Prix sur demande" is detected as **falsy `minPrice`** (`ModelCard.tsx:32`) — i.e. both `null` **and** `0`. Any "push to end" must treat both consistently (a `0` price currently sorts to the front in `price-asc`).

---

## 8. Data facts the plan depends on

- `vehicles_new.updated_at` exists (auto-trigger) and is **already selected** on the detail page (`page.tsx:80`); `fiches_techniques.updated_at` too (`:161`). → Phase 2B "Mis à jour le" can use `vehicle.updated_at` (the `models` table itself has only `created_at`).
- Model page reads `variant_list` correctly (R4-safe there); listing does not (R4 bug).
- `model.category` is displayed raw as a Badge (`page.tsx:341`) — Phase 2E category audit (Chevrolet Spark = "SUV" type) is a **read-only SQL report → CSV**, no auto-correct.
- Specs render helpers: `KeySpecsStrip` + `VehicleSpecs` (`components/vehicles/VehicleSpecs.tsx`) — Phase 2E null/zero hiding ("Couple 0 nm") applies here; needs its own read before editing.

---

# DECISIONS — RESOLVED (2026-07-16), amended by management same day

> **Amendments supersede the original decision text where they conflict.**

1. **Canonical host → WWW (checkpoint executed 2026-07-16, direction reversed from apex).** The indexed-host checkpoint found: (i) **Vercel serves `www` as primary** — `https://tomobile360.ma/...` returns **307 → `https://www.tomobile360.ma/...`**, www returns 200; (ii) **Google indexes the model pages on `www`** (`www.tomobile360.ma/neuf/kia/sonet`, `/land-rover/defender-110`, `/changan/uni-k`, `/toyota/land-cruiser-300`); only `/` and a filtered `/neuf?` show apex. The code emits **apex** canonicals on pages served+indexed on www — contradictory. Per the stop rule (www predominantly indexed), direction was **re-confirmed with management → go WWW-canonical.** Actions: rewrite the ~40 apex literals + local constants to `https://www.tomobile360.ma`; upgrade the apex→www redirect from **307 (temporary) to 301/308 (permanent)** — operator/Vercel-dashboard action; keep bare-host comparisons in `next.config.js` matching **both** hosts. This goes with the grain (no host migration).
2. **`/neuf` filter → EXTRACT SHARED CHILD (do NOT collapse to one instance).** The "duplicate" is an intentional responsive pattern, not a bug. Extract the filter *contents* into one shared child component that **both** the mobile `<details>` accordion **and** the desktop sidebar wrapper render. Do **not** reduce to a single morphing instance (responsive-bug risk). If extraction introduces any risk to mobile/desktop behaviour, **leave both blocks as-is and skip** — lowest-priority item in Phase 1.
3. **Homepage → FULL SCOPE.** (a) popular-model category fallback so the section never renders empty; (b) fix the missing `electrique` surfacing so EV-tagged cars can appear on the homepage; (c) deliver read-only SQL to check prod's current coup-de-cœur flag counts (operator runs it — MCP DB tools not authorized this session). *(Unchanged.)*
4. **GA4 → env-driven, ID provided by user; no property assumed to exist.** Loader reads `NEXT_PUBLIC_GA_MEASUREMENT_ID` (G-XXXX) from env; user supplies the ID into `.env.local` + Vercel (creating the GA4 property first if needed). Loader + `trackEvent` **must no-op cleanly when the ID is absent**.

## AMENDMENTS to the plan (management, 2026-07-16)

- **1B expanded:** don't stop at the homepage. **Audit `openGraph` on every static-metadata route** (`/neuf`, `/neuf/*`, `/occasion`, `/forum`, `/coups-de-coeur`, `/videos`, `/magazine`, `/services/*`, legal, `/contact`, `/qui-sommes-nous`). Live check confirms `/neuf` currently emits the **homepage's** og:url/title/image despite having its own title+canonical — i.e. static-metadata routes set title/description/canonical but inherit **root OG**. Add a page-specific `openGraph` wherever it's absent. The 6 `generateMetadata` routes + model page are already correct — **verify, don't rebuild**.
- **Sitemap additions folded into 1A:** add the pages §3 found missing — `/magazine`, `/services/securite-routiere`, `/services/revision/detailing`, `/services/revision/dabapneu`, `/actu/tag/[tag]`. Reserve `/outils/cout-100km` for Phase 3 (do **not** add yet).
- **Backlog (do NOT action):** logged in `BACKLOG.md` — B1 homepage hero budget tiers vs /neuf filter tiers vs market; B2 fiche technique spec depth (DB-content problem, not template).

---

# PROPOSED PLAN (adapted to the real code)

Each sub-task = atomic commit; each phase ends with `next build` green + a manual checklist; I stop at every GATE for your review (R3).

### Phase 1 — Measurement foundations + quick wins
- **1A Host unification** *(pending decision #1)*: single shared host constant (wire `NEXT_PUBLIC_SITE_URL` or `links.ts DOMAIN`), collapse the ~40 literals + 6 constants onto it; add `www→apex` (or apex→www) 301 in Vercel + `next.config.js`; make only the canonical host indexable; verify sitemap emits only canonical-host URLs.
- **1B Per-page OG/canonical**: add explicit `metadata` to the **homepage**; sweep the route list for any missing-own-canonical/OG (model + `/neuf` already correct); confirm model OG image generalization.
- **1C GA4 events**: add GA4 loader (env-driven ID) + a small `trackEvent` client helper; instrument `whatsapp_click` (brand/model params), `test_drive_request`, `dealer_contact`, `estimation_request`, `newsletter_signup` — via the two shared dialogs + the inline WhatsApp `<a>` sites + form success handlers.
- **1D Homepage never-empty**: category fallback in `FeatureGrid` (popular models of the category when curated slot empty); optionally fix the `electrique` surfacing gap; server-side render or graceful client fallback so no empty flash.
- **1E `/neuf` hygiene**: resolve filter-duplication per decision #2; shared display-label map (Hybride/Électrique/Manuelle/…); push "Prix sur demande" (falsy price, null **and** 0) to the end of the default sort.
- **GATE 1**: build + checklist (view-source canonical ×3, OG debugger, GA4 DebugView events, homepage fallback).

### Phase 2 — Model pages as "Prix X Maroc 2026" landings (1 template → 338 pages)
- **2A** Title `Prix [Brand] [Model] Maroc 2026 — Fiche Technique et Versions | Tomobile 360`; H1 stays human; meta description includes real price when present.
- **2B** Visible "Mis à jour le {date}" from `vehicle.updated_at`.
- **2C** Auto-FAQ (3–5 Qs) generated **only** from non-null data (price / consumption / puissance fiscale / …).
- **2D** Add **`FAQPage`** JSON-LD mirroring the visible FAQ (Car/Offer/BreadcrumbList already present); schema reflects only visible content.
- **2E** Conditional-render helper to hide null/zero specs ("Couple 0 nm") across `KeySpecsStrip` + `VehicleSpecs`; visible breadcrumb already present (normalize labels to Accueil > Neuf > Brand > Model); **read-only SQL → CSV** of suspect categories (no auto-correct). Also switch version counts to `variant_list` where the listing is wrong (R4).
- **GATE 2**: Rich Results Test on 3 sample pages (priced citadine / prix-sur-demande / electric) + category-suspects CSV.

### Phase 3 — Cost-per-100km tool + video linking
- **3A** New route `/outils/cout-100km` (+ sitemap, linked from EV/hybrid model pages & `/services`): Essence/Diesel/Hybride/Électrique comparison, **rates in editable config** (Supabase table or config file, updatable without deploy) with a visible "taux du {date}", pre-fillable consumption, DH/100km + annual cost, `WebApplication` schema + own OG, mobile-first.
- **3B** Lazy `VideoObject` embed component embeddable in model pages; **read-only mapping script** proposing video→model matches (reusing `match-video-to-car.ts` logic) → CSV for your validation.
- **GATE 3**: calculator working locally + screenshots; video mapping CSV.

**Out of scope (not started):** Arabic i18n, editorial copy (R5), populaires algorithm rework.

---

**STATUS: Phase 0 complete. Awaiting your approval + answers to the 4 decisions before touching any code (R1).**
