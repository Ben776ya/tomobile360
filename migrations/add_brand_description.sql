-- Add description column to brands table (additive only, no destructive changes)
-- D-35: Brand descriptions for contextual brand header on /neuf
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT NULL;
