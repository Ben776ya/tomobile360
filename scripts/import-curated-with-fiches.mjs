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

// ---------------------------------------------------------------------------
// findModelMatch — fuzzy-resolves a source (brandSlug, modelSlug) pair against
// the DB model index. Source folders often use a shorter slug than the DB row
// (e.g. source `audi/a1` vs DB `A1 Sportback` → slug `a1-sportback`), so we
// try a series of progressively looser matching rules. First hit wins.
//
// Rules (in order):
//   1. Exact slug match           db.slug === src.slug
//   2. Slug-without-dashes match  removes hyphens from both sides
//                                 (handles `c4x` ↔ `c4-x`)
//   3. Source prefixes DB         db.slug === `${src.slug}-${suffix}`
//                                 (handles `a1` ↔ `a1-sportback`)
//   4. DB prefixes source         src.slug === `${db.slug}-${suffix}`
//                                 (handles `poer` ↔ `poer-dc`)
//   5. Mercedes `classe-` strip   if src.slug starts with `classe-`, retry
//                                 rules 1–4 with the prefix removed
//                                 (handles `classe-cla` ↔ `cla-coupe`)
//
// Candidate selection when multiple DB rows match under the same rule:
//   - prefer the candidate with FEWEST existing images
//   - on ties: prefer the shortest DB model name (most generic)
//   - if ALL candidates have imageCount >= IMAGE_KEEP_THRESHOLD →
//     return { ambiguous: true, ... } so the caller emits SKIP_AMBIGUOUS
//     (we don't want to overwrite a populated row, nor create a duplicate)
//
// Returns one of:
//   null
//   { matched: <dbModelEntry>, matchRule, candidateCount }
//   { ambiguous: true, candidates: [...], reason, matchRule }
// ---------------------------------------------------------------------------
function findModelMatch(srcBrandSlug, srcModelSlug, idx) {
  // Collect every model belonging to this brand once — cheaper than repeated
  // full-map scans for each rule.
  const brandModels = []
  for (const entry of idx.modelByKey.values()) {
    if (entry.brandSlug === srcBrandSlug) brandModels.push(entry)
  }
  if (brandModels.length === 0) return null

  const tryRules = (querySlug) => {
    // Rule 1 — exact
    let hits = brandModels.filter(m => slug(m.modelName) === querySlug)
    if (hits.length) return { hits, matchRule: 'exact' }

    // Rule 2 — slug without dashes
    const queryFlat = querySlug.replace(/-/g, '')
    hits = brandModels.filter(m => slug(m.modelName).replace(/-/g, '') === queryFlat)
    if (hits.length) return { hits, matchRule: 'no-dashes' }

    // Rule 3 — source prefixes DB with a dash boundary
    hits = brandModels.filter(m => {
      const ds = slug(m.modelName)
      return ds.length > querySlug.length && ds.startsWith(querySlug + '-')
    })
    if (hits.length) return { hits, matchRule: 'src-prefixes-db' }

    // Rule 4 — DB prefixes source with a dash boundary
    hits = brandModels.filter(m => {
      const ds = slug(m.modelName)
      return querySlug.length > ds.length && querySlug.startsWith(ds + '-')
    })
    if (hits.length) return { hits, matchRule: 'db-prefixes-src' }

    return null
  }

  let result = tryRules(srcModelSlug)
  let appliedRule = result?.matchRule

  // Rule 5 — Mercedes "classe-" prefix strip → retry rules 1-4
  if (!result && srcModelSlug.startsWith('classe-')) {
    const stripped = srcModelSlug.slice('classe-'.length)
    if (stripped.length > 0) {
      const retried = tryRules(stripped)
      if (retried) {
        result = retried
        appliedRule = 'classe-strip'  // override — caller wants the strip rule reported
      }
    }
  }

  if (!result) return null

  const { hits } = result

  // Pick best candidate: fewest images, then shortest name.
  const sortedHits = [...hits].sort((a, b) => {
    if (a.imageCount !== b.imageCount) return a.imageCount - b.imageCount
    return a.modelName.length - b.modelName.length
  })

  const candidatesSnapshot = sortedHits.map(c => ({
    modelId: c.modelId,
    modelName: c.modelName,
    imageCount: c.imageCount,
    hasFiche: c.hasFiche,
  }))

  // Ambiguous: more than one candidate AND every single one is already populated.
  // Picking any would either overwrite a healthy row or leave duplicates.
  if (hits.length > 1 && hits.every(h => h.imageCount >= IMAGE_KEEP_THRESHOLD)) {
    return {
      ambiguous: true,
      candidates: candidatesSnapshot,
      matchRule: appliedRule,
      reason: `multiple matches (${hits.length}) all with >= ${IMAGE_KEEP_THRESHOLD} images — refusing to overwrite or duplicate`,
    }
  }

  return {
    matched: sortedHits[0],
    matchRule: appliedRule,
    candidateCount: hits.length,
  }
}

