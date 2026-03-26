-- Add is_featured_offer flag to vehicles_new
-- Used by the "Offres Spéciales" homepage section
-- Admin can toggle via the Tag button in /admin/vehicles

ALTER TABLE vehicles_new ADD COLUMN is_featured_offer BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_vehicles_new_is_featured_offer ON vehicles_new (is_featured_offer);
