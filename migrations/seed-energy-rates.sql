-- Seed: launch-default Moroccan energy prices for /outils/cout-100km.
-- Run AFTER create-energy-rates.sql.
--
-- IMPORTANT: every value below is a PLACEHOLDER launch default. Confirm the real
-- current Moroccan price and correct it before running — each row is tagged
-- `-- VERIFY BEFORE RUNNING`. The same numbers are mirrored in the code fallback
-- (src/lib/outils/cout-100km.ts → FALLBACK_RATES); keep the two in sync.
--
-- One-time seed. Re-running inserts duplicate rows; the app always reads the
-- most recent effective_date per rate_type, so a fresh price update should be a
-- NEW row with a later effective_date rather than an edit of these.

insert into public.energy_rates (rate_type, value_dh, unit, effective_date, source) values
  -- VERIFY BEFORE RUNNING — essence (gasoline) price at the pump, DH per litre.
  ('essence',    15.200, 'DH/L',   '2026-07-17', 'Moyenne stations Maroc — défaut de lancement'),
  -- VERIFY BEFORE RUNNING — diesel (gasoil) price at the pump, DH per litre.
  ('diesel',     13.600, 'DH/L',   '2026-07-17', 'Moyenne stations Maroc — défaut de lancement'),
  -- VERIFY BEFORE RUNNING — home electricity, DH per kWh (ONEE residential tier).
  ('kwh_home',    1.200, 'DH/kWh', '2026-07-17', 'ONEE tarif résidentiel — défaut de lancement'),
  -- VERIFY BEFORE RUNNING — public charging, DH per kWh (borne publique).
  ('kwh_public',  4.000, 'DH/kWh', '2026-07-17', 'Borne de recharge publique — défaut de lancement');
