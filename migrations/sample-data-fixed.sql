-- Sample Data for Tomobile 360 (Fixed to match actual schema)
-- Run this script in your Supabase SQL Editor after the main schema is set up

-- ============================================
-- 1. MODELS (for existing brands with categories)
-- ============================================

-- Toyota Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla', 'Berline'),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Yaris', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Toyota'), 'RAV4', 'SUV'),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser', 'SUV'),
((SELECT id FROM brands WHERE name = 'Toyota'), 'Hilux', 'Pick-up');

-- Renault Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Renault'), 'Clio', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Renault'), 'Duster', 'SUV'),
((SELECT id FROM brands WHERE name = 'Renault'), 'Megane', 'Berline'),
((SELECT id FROM brands WHERE name = 'Renault'), 'Captur', 'SUV');

-- Dacia Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Dacia'), 'Logan', 'Berline'),
((SELECT id FROM brands WHERE name = 'Dacia'), 'Sandero', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Dacia'), 'Duster', 'SUV'),
((SELECT id FROM brands WHERE name = 'Dacia'), 'Jogger', 'Monospace');

-- Peugeot Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Peugeot'), '208', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Peugeot'), '308', 'Berline'),
((SELECT id FROM brands WHERE name = 'Peugeot'), '2008', 'SUV'),
((SELECT id FROM brands WHERE name = 'Peugeot'), '3008', 'SUV');

-- Volkswagen Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Golf', 'Compacte'),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Polo', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Tiguan', 'SUV'),
((SELECT id FROM brands WHERE name = 'Volkswagen'), 'T-Roc', 'SUV');

-- Hyundai Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Hyundai'), 'i20', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Tucson', 'SUV'),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Elantra', 'Berline'),
((SELECT id FROM brands WHERE name = 'Hyundai'), 'Santa Fe', 'SUV');

-- Kia Models
INSERT INTO models (brand_id, name, category) VALUES
((SELECT id FROM brands WHERE name = 'Kia'), 'Picanto', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Kia'), 'Rio', 'Citadine'),
((SELECT id FROM brands WHERE name = 'Kia'), 'Sportage', 'SUV'),
((SELECT id FROM brands WHERE name = 'Kia'), 'Sorento', 'SUV');

-- ============================================
-- 2. NEW VEHICLES (with correct schema)
-- ============================================

-- Toyota Corolla 2025 (New Release & Popular)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Toyota'),
  (SELECT id FROM models WHERE name = 'Corolla'),
  2025, 'Essence', 'Automatic',
  140, 280000, 320000,
  '["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"]'::jsonb,
  true, true, 1250
);

-- Toyota RAV4 2024 (Popular)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Toyota'),
  (SELECT id FROM models WHERE name = 'RAV4'),
  2024, 'Hybrid', 'Automatic',
  220, 420000, 480000,
  '["https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"]'::jsonb,
  false, true, 2100
);

-- Dacia Sandero 2024 (New Release)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Dacia'),
  (SELECT id FROM models WHERE name = 'Sandero'),
  2024, 'Essence', 'Manual',
  90, 145000, 165000,
  '["https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800"]'::jsonb,
  true, false, 850
);

-- Renault Clio 2024 (New Release & Popular)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Renault'),
  (SELECT id FROM models WHERE name = 'Clio'),
  2024, 'Essence', 'Automatic',
  100, 195000, 225000,
  '["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"]'::jsonb,
  true, true, 1680
);

-- Peugeot 2008 2024 (Popular)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Peugeot'),
  (SELECT id FROM models WHERE name = '2008'),
  2024, 'Diesel', 'Automatic',
  130, 295000, 335000,
  '["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"]'::jsonb,
  false, true, 1450
);

-- Volkswagen T-Roc 2024 (New Release)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Volkswagen'),
  (SELECT id FROM models WHERE name = 'T-Roc'),
  2024, 'Essence', 'Automatic',
  150, 380000, 420000,
  '["https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800"]'::jsonb,
  true, false, 720
);

-- Hyundai Tucson 2024 (Popular)
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Hyundai'),
  (SELECT id FROM models WHERE name = 'Tucson'),
  2024, 'Hybrid', 'Automatic',
  230, 425000, 475000,
  '["https://images.unsplash.com/photo-1617654112368-307921291f42?w=800"]'::jsonb,
  false, true, 1890
);

-- Kia Sportage 2024
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Kia'),
  (SELECT id FROM models WHERE name = 'Sportage'),
  2024, 'Diesel', 'Automatic',
  185, 395000, 445000,
  '["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"]'::jsonb,
  false, false, 980
);

-- Dacia Duster 2024
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Dacia'),
  (SELECT id FROM models WHERE name = 'Duster'),
  2024, 'Essence', 'Manual',
  115, 195000, 235000,
  '["https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800"]'::jsonb,
  false, true, 1560
);

