-- Add origin (brand country) column to brands for the catalogue origin filter.
-- Powers the homepage "Voitures chinoises" button -> /neuf?origin=chinese
-- Additive only, no destructive changes.
ALTER TABLE brands ADD COLUMN IF NOT EXISTS origin TEXT NULL;

-- Tag Chinese brands. Business-curated list: includes Chinese-owned marques
-- such as MG and Lynk & Co (Chinese-owned / built in China). Excludes Volvo
-- (Swedish) and Smart (Mercedes-Geely JV, German heritage) by decision.
UPDATE brands
SET origin = 'China'
WHERE name IN (
  'BAIC','BYD','Changan','Chery','Deepal','DFSK','Dongfeng','Exeed','Foton',
  'Geely','GWM','JAC','Jaecoo','Jetour','Leapmotor','Lynk & Co','MG','Omoda',
  'Rox','Seres','SouEast','XPeng','Zeekr'
);
