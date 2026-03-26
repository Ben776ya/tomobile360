-- Add editorial reason text for Coup de Cœur vehicles
ALTER TABLE vehicles_new
  ADD COLUMN IF NOT EXISTS coup_de_coeur_reason TEXT;