-- Peugeot 308 2024
INSERT INTO vehicles_new (
  brand_id, model_id, year, fuel_type, transmission,
  horsepower, price_min, price_max, images,
  is_new_release, is_popular, views
) VALUES (
  (SELECT id FROM brands WHERE name = 'Peugeot'),
  (SELECT id FROM models WHERE name = '308'),
  2024, 'Diesel', 'Automatic',
  130, 285000, 325000,
  '["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"]'::jsonb,
  false, false, 640
);

-- ============================================
-- 3. PROMOTIONS (for some vehicles)
-- ============================================

-- Promotion Toyota Corolla
INSERT INTO promotions (
  vehicle_id, title, description, discount_percentage,
  valid_until, is_active
) VALUES (
  (SELECT id FROM vehicles_new WHERE model_id = (SELECT id FROM models WHERE name = 'Corolla') LIMIT 1),
  'Offre de Lancement Corolla 2025',
  'Profitez de -8% sur la nouvelle Toyota Corolla 2025. Offre valable jusqu''à fin février.',
  8,
  '2025-02-28',
  true
);

-- Promotion Renault Clio
INSERT INTO promotions (
  vehicle_id, title, description, discount_percentage,
  valid_until, is_active
) VALUES (
  (SELECT id FROM vehicles_new WHERE model_id = (SELECT id FROM models WHERE name = 'Clio') LIMIT 1),
  'Remise Exceptionnelle Clio',
  'Jusqu''à 12% de remise sur la Renault Clio 2024 + accessoires offerts.',
  12,
  '2025-03-15',
  true
);

-- Promotion Dacia Sandero
INSERT INTO promotions (
  vehicle_id, title, description, discount_percentage,
  valid_until, is_active
) VALUES (
  (SELECT id FROM vehicles_new WHERE model_id = (SELECT id FROM models WHERE name = 'Sandero') LIMIT 1),
  'Prix Imbattable Sandero',
  'Profitez de -6% sur la Dacia Sandero 2024. Le meilleur prix du marché!',
  6,
  '2025-02-20',
  true
);

-- Promotion Hyundai Tucson
INSERT INTO promotions (
  vehicle_id, title, description, discount_percentage,
  valid_until, is_active
) VALUES (
  (SELECT id FROM vehicles_new WHERE model_id = (SELECT id FROM models WHERE name = 'Tucson') LIMIT 1),
  'Offre Hybride Tucson',
  'Économisez 10% sur le Hyundai Tucson Hybride + garantie étendue offerte.',
  10,
  '2025-03-31',
  true
);

-- Promotion Peugeot 2008
INSERT INTO promotions (
  vehicle_id, title, description, discount_percentage,
  valid_until, is_active
) VALUES (
  (SELECT id FROM vehicles_new WHERE model_id = (SELECT id FROM models WHERE name = '2008') LIMIT 1),
  'Offre Spéciale 2008',
  'Remise de 7% sur le Peugeot 2008 + pack technologie offert.',
  7,
  '2025-02-25',
  true
);

-- ============================================
-- 4. ARTICLES (Blog Posts)
-- ============================================

INSERT INTO articles (
  title, slug, excerpt, content, category, featured_image_url,
  author_name, is_published, published_at, views
) VALUES
(
  'Top 5 des SUV les Plus Vendus au Maroc en 2024',
  'top-5-suv-maroc-2024',
  'Découvrez le classement des SUV qui ont conquis le cœur des Marocains cette année.',
  'Le marché automobile marocain a connu une croissance impressionnante des SUV en 2024. Voici notre analyse détaillée des 5 modèles les plus populaires...',
  'Guide d''achat',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
  'Karim Alami',
  true,
  NOW() - INTERVAL '2 days',
  450
),
(
  'Nouvelle Fiscalité Auto 2025 : Ce Qui Change',
  'fiscalite-auto-2025-maroc',
  'Tout ce que vous devez savoir sur les nouvelles taxes automobiles au Maroc.',
  'Le gouvernement marocain a annoncé des changements importants dans la fiscalité automobile pour 2025. Voici un décryptage complet...',
  'Actualités',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  'Fatima Zahra',
  true,
  NOW() - INTERVAL '5 days',
  780
),
(
  'Guide Complet : Acheter sa Première Voiture au Maroc',
  'guide-achat-premiere-voiture',
  'Tous nos conseils pour bien choisir et financer votre première voiture.',
  'Acheter sa première voiture est une étape importante. Ce guide vous accompagne dans toutes les démarches...',
  'Guide d''achat',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
  'Hassan Bennani',
  true,
  NOW() - INTERVAL '7 days',
  920
),
(
  'Électrique vs Hybride : Quel Choix Pour le Maroc ?',
  'electrique-vs-hybride-maroc',
  'Comparaison approfondie entre véhicules électriques et hybrides dans le contexte marocain.',
  'Avec l''arrivée des véhicules électriques et hybrides au Maroc, beaucoup se demandent quelle technologie choisir...',
  'Comparatif',
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
  'Karim Alami',
  true,
  NOW() - INTERVAL '10 days',
  650
);

-- ============================================
-- 5. VIDEOS
-- ============================================

