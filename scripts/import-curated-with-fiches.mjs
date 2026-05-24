/**
 * import-curated-with-fiches.mjs
 *
 * Bulk-imports 120 brand/model entries from ../curated-images/ + matching
 * specs from ../fiches_tomobile_format/ into the Tomobile 360 DB.
 *
 * Decision rule (per source folder):
 *   - vehicles_new.images count >= 6  → SKIP entirely
 *   - vehicles_new.images count <= 5  → REPLACE images + refresh fiche
 *   - model does not exist in DB      → CREATE brand (if needed) + model
 *                                       + vehicles_new row + images + fiche
 *
 * Images per model: up to 8 from curated/ + up to 5 from detail-shots/ = 13.
 *
 * Modes:
 *   (default)  dry-run — classify only, write report, no writes
 *   --apply    perform brand/model creates, uploads, DB writes
 *
 * Usage:
 *   node scripts/import-curated-with-fiches.mjs           # dry-run
 *   node scripts/import-curated-with-fiches.mjs --apply   # mutate
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')    // tomobile360/
const repoRoot = path.resolve(projectRoot, '..')     // tomobil-test/

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
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}
loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

const APPLY = process.argv.includes('--apply')
const MODE_BANNER = APPLY
  ? 'APPLY (will create brands/models, upload images, update DB)'
  : 'DRY-RUN (no writes)'

const CURATED_DIR = path.join(repoRoot, 'curated-images')
const FICHES_DIR = path.join(repoRoot, 'fiches_tomobile_format')
const REPORT_PATH = path.join(projectRoot, 'curated-import-report.json')
const PUBLIC_BRANDS_DIR = path.join(projectRoot, 'public', 'brands')
const BUCKET = 'images'
const STORAGE_PREFIX = 'vehicles'

const CURATED_TAKE = 8     // max images from curated/
const DETAIL_TAKE = 5      // max images from detail-shots/
const IMAGE_KEEP_THRESHOLD = 6  // existing image count at/above this → SKIP

console.log(`\n=== import-curated-with-fiches — Mode: ${MODE_BANNER} ===\n`)
console.log(`Curated images: ${CURATED_DIR}`)
console.log(`Fiches:         ${FICHES_DIR}`)
console.log(`Report:         ${REPORT_PATH}\n`)

// ---------------------------------------------------------------------------
// Canonical slug — MUST match src/lib/slug.ts and scripts/curated-images/audit-mapping.mjs
// ---------------------------------------------------------------------------
function slug(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Brand-slug aliases: source folder name → DB brand canonical name
// ---------------------------------------------------------------------------
const BRAND_ALIAS = {
  'mercedes-benz': 'Mercedes',  // source folder uses hyphenated form, DB row is "Mercedes"
}

// Display names for brands we expect to create (must be slug-stable).
const NEW_BRAND_DISPLAY_NAMES = {
  'alpine': 'Alpine',
  'aston-martin': 'Aston Martin',
  'bentley': 'Bentley',
  'chevrolet': 'Chevrolet',
  'ferrari': 'Ferrari',
  'foton': 'Foton',
  'isuzu': 'Isuzu',
}

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const CONTENT_TYPE = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png',  '.webp': 'image/webp',
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => IMG_EXT.has(path.extname(f).toLowerCase()))
    .sort()
}

// Convert a hyphenated model folder slug ("rs-q8", "range-rover-vogue") to a
// display name ("RS-Q8", "Range Rover Vogue"). Same convention as
// scripts/import-cars.mjs modelSlugToName().
// NOTE: For trailing-dash slugs ("gtc4lusso-", "poer-", "levante-"), the caller
// is expected to strip the trailing dash BEFORE passing the slug in.
function modelSlugToName(s) {
  return s.split('-').map(word => {
    if (['phev','hev','ev','gt','rs','amg','gtx','gti','gte','tdi','tfsi','tsi','bvm']
        .includes(word.toLowerCase())) return word.toUpperCase()
    if (/^\d+$/.test(word)) return word
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join(' ')
}

// ---------------------------------------------------------------------------
// Fiche field mappers — match scripts/import-cars.mjs conventions
// ---------------------------------------------------------------------------
function mapFuelType(carburant) {
  if (!carburant) return null
  const e = String(carburant).toLowerCase()
  if (e.includes('electrique') || e === 'électrique' || e === 'electric') return 'Electric'
  if (e.includes('hybride rechargeable') || e.includes('phev')) return 'PHEV'
  if (e.includes('hybride') || e.includes('hybrid')) return 'Hybrid'
  if (e.includes('diesel')) return 'Diesel'
  if (e.includes('essence')) return 'Essence'
  return null
}

function mapTransmission(boite) {
  if (!boite) return null
  const b = String(boite).toLowerCase()
  if (b.includes('cvt')) return 'CVT'
  if (b.includes('double embrayage') || b.includes('dct') || b.includes('dsg')) return 'DCT'
  if (b.includes('automatique') || b.includes('auto')) return 'Automatic'
  if (b.includes('manuelle') || b.includes('manuel')) return 'Manual'
  return null
}

function mapVariantFuel(fuel) { return mapFuelType(fuel) }
function mapVariantTransmission(t) { return mapTransmission(t) }

// Default category for new models. The fiche files don't carry a clean category
// signal; use 'SUV' as the existing import-cars.mjs fallback. Operators can
// edit per-model in /admin/vehicles after the import.
const DEFAULT_CATEGORY = 'SUV'

// Parse "116 ch" → 116
function parseChNumber(val) {
  if (val == null) return null
  const m = String(val).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}
// Parse "200 nm" / "200 Nm" → 200
function parseNm(val) {
  if (val == null) return null
  const m = String(val).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}
// Parse "335 L", "335 litre" → 335
function parseLitres(val) {
  if (val == null) return null
  const m = String(val).match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}
// Parse "1210 kg" → 1210; "200.0 km/h" → 200; "5.5 L/100km" → 5.5
function parseFirstFloat(val) {
  if (val == null) return null
  const m = String(val).replace(/\./g, '').replace(/,/g, '.').match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

// ---------------------------------------------------------------------------
// DB loader — returns
//   brandBySlug:    Map<brandSlug, { id, name }>
//   modelByKey:     Map<`${brandSlug}::${modelSlug}`, { modelId, modelName, brandId,
//                       vehicleId, imageCount, hasFiche }>
// ---------------------------------------------------------------------------
async function loadDbIndex() {
  const { data: brands, error: brandsErr } = await supabase
    .from('brands')
    .select('id, name')
  if (brandsErr) { console.error('ERROR fetching brands:', brandsErr.message); process.exit(1) }

  const { data: models, error: modelsErr } = await supabase
    .from('models')
    .select('id, name, brand_id, brands(name)')
  if (modelsErr) { console.error('ERROR fetching models:', modelsErr.message); process.exit(1) }

  const { data: vehicles, error: vehErr } = await supabase
    .from('vehicles_new')
    .select('id, model_id, images')
  if (vehErr) { console.error('ERROR fetching vehicles_new:', vehErr.message); process.exit(1) }

  const { data: fiches, error: fichErr } = await supabase
    .from('fiches_techniques')
    .select('model_id')
  if (fichErr) { console.error('ERROR fetching fiches_techniques:', fichErr.message); process.exit(1) }

  const brandBySlug = new Map()
  for (const b of brands) {
    brandBySlug.set(slug(b.name), { id: b.id, name: b.name })
  }

  const vehByModel = new Map()
  for (const v of vehicles) {
    const count = Array.isArray(v.images) ? v.images.length : 0
    // If multiple legacy rows still exist for one model, keep the row with the
    // most images (defensive — the 2026-05-18 collapse should leave 1:1).
    const cur = vehByModel.get(v.model_id)
    if (!cur || count > cur.imageCount) {
      vehByModel.set(v.model_id, { vehicleId: v.id, imageCount: count })
    }
  }

  const ficheModelIds = new Set(fiches.map(f => f.model_id))

  const modelByKey = new Map()
  for (const m of models) {
    const brandName = Array.isArray(m.brands) ? m.brands[0]?.name : m.brands?.name
    if (!brandName) continue
    const bSlug = slug(brandName)
    const mSlug = slug(m.name)
    const v = vehByModel.get(m.id) || { vehicleId: null, imageCount: 0 }
    modelByKey.set(`${bSlug}::${mSlug}`, {
      modelId: m.id,
      modelName: m.name,
      brandId: m.brand_id,
      brandSlug: bSlug,
      brandName,
      vehicleId: v.vehicleId,
      imageCount: v.imageCount,
      hasFiche: ficheModelIds.has(m.id),
    })
  }

  console.log(`[DB] Loaded ${brands.length} brands, ${models.length} models, ` +
              `${vehicles.length} vehicles, ${fiches.length} fiches\n`)
  return { brandBySlug, modelByKey }
}

async function main() {
  const idx = await loadDbIndex()
  console.log(`Sample brand slugs: ${Array.from(idx.brandBySlug.keys()).slice(0, 5).join(', ')}`)
  console.log(`Sample model keys: ${Array.from(idx.modelByKey.keys()).slice(0, 5).join(', ')}`)
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
