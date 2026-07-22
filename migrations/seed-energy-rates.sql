-- Seed: launch-default Moroccan energy prices for /outils/cout-100km.
-- Run AFTER create-energy-rates.sql.
--
-- essence / diesel / kwh_home are operator-confirmed Moroccan prices (2026-07-22),
-- replacing the original launch placeholders. kwh_public is still an unconfirmed
-- estimate — tagged `-- VERIFY BEFORE RUNNING`. The same numbers are mirrored in
-- the code fallback (src/lib/outils/cout-100km.ts → FALLBACK_RATES); keep the two
-- in sync.
--
-- One-time seed for a FRESH database. Re-running inserts duplicate rows; the app
-- always reads the most recent effective_date per rate_type, so a price update on
-- an already-seeded database should be a NEW row with a later effective_date
-- rather than an edit of these (see update-energy-rates-2026-07-22.sql).

insert into public.energy_rates (rate_type, value_dh, unit, effective_date, source) values
  -- essence (gasoline) price at the pump, DH per litre.
  ('essence',    13.800, 'DH/L',   '2026-07-22', 'Moyenne stations Maroc'),
  -- diesel (gasoil) price at the pump, DH per litre.
  ('diesel',     12.800, 'DH/L',   '2026-07-22', 'Moyenne stations Maroc'),
  -- home electricity, DH per kWh (ONEE residential tier).
  ('kwh_home',    1.170, 'DH/kWh', '2026-07-22', 'ONEE tarif résidentiel'),
  -- VERIFY BEFORE RUNNING — public charging, DH per kWh (borne publique).
  ('kwh_public',  4.000, 'DH/kWh', '2026-07-22', 'Borne de recharge publique — estimation');
