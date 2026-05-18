-- Service booking requests (contrôle technique today, extensible to other services).
CREATE TABLE IF NOT EXISTS service_bookings (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type    text NOT NULL,
  city            text NOT NULL,
  plate_number    text NOT NULL,
  preferred_date  date NOT NULL,
  phone           text NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_bookings_created_at_idx
  ON service_bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS service_bookings_status_idx
  ON service_bookings (status) WHERE status = 'pending';

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking"
  ON service_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
