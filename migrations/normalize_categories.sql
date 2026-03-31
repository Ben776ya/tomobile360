-- Normalize category values to lowercase in articles and videos tables
-- Run this once via the Supabase SQL editor to align existing rows
-- with the app-layer normalization added in admin.ts (createArticle, updateArticle, createVideo)

-- Normalize existing article categories to lowercase
UPDATE articles
SET category = LOWER(category)
WHERE category IS NOT NULL
  AND category != LOWER(category);

-- Normalize existing video categories to lowercase
UPDATE videos
SET category = LOWER(category)
WHERE category IS NOT NULL
  AND category != LOWER(category);
