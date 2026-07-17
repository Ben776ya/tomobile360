-- Energy rates: current Moroccan fuel/energy prices powering the
-- "Combien coûte 100 km" calculator (/outils/cout-100km). Public pricing data,
-- read by anon via RLS. Run this file first, then seed-energy-rates.sql.
--
-- Apply via the Supabase SQL editor (or the Supabase MCP once the boundary is
-- open) against project atbkdxmxuqorebrttzma, then regenerate
-- src/lib/database.types.ts so the hand-added energy_rates block is reconciled.

-- ----------------------------------------------------------------------------
-- Table
-- ----------------------------------------------------------------------------

create table if not exists public.energy_rates (
  id uuid primary key default gen_random_uuid(),
  -- 'essence' | 'diesel' | 'kwh_home' | 'kwh_public' (free text, kept flexible
  -- like the rest of the schema; the app maps unknown types to a fallback).
  rate_type text not null,
  -- Price in Moroccan dirhams, per unit (per litre for fuels, per kWh for
  -- electricity). numeric(8,3) keeps sub-dirham precision (e.g. 1.300 DH/kWh).
  value_dh numeric(8,3) not null,
  -- Display unit: 'DH/L' | 'DH/kWh'.
  unit text not null,
  -- The date these prices took effect; shown to users as "Tarifs du ...".
  effective_date date not null,
  -- Human-readable provenance label, e.g. "ONEE" / "moyenne stations 2026".
  source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fast "latest active rate per type" lookups.
create index if not exists energy_rates_type_date_idx
  on public.energy_rates (rate_type, effective_date desc);

-- ----------------------------------------------------------------------------
-- Row Level Security — anon may read active rows only (public pricing data).
-- ----------------------------------------------------------------------------

alter table public.energy_rates enable row level security;

create policy "energy_rates_select_active_anyone"
  on public.energy_rates for select
  using (is_active = true);

-- ----------------------------------------------------------------------------
-- updated_at trigger — reuse the shared function (already defined by
-- add-magazines.sql; create or replace is idempotent).
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists set_energy_rates_updated_at on public.energy_rates;
create trigger set_energy_rates_updated_at
  before update on public.energy_rates
  for each row execute function public.set_updated_at();
