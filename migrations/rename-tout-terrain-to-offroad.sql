-- Rename coup de cœur category 'tout-terrain' → 'offroad'
-- Run this in the Supabase SQL Editor if you already ran add-coup-de-coeur.sql

UPDATE vehicles_new
  SET coup_de_coeur_category = 'offroad'
  WHERE coup_de_coeur_category = 'tout-terrain';

ALTER TABLE vehicles_new
  DROP CONSTRAINT IF EXISTS vehicles_new_coup_de_coeur_category_check;

ALTER TABLE vehicles_new
  ADD CONSTRAINT vehicles_new_coup_de_coeur_category_check
  CHECK (coup_de_coeur_category IN ('performance', 'classique', 'offroad', 'renaissance'));
