-- Tomobile 360 - Complete Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Brands Table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Models Table
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Citadine', 'Compacte', 'Berline', 'SUV', 'Monospace', 'Break', 'Coupé', 'Cabriolet', 'Pick-up', 'Utilitaire')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- New Vehicles Table
CREATE TABLE vehicles_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  model_id UUID REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  version TEXT,
  year INTEGER NOT NULL,
  price_min DECIMAL(12,2),
  price_max DECIMAL(12,2),
  fuel_type TEXT CHECK (fuel_type IN ('Essence', 'Diesel', 'Hybrid', 'Electric', 'PHEV')),
  transmission TEXT CHECK (transmission IN ('Manual', 'Automatic', 'CVT', 'DCT')),
  engine_size DECIMAL(3,1),
  cylinders INTEGER,
  horsepower INTEGER,
  torque INTEGER,
  acceleration DECIMAL(4,2),
  top_speed INTEGER,
  fuel_consumption_city DECIMAL(4,2),
  fuel_consumption_highway DECIMAL(4,2),
  fuel_consumption_combined DECIMAL(4,2),
  co2_emissions INTEGER,
  dimensions JSONB,
  cargo_capacity INTEGER,
  seating_capacity INTEGER,
  features JSONB,
  safety_features JSONB,
  images JSONB,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT FALSE,
  is_coming_soon BOOLEAN DEFAULT FALSE,
  launch_date DATE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Used Vehicle Listings Table
CREATE TABLE vehicles_used (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  model_id UUID REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  fuel_type TEXT CHECK (fuel_type IN ('Essence', 'Diesel', 'Hybrid', 'Electric', 'PHEV')),
  transmission TEXT CHECK (transmission IN ('Manual', 'Automatic', 'CVT', 'DCT')),
  color TEXT,
  condition TEXT CHECK (condition IN ('Excellent', 'Très Bon', 'Bon', 'Acceptable')),
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  seller_type TEXT CHECK (seller_type IN ('individual', 'professional')),
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  images JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_sold BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dealerships Table
CREATE TABLE dealerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Promotions Table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles_new(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_amount DECIMAL(12,2),
  discount_percentage DECIMAL(5,2),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  terms TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comparisons Table
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  vehicle_ids JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum Categories Table
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum Topics Table
CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum Posts Table
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Articles Table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT CHECK (category IN ('Morocco', 'International', 'Market', 'Review', 'News')),
  tags JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Videos Table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT CHECK (category IN ('Review', 'Launch', 'Comparison', 'Tutorial', 'News')),
  vehicle_id UUID REFERENCES vehicles_new(id) ON DELETE SET NULL,
  duration TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('new', 'used')) NOT NULL,
  vehicle_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vehicle_type, vehicle_id)
);

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  bio TEXT,
  is_dealer BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_vehicles_new_brand ON vehicles_new(brand_id);
CREATE INDEX idx_vehicles_new_model ON vehicles_new(model_id);
CREATE INDEX idx_vehicles_new_available ON vehicles_new(is_available);
CREATE INDEX idx_vehicles_new_popular ON vehicles_new(is_popular);
CREATE INDEX idx_vehicles_new_new_release ON vehicles_new(is_new_release);
CREATE INDEX idx_vehicles_new_created ON vehicles_new(created_at DESC);

CREATE INDEX idx_vehicles_used_brand ON vehicles_used(brand_id);
CREATE INDEX idx_vehicles_used_model ON vehicles_used(model_id);
CREATE INDEX idx_vehicles_used_user ON vehicles_used(user_id);
CREATE INDEX idx_vehicles_used_active ON vehicles_used(is_active);
CREATE INDEX idx_vehicles_used_city ON vehicles_used(city);
CREATE INDEX idx_vehicles_used_created ON vehicles_used(created_at DESC);

