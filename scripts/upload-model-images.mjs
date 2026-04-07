/**
 * upload-model-images.mjs
 *
 * Uploads vehicle images from wandaloo_images/ to Supabase Storage
 * and updates the vehicles_new.images JSONB column.
 *
 * Folder structure expected:
 *   wandaloo_images/{brand-slug}/{model-slug}/*.jpg
 *
 * Mapping:
 *   1. brands_models_versions.json provides slug → name for brands & models
 *   2. DB models table (joined with brands) provides brandName::modelName → model_id
 *   3. Combined: brandSlug::modelSlug → model_id
 *
 * Usage:
 *   node scripts/upload-model-images.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// .env.local loader
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

function loadEnvLocal() {
  const envPath = path.join(projectRoot, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local not found at', envPath)
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eqIdx = line.indexOf('=')
    if (eqIdx === -1) continue
    const key = line.slice(0, eqIdx).trim()
    let value = line.slice(eqIdx + 1).trim()
    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnvLocal()

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const IMAGES_DIR = path.join(projectRoot, 'wandaloo_images')
const JSON_PATH = path.join(projectRoot, 'brands_models_versions.json')
const BUCKET = 'images'
const STORAGE_PREFIX = 'vehicles' // files go to vehicles/{brand}/{model}/...

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

// ---------------------------------------------------------------------------
// Step 1 — Build slug mappings from JSON
// ---------------------------------------------------------------------------
function buildSlugMappings() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('ERROR: brands_models_versions.json not found at', JSON_PATH)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
  // Map: "brandSlug::modelSlug" → { brandName, modelName }
  const slugToNames = new Map()

  for (const brand of data.brands) {
    for (const model of brand.models) {
      const key = `${brand.slug}::${model.slug}`
      slugToNames.set(key, {
        brandName: brand.name,
        modelName: model.name,
      })
    }
  }

  console.log(`[JSON] Loaded ${slugToNames.size} brand::model slug mappings`)
  return slugToNames
}

// ---------------------------------------------------------------------------
// Step 2 — Fetch all models from DB and build name → id map
// ---------------------------------------------------------------------------
async function buildModelIdMap() {
  // Fetch models with their brand name via join
  const { data: models, error } = await supabase
    .from('models')
    .select('id, name, brands(name)')

  if (error) {
    console.error('ERROR fetching models from DB:', error.message)
    process.exit(1)
  }

  // Map: "brandName::modelName" → model_id
  const nameToId = new Map()

  for (const m of models) {
    // brands can be an object or array depending on Supabase response shape
    const brandName = Array.isArray(m.brands)
      ? m.brands[0]?.name
      : m.brands?.name
    if (!brandName) continue
    const key = `${brandName}::${m.name}`
    nameToId.set(key, m.id)
  }

  console.log(`[DB] Loaded ${nameToId.size} brand::model name → id mappings`)
  return nameToId
}

// ---------------------------------------------------------------------------
// Step 3 — Scan folders, upload images, update DB
// ---------------------------------------------------------------------------
async function processImages(slugToNames, nameToId) {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('ERROR: wandaloo_images/ folder not found at', IMAGES_DIR)
    process.exit(1)
  }

  const brandFolders = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  let totalImagesUploaded = 0
  let totalModelsMatched = 0
  let totalModelsSkipped = 0
  let totalVehiclesUpdated = 0
  const skippedModels = []

  for (const brandSlug of brandFolders) {
    const brandDir = path.join(IMAGES_DIR, brandSlug)
    const modelFolders = fs
      .readdirSync(brandDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()

    if (modelFolders.length === 0) {
      console.log(`[${brandSlug}] No model folders — skipping`)
      continue
    }

    console.log(
      `\n========== ${brandSlug} (${modelFolders.length} models) ==========`
    )

    for (const modelSlug of modelFolders) {
      const slugKey = `${brandSlug}::${modelSlug}`

      // --- Resolve model_id ---
      const names = slugToNames.get(slugKey)
      if (!names) {
        console.log(`  [${modelSlug}] SKIP — no JSON mapping for slug`)
        totalModelsSkipped++
        skippedModels.push(slugKey)
        continue
      }

      const nameKey = `${names.brandName}::${names.modelName}`
      const modelId = nameToId.get(nameKey)
      if (!modelId) {
        console.log(
          `  [${modelSlug}] SKIP — no DB model for "${names.brandName} ${names.modelName}"`
        )
        totalModelsSkipped++
        skippedModels.push(slugKey)
        continue
      }

      // --- Collect image files ---
      const modelDir = path.join(brandDir, modelSlug)
      const imageFiles = fs
        .readdirSync(modelDir)
        .filter((f) => {
          // Skip logo.png
          if (f.toLowerCase() === 'logo.png') return false
          const ext = path.extname(f).toLowerCase()
          return IMAGE_EXTENSIONS.has(ext)
        })
        .sort()

      if (imageFiles.length === 0) {
        console.log(`  [${modelSlug}] SKIP — no image files`)
        totalModelsSkipped++
        skippedModels.push(slugKey)
        continue
      }

      // --- Upload each image ---
      const publicUrls = []

      for (const filename of imageFiles) {
        const localPath = path.join(modelDir, filename)
        const storagePath = `${STORAGE_PREFIX}/${brandSlug}/${modelSlug}/${filename}`
        const ext = path.extname(filename).toLowerCase()
        const contentType = getContentType(ext)

        const fileBuffer = fs.readFileSync(localPath)

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true,
          })

        if (uploadError) {
          console.error(
            `    ERROR uploading ${filename}: ${uploadError.message}`
          )
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

        publicUrls.push(publicUrl)
        totalImagesUploaded++
      }

      if (publicUrls.length === 0) {
        console.log(`  [${modelSlug}] SKIP — all uploads failed`)
        totalModelsSkipped++
        skippedModels.push(slugKey)
        continue
      }

      // --- Update vehicles_new rows ---
      const { data: updated, error: updateError } = await supabase
        .from('vehicles_new')
        .update({ images: publicUrls })
        .eq('model_id', modelId)
        .select('id')

      if (updateError) {
        console.error(
          `  [${modelSlug}] ERROR updating vehicles_new: ${updateError.message}`
        )
        continue
      }

      const rowCount = updated ? updated.length : 0
      totalVehiclesUpdated += rowCount
      totalModelsMatched++

      console.log(
        `  [${modelSlug}] ${publicUrls.length} images uploaded, ${rowCount} vehicles_new rows updated`
      )
    }
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total images uploaded:       ${totalImagesUploaded}`)
  console.log(`Total models matched:        ${totalModelsMatched}`)
  console.log(`Total models skipped:        ${totalModelsSkipped}`)
  console.log(`Total vehicles_new updated:  ${totalVehiclesUpdated}`)

  if (skippedModels.length > 0) {
    console.log(`\nSkipped models (${skippedModels.length}):`)
    for (const s of skippedModels) {
      console.log(`  - ${s}`)
    }
  }

  console.log('\nDone.')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Upload Model Images to Supabase Storage ===\n')

  const slugToNames = buildSlugMappings()
  const nameToId = await buildModelIdMap()

  await processImages(slugToNames, nameToId)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
