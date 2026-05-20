# Tomobile 360 — Information to Provide Before Launch

Last updated: 2026-05-20

This is the consolidated list of every value the website needs from you before
launch. Each item lists what it is, where to put it, why it's needed, and the
expected format.

When a value is requested as `NEXT_PUBLIC_*`, set it in two places:
1. Local: `tomobile360/.env.local`
2. Production: Vercel → Project → Settings → Environment Variables (apply to Production + Preview environments)

After you set the env vars, run `npm run build` locally to confirm — `next build`
will throw a clear error if any of the **required** ones are missing.

---

## 1. Legal identifiers (mentions légales) — BLOCKER

These appear on `/mentions-legales` and are mandatory under Moroccan press law.

| # | Item | Env var | Format / example | Required? |
|---|------|---------|------------------|-----------|
| 1.1 | Registre de Commerce | `NEXT_PUBLIC_RC_NUMBER` | `RC Casablanca 123456` | **YES** — build throws if unset in prod |
| 1.2 | ICE | `NEXT_PUBLIC_ICE_NUMBER` | `001234567000099` (15-digit identifier) | **YES** |
| 1.3 | Directeur de la publication | `NEXT_PUBLIC_DIRECTOR_NAME` | `Rafik Kamal Lahlou` (full legal name) | **YES** |
| 1.4 | Capital social | `NEXT_PUBLIC_CAPITAL_SOCIAL` | `100 000 MAD` | Optional (hidden if unset) |

Sources: your SARL paperwork from the registrar; ICE certificate; press declaration.

---

## 2. CNDP declaration (privacy / loi 09-08) — BLOCKER

You must file a CNDP declaration for the data processed by the contact form, the newsletter, and the user accounts (article 12 of loi 09-08). Penalty for non-declaration is 10,000–100,000 MAD.

| # | Item | Env var | Format | Required? |
|---|------|---------|--------|-----------|
| 2.1 | CNDP declaration number | `NEXT_PUBLIC_CNDP_DECLARATION` | e.g., `D-GC-001/2026` | Highly recommended; shown in section 7 of `/confidentialite` only if set |

If you don't yet have a declaration on file:
- File one at https://www.cndp.ma (online portal)
- The base declaration covers contact-form leads + newsletter + user accounts
- Once granted, set the env var and the privacy page will surface the number

The `/confidentialite` page now references loi 09-08 and CNDP explicitly. Without the declaration number set, the page text says "is processed conformément à la loi 09-08" without claiming a declaration has been filed.

---

## 3. WhatsApp number (optional but recommended)

If you have a dedicated WhatsApp number for sales/contact, set these. Otherwise leave unset — the site falls back to the office landline (`+212 522 54 81 50`) for both display and `wa.me` links.

| # | Item | Env var | Format |
|---|------|---------|--------|
| 3.1 | Display form (footer, contact, vehicle CTAs) | `NEXT_PUBLIC_WHATSAPP_DISPLAY` | `+212 6XX XX XX XX` |
| 3.2 | wa.me link form | `NEXT_PUBLIC_WHATSAPP_E164` | `2126XXXXXXXX` (no `+`, no spaces) |

---

## 4. Email aliases for the team — BLOCKER for newsletter trust

The public team page at `/qui-sommes-nous` now displays `@tomobile360.ma` email addresses for the four team members. Until you create the forwards, those addresses look right but won't actually receive email. Create these forwards in your domain registrar / Google Workspace / Cloudflare Email Routing:

| Alias displayed on site | Forward to existing inbox |
|-------------------------|----------------------------|
| `rafik@tomobile360.ma` | `rafiklahlou@gmail.com` |
| `david@tomobile360.ma` | `davidolivierjeremie@gmail.com` |
| `amine@tomobile360.ma` | `aminebouharaoui@gmail.com` |
| `nabil@tomobile360.ma` | `nabnabilbennani@gmail.com` |
| `contact@tomobile360.ma` | choose recipient (e.g., Rafik) |
| `privacy@tomobile360.ma` | choose recipient (e.g., Rafik) |

Same step: set up **SPF + DKIM + DMARC** on `tomobile360.ma` so newsletter and form replies don't go to spam.

---

## 5. Team photos (optional)

The four team members render with initials + "Photo à venir" pill. The pill **disappears automatically** the moment you add a `photoUrl` string to a team entry in `src/app/qui-sommes-nous/page.tsx` (around lines 22–84).