CREATE INDEX idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX idx_promotions_active ON promotions(is_active, valid_until);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_vehicles_new_updated_at BEFORE UPDATE ON vehicles_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_used_updated_at BEFORE UPDATE ON vehicles_used FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON forum_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View counter functions
CREATE OR REPLACE FUNCTION increment_vehicle_views(vehicle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vehicles_new
  SET views = views + 1
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_used_vehicle_views(vehicle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE vehicles_used
  SET views = views + 1
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public can view models" ON models FOR SELECT USING (true);
CREATE POLICY "Public can view available new vehicles" ON vehicles_new FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view active used vehicles" ON vehicles_used FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view dealerships" ON dealerships FOR SELECT USING (true);
CREATE POLICY "Public can view active promotions" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view public comparisons" ON comparisons FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view forum categories" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Public can view forum topics" ON forum_topics FOR SELECT USING (true);
CREATE POLICY "Public can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Public can view published articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);

-- User policies for vehicles_used
CREATE POLICY "Users can create their own listings" ON vehicles_used FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON vehicles_used FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON vehicles_used FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own inactive listings" ON vehicles_used FOR SELECT USING (auth.uid() = user_id);

-- User policies for comparisons
CREATE POLICY "Users can create comparisons" ON comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own comparisons" ON comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own comparisons" ON comparisons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comparisons" ON comparisons FOR DELETE USING (auth.uid() = user_id);

-- User policies for favorites
CREATE POLICY "Users can create favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- User policies for forum
CREATE POLICY "Users can create topics" ON forum_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON forum_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON forum_topics FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON forum_posts FOR DELETE USING (auth.uid() = user_id);

-- User policies for profiles
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies (full access to everything)
CREATE POLICY "Admins have full access to brands" ON brands FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to models" ON models FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to vehicles_new" ON vehicles_new FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to articles" ON articles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to promotions" ON promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins have full access to dealerships" ON dealerships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert brands
INSERT INTO brands (name, logo_url) VALUES
('Dacia', '/brands/dacia.png'),
('Renault', '/brands/renault.png'),
('Peugeot', '/brands/peugeot.png'),
('Citroën', '/brands/citroen.png'),
('Volkswagen', '/brands/volkswagen.png'),
('BMW', '/brands/bmw.png'),
('Mercedes', '/brands/mercedes.png'),
('Audi', '/brands/audi.png'),
('Toyota', '/brands/toyota.png'),
('Hyundai', '/brands/hyundai.png'),
('Kia', '/brands/kia.png'),
('Ford', '/brands/ford.png'),
('Nissan', '/brands/nissan.png'),
('Mazda', '/brands/mazda.png'),
('Honda', '/brands/honda.png'),
('Seat', '/brands/seat.png'),
('Skoda', '/brands/skoda.png'),
('Fiat', '/brands/fiat.png'),
('Opel', '/brands/opel.png'),
('MG', '/brands/mg.png');

-- Insert forum categories
INSERT INTO forum_categories (name, description, icon, order_position) VALUES
('Général', 'Discussions générales sur l''automobile', 'MessageSquare', 1),
('Conseils d''Achat', 'Demandez des conseils pour votre prochain achat', 'ShoppingCart', 2),
('Mécanique & Entretien', 'Questions techniques et conseils d''entretien', 'Wrench', 3),
('Expériences Propriétaires', 'Partagez votre expérience avec votre véhicule', 'Users', 4),
('Actualités', 'Discutez des dernières nouvelles automobiles', 'Newspaper', 5);

-- ============================================
-- STORAGE SETUP INSTRUCTIONS
-- ============================================

-- NOTE: Storage buckets must be created via the Supabase Dashboard
-- Go to Storage > Create Bucket and create these buckets with "Public" access:
-- 1. vehicle-images
-- 2. listings-images
-- 3. user-avatars
-- 4. article-images
-- 5. brand-logos

-- After creating the buckets, apply these storage policies via the Dashboard or API

-- Database schema setup complete!
-- Next steps:
-- 1. Create the storage buckets mentioned above
-- 2. Add your Supabase URL and keys to .env.local
-- 3. Start building the application!
