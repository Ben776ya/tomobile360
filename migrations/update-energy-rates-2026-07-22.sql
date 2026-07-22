-- Price update: operator-confirmed Moroccan energy prices for /outils/cout-100km.
--
-- Replaces the 2026-07-17 launch placeholders (essence 15.200, diesel 13.600,
-- kwh_home 1.200) with confirmed real prices. Per the table's design, this is an
-- INSERT of NEW rows with a later effective_date — NOT an edit of the seed rows.
-- The data layer reads the most recent effective_date per rate_type, so these
-- supersede the old values while the earlier prices remain as price history.
--
-- kwh_public is intentionally NOT updated here: no confirmed figure was supplied,
-- so it keeps its 2026-07-17 estimate of 4.000 DH/kWh.
--
-- Mirrored in the code fallback (src/lib/outils/cout-100km.ts → FALLBACK_RATES)
-- and migrations/seed-energy-rates.sql; keep all three in sync.

insert into public.energy_rates (rate_type, value_dh, unit, effective_date, source) values
  ('essence',  13.800, 'DH/L',   '2026-07-22', 'Moyenne stations Maroc'),
  ('diesel',   12.800, 'DH/L',   '2026-07-22', 'Moyenne stations Maroc'),
  ('kwh_home',  1.170, 'DH/kWh', '2026-07-22', 'ONEE tarif résidentiel');

-- Verify the calculator will now read these three:
--   select distinct on (rate_type) rate_type, value_dh, effective_date
--   from public.energy_rates
--   where is_active = true
--   order by rate_type, effective_date desc;