// ---------------------------------------------------------------------------
// Classifier — walks curated-images/ and assigns each model an action bucket.
// Returns: { skip, replace, create, skipAmbiguous, errors } where each entry
// has full provenance.
// ---------------------------------------------------------------------------
function classifySources(idx) {
  if (!fs.existsSync(CURATED_DIR)) {
    console.error('ERROR: curated-images folder not found at', CURATED_DIR)
    process.exit(1)
  }

  const skip = []           // existing model with >= 6 images → no-op
  const replace = []        // existing model with <= 5 images → re-upload images + refresh fiche
  const create = []         // model not in DB → create model+vehicle+images+fiche (and brand if missing)
  const skipAmbiguous = []  // multiple DB candidates all populated → don't touch, don't duplicate
  const errors = []         // unparseable / missing fiche / no images / dup folder

  const rawBrandFolders = fs.readdirSync(CURATED_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()

  // Pre-pass: when two folders slug to the same brand (Windows quirk —
  // `Aston Martin` AND `aston-martin` both slug to `aston-martin`), prefer
  // the folder whose raw name is already the canonical slug form. The other
  // is recorded as a DUPLICATE_BRAND_FOLDER error so it's visible in the report.
  const folderBySlug = new Map()
  for (const f of rawBrandFolders) {
    const s = slug(f)
    const existing = folderBySlug.get(s)
    if (!existing) {
      folderBySlug.set(s, f)
    } else {
      // tiebreak: keep the one whose raw name equals its slug (canonical)
      const existingIsCanonical = existing === s
      const newIsCanonical = f === s
      if (newIsCanonical && !existingIsCanonical) {
        // The new candidate is canonical — swap, push the previous one to errors.
        errors.push({ kind: 'DUPLICATE_BRAND_FOLDER', brandFolder: existing, brandSlug: s,
                      reason: `another folder ("${f}") with the same brand slug is canonical and was preferred` })
        folderBySlug.set(s, f)
      } else {
        // Existing wins (either it's canonical, or neither is and we keep first-seen).
        errors.push({ kind: 'DUPLICATE_BRAND_FOLDER', brandFolder: f, brandSlug: s,
                      reason: `another folder ("${existing}") with the same brand slug was already preferred` })
      }
    }
  }

  // Iterate the dedup'd brand folders in deterministic slug order.
  const brandFolders = [...folderBySlug.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, folder]) => folder)

  for (const brandFolder of brandFolders) {
    const brandSlug = slug(brandFolder)

    // Resolve brand: explicit alias → DB row, else slug match, else mark NEW
    const aliasedName = BRAND_ALIAS[brandSlug]
    const resolveSlug = aliasedName ? slug(aliasedName) : brandSlug
    const dbBrand = idx.brandBySlug.get(resolveSlug)
    const brandKnownNew = !dbBrand && NEW_BRAND_DISPLAY_NAMES[brandSlug]
    if (!dbBrand && !brandKnownNew) {
      errors.push({ kind: 'UNKNOWN_BRAND', brandFolder, brandSlug,
                    reason: `brand slug "${brandSlug}" is not in DB and not in the known-new-brand list` })
      continue
    }

    const brandDir = path.join(CURATED_DIR, brandFolder)
    const modelFolders = fs.readdirSync(brandDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort()

    for (const modelFolder of modelFolders) {
      const modelSlug = slug(modelFolder).replace(/-+$/g, '')  // trim trailing dash (gtc4lusso-, poer-, levante-)
      const curatedDir = path.join(brandDir, modelFolder, 'curated')
      const detailDir = path.join(brandDir, modelFolder, 'detail-shots')
      const curatedFiles = listImages(curatedDir).slice(0, CURATED_TAKE)
      const detailFiles = listImages(detailDir).slice(0, DETAIL_TAKE)
      const totalImages = curatedFiles.length + detailFiles.length

      const ficheRelPath = path.join(brandSlug, `${modelSlug}.json`)
      const ficheAbsPath = path.join(FICHES_DIR, ficheRelPath)
      const ficheExists = fs.existsSync(ficheAbsPath)

      const baseEntry = {
        brandFolder, modelFolder, brandSlug, modelSlug,
        resolvedBrandSlug: resolveSlug,
        curatedCount: curatedFiles.length,
        detailCount: detailFiles.length,
        totalImages,
        ficheExists,
        ficheRelPath,
      }

      if (totalImages === 0) {
        errors.push({ ...baseEntry, kind: 'NO_IMAGES',
                      reason: 'no usable JPG/PNG/WEBP files under curated/ or detail-shots/' })
        continue
      }

      const dbBrandSlug = aliasedName ? slug(aliasedName) : brandSlug
      const match = findModelMatch(dbBrandSlug, modelSlug, idx)

      if (match && match.ambiguous) {
        skipAmbiguous.push({
          ...baseEntry,
          candidates: match.candidates,
          matchRule: match.matchRule,
          reason: match.reason,
        })
      } else if (match && match.matched) {
        const dbModel = match.matched
        if (dbModel.imageCount >= IMAGE_KEEP_THRESHOLD) {
          skip.push({ ...baseEntry, modelId: dbModel.modelId, modelName: dbModel.modelName,
                      existingImageCount: dbModel.imageCount,
                      matchRule: match.matchRule, candidateCount: match.candidateCount,
                      reason: `existing vehicles_new row has ${dbModel.imageCount} images (>= ${IMAGE_KEEP_THRESHOLD})` })
        } else {
          replace.push({ ...baseEntry, modelId: dbModel.modelId, modelName: dbModel.modelName,
                         vehicleId: dbModel.vehicleId, existingImageCount: dbModel.imageCount,
                         existingHasFiche: dbModel.hasFiche,
                         matchRule: match.matchRule, candidateCount: match.candidateCount })
        }
      } else {
        create.push({ ...baseEntry,
                      willCreateBrand: !dbBrand,
                      newBrandName: dbBrand ? null : NEW_BRAND_DISPLAY_NAMES[brandSlug] })
      }
    }
  }

  return { skip, replace, create, skipAmbiguous, errors }
}