INSERT INTO videos (
  title, slug, description, video_url, thumbnail_url,
  duration, category, views
) VALUES
(
  'Essai Complet Toyota Corolla 2025',
  'essai-toyota-corolla-2025',
  'Nous avons testé la nouvelle Toyota Corolla 2025 sur les routes marocaines. Design, performances, confort : notre verdict complet.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
  '12:35',
  'Essais',
  1250
),
(
  'Top 3 des Citadines Pour la Ville',
  'top-3-citadines-ville',
  'Quelle citadine choisir pour rouler en ville ? Notre comparatif des 3 meilleures options du marché marocain.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800',
  '08:42',
  'Comparatifs',
  890
),
(
  'Hyundai Tucson Hybride : Notre Avis',
  'hyundai-tucson-hybride-avis',
  'Le Hyundai Tucson hybride vaut-il son prix ? Découvrez notre essai détaillé et nos impressions.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1617654112368-307921291f42?w=800',
  '15:20',
  'Essais',
  1420
),
(
  'Comment Négocier le Prix de sa Voiture',
  'comment-negocier-prix-voiture',
  'Tous nos conseils et astuces pour obtenir le meilleur prix lors de l''achat de votre véhicule neuf ou d''occasion.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800',
  '06:15',
  'Conseils',
  560
);

-- ============================================
-- 6. USED VEHICLES (Occasion)
-- Note: Requires a user profile to exist first
-- ============================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_phone TEXT := '+212600000000';
  demo_email TEXT;
BEGIN
  -- Get the first user from profiles
  SELECT id, email INTO demo_user_id, demo_email FROM profiles LIMIT 1;

  IF demo_user_id IS NOT NULL THEN
    -- Used Toyota Yaris
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Toyota'),
      (SELECT id FROM models WHERE name = 'Yaris'),
      2020, 45000, 135000,
      'Essence', 'Manual', 'Casablanca',
      'Toyota Yaris 2020 en excellent état, entretien régulier, première main.',
      '["https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"]'::jsonb,
      'individual', true, true, 320,
      demo_phone, demo_email
    );

    -- Used Dacia Logan
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Dacia'),
      (SELECT id FROM models WHERE name = 'Logan'),
      2019, 68000, 95000,
      'Diesel', 'Manual', 'Rabat',
      'Dacia Logan Diesel 2019, économique et fiable. Parfaite pour la ville.',
      '["https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800"]'::jsonb,
      'individual', false, true, 180,
      demo_phone, demo_email
    );

    -- Used Renault Megane
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Renault'),
      (SELECT id FROM models WHERE name = 'Megane'),
      2021, 32000, 185000,
      'Diesel', 'Automatic', 'Marrakech',
      'Renault Megane 2021, boîte automatique, GPS, caméra de recul. Très bon état.',
      '["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800"]'::jsonb,
      'professional', true, true, 450,
      demo_phone, demo_email
    );

    -- Used Peugeot 208
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Peugeot'),
      (SELECT id FROM models WHERE name = '208'),
      2021, 28000, 165000,
      'Essence', 'Manual', 'Casablanca',
      'Peugeot 208 2021, faible kilométrage, toutes options. Impeccable.',
      '["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"]'::jsonb,
      'individual', false, true, 210,
      demo_phone, demo_email
    );

    -- Used Volkswagen Golf
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Volkswagen'),
      (SELECT id FROM models WHERE name = 'Golf'),
      2020, 55000, 195000,
      'Diesel', 'Automatic', 'Tanger',
      'VW Golf 7 Diesel automatique, entretien complet, carnet à jour.',
      '["https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800"]'::jsonb,
      'professional', true, true, 380,
      demo_phone, demo_email
    );

    -- Used Hyundai i20
    INSERT INTO vehicles_used (
      user_id, brand_id, model_id, year, mileage, price,
      fuel_type, transmission, city, description,
      images, seller_type, is_featured, is_active, views,
      contact_phone, contact_email
    ) VALUES (
      demo_user_id,
      (SELECT id FROM brands WHERE name = 'Hyundai'),
      (SELECT id FROM models WHERE name = 'i20'),
      2022, 18000, 145000,
      'Essence', 'Automatic', 'Agadir',
      'Hyundai i20 2022, comme neuve, garantie constructeur restante.',
      '["https://images.unsplash.com/photo-1617654112368-307921291f42?w=800"]'::jsonb,
      'professional', false, true, 290,
      demo_phone, demo_email
    );
  END IF;
END $$;

-- ============================================
-- COMPLETED!
-- ============================================

-- Display summary
SELECT
  'Sample data inserted successfully!' as message,
  (SELECT COUNT(*) FROM models) as total_models,
  (SELECT COUNT(*) FROM vehicles_new) as total_new_vehicles,
  (SELECT COUNT(*) FROM promotions) as total_promotions,
  (SELECT COUNT(*) FROM vehicles_used) as total_used_vehicles,
  (SELECT COUNT(*) FROM articles) as total_articles,
  (SELECT COUNT(*) FROM videos) as total_videos;
