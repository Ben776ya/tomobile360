-- One fiche technique per version (audit 2026-10-21, F03/F04).
--
-- fiches_techniques.version = the EXACT string of a vehicles_new.variant_list[].version
-- of the same model; NULL = the legacy model-level fiche (all versions).
--
-- Order matters:
--   Step 1 — apply, then deploy the code that reads/writes per-version fiches.
--            The site reads rows with `select('*')`, so it renders the same before
--            and after this step; upserts (scripts/import-curated-with-fiches.mjs)
--            target the new (model_id, version) key, so they need this step.
--   Step 2 — only after that code is live. Until then the old unique(model_id)
--            still allows one row per model, so per-version rows cannot be
--            inserted next to a legacy row: run the per-version data job after it.

-- Step 1
alter table public.fiches_techniques add column version text;  -- NULL = legacy model-level fiche
alter table public.fiches_techniques add constraint fiches_techniques_model_version_unique unique nulls not distinct (model_id, version);

-- Step 2 (later, after the code is deployed)
alter table public.fiches_techniques drop constraint fiches_techniques_model_id_unique;
