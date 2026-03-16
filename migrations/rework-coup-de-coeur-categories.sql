-- Rework Coup de Cœur categories
-- Old categories: performance, classique, offroad, renaissance
-- New categories: voiture, suv, pickup, electrique
-- Each category now has ONE winner vehicle

-- Step 1: Clear all existing coup de cœur tags
UPDATE vehicles_new
SET is_coup_de_coeur = false,
    coup_de_coeur_category = NULL;

-- Step 2: Drop old CHECK constraint if it exists
ALTER TABLE vehicles_new
DROP CONSTRAINT IF EXISTS vehicles_new_coup_de_coeur_category_check;

-- Step 3: Add new CHECK constraint with updated category values
ALTER TABLE vehicles_new
ADD CONSTRAINT vehicles_new_coup_de_coeur_category_check
CHECK (coup_de_coeur_category IN ('voiture', 'suv', 'pickup', 'electrique'));
