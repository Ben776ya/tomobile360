-- READ-ONLY AUDIT — Phase 2E (category-suspects)
--
-- Purpose: surface `models.category` values that look inconsistent so a human
-- can review and, if warranted, fix them in /admin. This query is SELECT-only
-- and performs NO writes — there is deliberately no auto-correction (R2/R3).
--
-- How to produce audits/category-suspects.csv:
--   1. Open the Supabase SQL editor against the PRODUCTION database.
--   2. Run this query.
--   3. Export the result grid as CSV and save it to audits/category-suspects.csv.
--
-- Output columns (match the CSV header): brand, model, current_category,
-- reason, confidence.
--
-- Heuristics are intentionally conservative — a flag is a prompt to review, not
-- a verdict. "high" = almost certainly wrong (missing/non-standard value, or a
-- well-known nameplate in the wrong body style). "medium" = worth a look.

with canonical(cat) as (
  values ('Citadine'), ('Compacte'), ('Berline'), ('SUV'), ('Monospace'),
         ('Break'), ('Coupé'), ('Cabriolet'), ('Pick-up'), ('Utilitaire')
),
-- Nameplates that are unambiguously pick-ups.
pickup_kw(kw) as (
  values ('hilux'), ('ranger'), ('navara'), ('l200'), ('l 200'), ('d-max'),
         ('dmax'), ('amarok'), ('frontier'), ('gladiator'), ('rodeo'), ('poer'),
         ('wingle'), ('taro'), ('terra'), ('alaskan'), ('fullback'), ('triton'),
         ('np300'), ('musso')
),
-- Nameplates that are unambiguously city cars (citadines).
citadine_kw(kw) as (
  values ('spark'), ('picanto'), ('i10'), ('aygo'), ('twingo'), ('panda'),
         ('kwid'), ('celerio'), ('alto'), ('adam'), ('citigo')
),
base as (
  select b.name as brand, m.name as model, m.category as current_category,
         lower(m.name) as lname
  from models m
  join brands b on b.id = m.brand_id
)
select brand, model, current_category, reason, confidence
from (
  -- 1) Missing category.
  select brand, model, current_category,
         'Catégorie manquante' as reason, 'high' as confidence, 1 as ord
  from base
  where current_category is null or btrim(current_category) = ''

  union all
  -- 2) Non-standard category value (not in the canonical enum).
  select brand, model, current_category,
         'Valeur de catégorie non standard' as reason, 'high', 2
  from base
  where current_category is not null and btrim(current_category) <> ''
    and current_category not in (select cat from canonical)

  union all
  -- 3) Pick-up nameplate not categorised as Pick-up.
  select brand, model, current_category,
         'Le nom évoque un pick-up' as reason, 'high', 3
  from base
  where current_category is distinct from 'Pick-up'
    and exists (select 1 from pickup_kw where base.lname ~ ('\y' || kw || '\y'))

  union all
  -- 4) City-car nameplate categorised as a larger body style
  --    (e.g. the classic "Chevrolet Spark listed as SUV").
  select brand, model, current_category,
         'Le nom évoque une citadine' as reason, 'medium', 4
  from base
  where current_category in ('SUV', 'Pick-up', 'Monospace', 'Break', 'Utilitaire')
    and exists (select 1 from citadine_kw where base.lname ~ ('\y' || kw || '\y'))
) s
order by ord, brand, model;