async function main() {
  const idx = await loadDbIndex()
  const { skip, replace, create, skipAmbiguous, errors } = classifySources(idx)

  console.log('========== CLASSIFICATION SUMMARY ==========')
  console.log(`SKIP     (existing, >=6 images, no-op):           ${skip.length}`)
  console.log(`REPLACE  (existing, <=5 images):                  ${replace.length}`)
  console.log(`CREATE   (new model, possibly new brand):         ${create.length}`)
  console.log(`SKIP_AMB (multiple matches, all >=6 imgs):        ${skipAmbiguous.length}`)
  console.log(`ERRORS   (unparseable / no images / dup):         ${errors.length}`)
  const newBrands = [...new Set(create.filter(c => c.willCreateBrand).map(c => c.newBrandName))]
  console.log(`Brands to create: ${newBrands.join(', ') || '(none)'}`)
  console.log('============================================\n')

  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    summary: { skip: skip.length, replace: replace.length, create: create.length,
               skipAmbiguous: skipAmbiguous.length, errors: errors.length,
               newBrands },
    skip, replace, create, skipAmbiguous, errors,
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
  console.log(`Report written to: ${REPORT_PATH}\n`)

  if (!APPLY) {
    console.log('Dry-run complete. Review the report, then re-run with --apply to mutate.')
    return
  }
  // (apply branches added in later tasks)
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
