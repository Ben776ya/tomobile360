# BACKLOG — "Google Traffic" Workstream (out of scope, do NOT action)

Items surfaced during the workstream that are **out of scope** for the current phases. Logged for a later product decision — no code to be written against these now.

## B1 — Homepage hero budget tiers misaligned with /neuf filter tiers & market
- **What:** Homepage hero budget tiers are 400k / 800k / 1M DH, while the `/neuf` filter uses 150k / 250k / 350k / 500k, and the actual market volume is largely **sub-300k DH**.
- **Why it's backlog:** Needs a product/marketing decision on the right tier bands, not a mechanical code fix. Changing tiers affects hero UX + filter UX + user expectations.
- **Not now because:** out of the measurement/SEO scope; no clear "correct" values without a product call.
- **Owner:** product decision (then a small code change to align the two tier sets).

## B2 — Fiche technique spec depth ("complète" but ~8 lines)
- **What:** Model pages promise "fiche technique **complète**" in copy/meta, but render only ~8 spec lines for many vehicles.
- **Why it's backlog:** This is a **vehicle-data completeness** problem (missing values in `vehicles_new` / `fiches_techniques`), not a template bug. The template already renders every field it has; it just has little to render.
- **Not now because:** fixing it means enriching DB content (editorial/data workstream, cf. R5), not changing code. Phase 2E's null-hiding will make sparse fiches look intentional rather than broken, but won't add data.
- **Owner:** data/editorial (populate specs), separate from this template workstream.

---
*Created 2026-07-16 during Phase 0 → Phase 1 handoff. Do not build from this file without an explicit go-ahead.*