Recommended format: 400×400 px JPEG/PNG, head-and-shoulders crop, uploaded under `/public/team/`. Examples:
```ts
{
  initials: 'RK',
  name: 'Rafik Kamal Lahlou',
  // ...
  photoUrl: '/team/rafik.jpg',  // ← add this line
}
```

People to photograph:
- Rafik Kamal Lahlou (Fondateur & Directeur de rédaction)
- David Jérémie (Journaliste Automobile)
- Amine Bouharaoui (Journaliste Spécialisé)
- Nabil Bennani / NAB (Humoriste & Animateur)

---

## 6. NARSA capsule videos

✅ **Status: all 7 videos already uploaded** to the Supabase `narsa-videos` bucket. The `/services/securite-routiere` page should play all 7 capsules without further action. If a capsule appears broken when you test live, the issue is in Supabase storage policy or RLS, not the upload itself.

Files confirmed present:
- `capsule-1-pietons.mp4`
- `capsule-2-motos.mp4`
- `capsule-10-taxis.mp4`
- `capsule-11-distance-securite.mp4`
- `capsule-12-couloirs.mp4`
- `capsule-13-piste-cyclable.mp4`
- `capsule-14-panneaux-signalisation.mp4`

---

## 7. Magazine issues — content cleanup

The `magazines` table has 6 issues. **5 of them still show the generic placeholder `Numéro à découvrir` as the dossier title**. Issue N°644 is in there with `order_position = 1`, which makes it appear first on the page — almost certainly stray test data left over from an import.

| issue_number | dossier_title | order_position | Action |
|--------------|--------------|----------------|--------|
| 1 | Numéro à découvrir | 2 | Fill real dossier title |
| 2 | Numéro à découvrir | 3 | Fill real dossier title |
| 3 | Numéro à découvrir | 4 | Fill real dossier title |
| 4 | Numéro à découvrir | 5 | Fill real dossier title |
| 5 | Ces nouveautés qui vont marquer 2026 | 6 | ✅ already real |
| **644** | Numéro à découvrir | **1** | **Decide:** delete (if test data) or correct issue_number and order_position |

Edit via `/admin/magazines` (or whichever admin route handles magazines — verify with the team). At minimum, decide what to do with N°644.

---

## 8. Vehicle prices — ✅ clean

No vehicle in the `vehicles_new` table has a `price_min` outside the sanity range of 50,000 – 5,000,000 MAD, and no row has a NULL `price_min`. The audit's M1/M2 findings ("1 DH, 2 DH" on the listing page) appear to have been against an older snapshot; the current DB is clean.

If a row ever drifts out of bounds, the prelaunch scan script + the deploy SQL guard are your safety net — both are tracked in this repo.

---

## 9. Article internal links — ✅ clean

No article in either `articles` or `blog_posts` contains anchor links to `/comparatifs/`, `/fiches-techniques/`, or `/blog/` (the audit M36–M40 concerns). The grep hits during DB audit were false positives — they matched Supabase image storage paths like `blog-images/blog/photo.png`, not article href targets.

---

## 10. Optional: real contrôle technique partner

The `/services/controle` page now displays "Service en cours de déploiement" because no partner has been declared. When you contract one (e.g., DEKRA, SGS, SOREEC), provide:

- Partner name + logo file (preferred: SVG or 200×200 PNG)
- Real number of partner centers (overall + per major city if known)
- Real average price range for contrôle technique (varies by vehicle type — passenger car typically 150–450 MAD)
- Real average duration (e.g., 30 minutes — only if your partner commits to it)
- Confirmation whether contre-visite is included free or paid extra (often NOT free in Morocco — don't claim free unless your partner confirms)

We will repopulate the page with verified content once you provide these.

---

## 11. Optional: detailing partner

Same as #10, for `/services/revision/detailing`. Until a partner exists, the page uses generic copy without partner-implying claims ("Service en cours de déploiement").

Provide:
- Partner name + logo
- Real package list with real prices (if a partner brand offers fixed packages)
- City coverage

---

## 12bis. Sentry (error reporting) — wired, needs env var in Vercel

`@sentry/nextjs` is fully wired into the build (client, server, edge runtimes + Next.js error boundaries + 5 server actions). It only activates when a DSN is present in the environment — local builds without the var continue to work unchanged.

| # | Item | Env var | Value |
|---|------|---------|-------|
| 12b.1 | Sentry DSN (project: tomobile360, region: eu/de) | `NEXT_PUBLIC_SENTRY_DSN` | `https://b71b5a4035e7c790c9839b1e814ceebf@o4511268969709568.ingest.de.sentry.io/4511422962073680` |
| 12b.2 | Sentry auth token (optional, source-map upload) | `SENTRY_AUTH_TOKEN` | issue at https://tomobile360.sentry.io/settings/auth-tokens/ — scope `project:releases` |
| 12b.3 | Sentry org slug (optional, only used during build for source-map upload) | `SENTRY_ORG` | `tomobile360` (or whatever your org slug is) |
| 12b.4 | Sentry project slug (optional, only used during build for source-map upload) | `SENTRY_PROJECT` | `tomobile360` |

The DSN is public-by-design (it's safe in the client bundle). Set it for **Production** and **Preview** environments in Vercel. The auth token / org / project trio is only needed if you want sourcemaps uploaded so stack traces deminify — without them, Sentry still receives errors, you just see compiled line numbers.

Tunnel route: `/monitoring` (the SDK proxies events through your own domain to bypass ad-blockers). No setup needed — already wired in `next.config.js`.

---

## 12. Optional: marketing photos and SOFAC/AtlantaSanad disclaimers

The current SOFAC and AtlantaSanad disclaimers on `/services/credit` and `/services/assurance` use standard regulatory language. **Have your legal/compliance contact at each partner review them once** before launch. They may want specific wording about:
- "TEG indicatif" thresholds (for SOFAC)
- ACAPS reference numbers (for AtlantaSanad)
- The exact partner agreement language

These are not blockers — the current text is defensible — but a partner sign-off is best practice.

---

## What you can ignore from the audit

The following audit items were **already resolved** in the local codebase (verified during plan creation) — the audit detected them only because it ran against an older Vercel preview:

- M11 — footer placeholder address `123 Boulevard Mohammed V` (footer uses centralized BUSINESS_INFO with the real address)
- M12 — footer placeholder phone `+212 522-123456` (uses centralized BUSINESS_INFO)
- M13 — bare social URLs (uses EXTERNAL_LINKS with real profile URLs)
- M16 — Bank of Africa card on `/services` (removed)
- M27 — `/neuf/comparer` empty body (component renders correctly)
- M28/M29/M30 — empty-state pages (queries DB; will populate as content lands)
- M31/M32 — `/videos` YouTube boilerplate (only `description` field shown, line-clamped)
- M33 — article tag concatenation (rendered as chips)
- M36–M41 — article dead links (confirmed NOT in current DB content)
- M45/M46/M47 — per-page metadata and canonicals (set on every major route)
- M48 — `logo_tomobil360.png` typo (deleted; only `logo_tomobile360.png` in repo)
- M49 — URLs with literal spaces (`slug()` function handles)
- 2.1/2.2 — Wandaloo / NetCarShow references (zero occurrences in code)
- 3.1/3.2/3.3/3.4 — two-versions-of-component issues (single Footer/Header/etc.)

So your remaining work is concentrated in sections 1, 2, 4 above (legal IDs, CNDP, email aliases). Sections 5, 7, 10, 11, 12 are nice-to-haves; section 3 only matters if you want a dedicated WhatsApp number.

---

## Pre-deploy checklist

Before pushing to production:

- [ ] Set all 3 required env vars (RC, ICE, DIRECTOR) in Vercel
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel (Production + Preview)
- [ ] File the CNDP declaration and set `NEXT_PUBLIC_CNDP_DECLARATION`
- [ ] Create the 6 email forwards on `tomobile360.ma`
- [ ] Decide what to do with magazine issue N°644 (delete or correct)
- [ ] Fill real dossier titles for magazine issues 1–4
- [ ] Run `npm run build` locally — must succeed
- [ ] Run `bash scripts/prelaunch-scan.sh` — all 6 scans must pass
- [ ] Smoke-test `/mentions-legales`, `/confidentialite`, `/conditions`, `/services/credit`, `/services/assurance`, `/services/controle`, `/qui-sommes-nous` from a fresh incognito tab
- [ ] Confirm cookie banner appears on first visit, dismisses on accept/refuse, doesn't reappear
- [ ] Test contact form end-to-end (real email submission, double opt-in if applicable)
- [ ] Test newsletter form end-to-end

End of dossier.
