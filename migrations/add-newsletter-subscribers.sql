-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- RLS: enable
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can insert (anon or authenticated)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS: no public select/update/delete
-- Admin reads via service role key (bypasses RLS)
