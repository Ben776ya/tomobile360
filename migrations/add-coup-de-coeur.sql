-- Add Coup de Cœur fields to vehicles_new
-- Run this in the Supabase SQL Editor

ALTER TABLE vehicles_new
  ADD COLUMN IF NOT EXISTS is_coup_de_coeur BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coup_de_coeur_category TEXT CHECK (
    coup_de_coeur_category IN ('performance', 'classique', 'offroad', 'renaissance')
  );

-- Partial index for fast filtering of coup de coeur vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_new_coup_de_coeur
  ON vehicles_new (is_coup_de_coeur, coup_de_coeur_category)
  WHERE is_coup_de_coeur = true;
