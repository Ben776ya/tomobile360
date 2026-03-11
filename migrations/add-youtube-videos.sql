-- Add YouTube Videos for Testing
-- Run this in your Supabase SQL Editor

-- Insert 5 YouTube videos
INSERT INTO videos (
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  category,
  is_published,
  views
) VALUES
(
  'Essai Mercedes-Benz EQE SUV - Luxe Électrique',
  'Découvrez notre essai complet du Mercedes-Benz EQE SUV, le SUV électrique de luxe qui combine performance, confort et technologie de pointe. Nous testons ce véhicule premium sur les routes marocaines.',
  'https://www.youtube.com/watch?v=X75EEBBNqh4',
  'https://i.ytimg.com/vi/X75EEBBNqh4/maxresdefault.jpg',
  '15:24',
  'review',
  true,
  0
),
(
  'Nouveau Peugeot 3008 2024 - Présentation Complète',
  'Le nouveau Peugeot 3008 arrive au Maroc ! Découvrez toutes les nouveautés de cette nouvelle génération : design, motorisations, équipements et prix. Notre avis détaillé sur ce SUV familial.',
  'https://www.youtube.com/watch?v=RV7r7ch2dls',
  'https://i.ytimg.com/vi/RV7r7ch2dls/maxresdefault.jpg',
  '18:32',
  'news',
  true,
  0
),
(
  'Comparatif SUV Hybrides - Quel Modèle Choisir ?',
  'Comparatif complet des meilleurs SUV hybrides disponibles au Maroc. Nous comparons les performances, la consommation, le confort et le rapport qualité-prix pour vous aider à faire le bon choix.',
  'https://www.youtube.com/watch?v=yGPe1WGgCUk',
  'https://i.ytimg.com/vi/yGPe1WGgCUk/maxresdefault.jpg',
  '22:15',
  'comparison',
  true,
  0
),
(
  'Guide d''Achat - Comment Choisir sa Première Voiture',
  'Tous nos conseils pour bien choisir votre première voiture : budget, type de véhicule, critères essentiels, financement et erreurs à éviter. Un guide complet pour les primo-accédants.',
  'https://www.youtube.com/watch?v=HJG5aXwWugc',
  'https://i.ytimg.com/vi/HJG5aXwWugc/maxresdefault.jpg',
  '12:48',
  'guide',
  true,
  0
),
(
  'Salon de l''Auto 2024 - Les Nouveautés à Découvrir',
  'Visite complète du Salon de l''Automobile 2024. Découvrez toutes les nouveautés, les concepts cars et les modèles qui arrivent prochainement sur le marché marocain. Reportage exclusif.',
  'https://www.youtube.com/watch?v=mmtTQIJ2XLg',
  'https://i.ytimg.com/vi/mmtTQIJ2XLg/maxresdefault.jpg',
  '25:10',
  'event',
  true,
  0
);

-- Verify the inserts
SELECT
  id,
  title,
  category,
  video_url,
  is_published,
  created_at
FROM videos
ORDER BY created_at DESC
LIMIT 5;
