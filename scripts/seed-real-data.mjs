/**
 * seed-real-data.mjs
 *
 * Replaces all mock models and vehicles_new data with real Moroccan market data.
 *
 * Input files (project root):
 *   - tomobile360_brand_descriptions_COMPLETE_58.json  (58 brand descriptions)
 *   - brands_models_versions.json                      (58 brands, 299 models, 745 versions)
 *
 * Phases:
 *   1. Update brand descriptions
 *   2. Delete existing mock data (promotions, favorites[new], vehicles_new, models)
 *   3. Insert real models
 *   4. Insert versions as vehicles_new rows
 *
 * Usage:
 *   node scripts/seed-real-data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// .env.local loader — Node.js does not auto-load .env files
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
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ---------------------------------------------------------------------------
// Load JSON data files
// ---------------------------------------------------------------------------
const descriptionsPath = path.join(projectRoot, 'tomobile360_brand_descriptions_COMPLETE_58.json')
const modelsPath = path.join(projectRoot, 'brands_models_versions.json')

if (!fs.existsSync(descriptionsPath)) {
  console.error('ERROR: Brand descriptions file not found at', descriptionsPath)
  process.exit(1)
}
if (!fs.existsSync(modelsPath)) {
  console.error('ERROR: Brands/models/versions file not found at', modelsPath)
  process.exit(1)
}

const descriptionsData = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'))
const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'))

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------
const BODY_TYPE_MAP = {
  'Citadine': 'Citadine',
  'Compacte': 'Compacte',
  'Berline': 'Berline',
  'Coupé': 'Coupé',
  'Cabriolet': 'Cabriolet',
  'Utilitaire': 'Utilitaire',
  'Familiale': 'Break',
  'Ludospace': 'Monospace',
  'Pickup': 'Pick-up',
  'SUV Compact': 'SUV',
  'SUV Coupé': 'SUV',
  'SUV Familial': 'SUV',
  'SUV Grand': 'SUV',
  'SUV Urbain': 'SUV',
  'SUV/4x4': 'SUV',
}

const FUEL_TYPE_MAP = {
  'Essence': 'Essence',
  'Diesel': 'Diesel',
  'Electrique': 'Electric',
  'Hybride': 'Hybrid',
  'Hybride rechargeable': 'PHEV',
  'Essence MHEV': 'Hybrid',
  'Diesel MHEV': 'Hybrid',
  'REEV': 'Electric',
}

const TRANSMISSION_MAP = {
  'Automatique': 'Automatic',
  'Manuelle': 'Manual',
}

function mapBodyType(raw) {
  const mapped = BODY_TYPE_MAP[raw]
  if (!mapped) {
    console.warn(`  WARNING: Unknown body_type "${raw}" — defaulting to "Berline"`)
    return 'Berline'
  }
  return mapped
}

function mapFuelType(raw) {
  const mapped = FUEL_TYPE_MAP[raw]
  if (!mapped) {
    console.warn(`  WARNING: Unknown fuel_type "${raw}" — defaulting to "Essence"`)
    return 'Essence'
  }
  return mapped
}

function mapTransmission(raw) {
  const mapped = TRANSMISSION_MAP[raw]
  if (!mapped) {
    console.warn(`  WARNING: Unknown transmission "${raw}" — defaulting to "Manual"`)
    return 'Manual'
  }
  return mapped
}

// ---------------------------------------------------------------------------
// Phase 1: Update brand descriptions
// ---------------------------------------------------------------------------
async function phase1_updateBrandDescriptions() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 1: Update brand descriptions')
  console.log('='.repeat(60))

  const descriptions = descriptionsData.brand_descriptions
  console.log(`Loaded ${descriptions.length} brand descriptions from JSON`)

  // Fetch all existing brands from DB
  const { data: dbBrands, error: fetchErr } = await supabase
    .from('brands')
    .select('id, name')

  if (fetchErr) {
    console.error('CRITICAL: Failed to fetch brands from DB:', fetchErr.message)
    process.exit(1)
  }

  console.log(`Found ${dbBrands.length} brands in database`)

  // Build a name-to-id lookup
  const brandNameToId = new Map()
  for (const b of dbBrands) {
    brandNameToId.set(b.name, b.id)
  }

  let updated = 0
  let skipped = 0

  for (const desc of descriptions) {
    const brandId = brandNameToId.get(desc.name)
    if (!brandId) {
      console.warn(`  SKIP: Brand "${desc.name}" not found in DB`)
      skipped++
      continue
    }

    const { error: updateErr } = await supabase
      .from('brands')
      .update({ description: desc.description })
      .eq('id', brandId)

    if (updateErr) {
      console.error(`  ERROR updating "${desc.name}":`, updateErr.message)
      skipped++
    } else {
      updated++
    }
  }

  console.log(`\nPhase 1 complete: ${updated} descriptions updated, ${skipped} skipped`)
  return { updated, skipped }
}

// ---------------------------------------------------------------------------
// Phase 2: Delete existing mock data
// ---------------------------------------------------------------------------
async function phase2_deleteMockData() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 2: Delete existing mock data')
  console.log('='.repeat(60))

  // 2a. Delete promotions (FK to vehicles_new)
  console.log('\n  Deleting promotions...')
  const { error: promoErr, count: promoCount } = await supabase
    .from('promotions')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (promoErr) {
    console.error('  ERROR deleting promotions:', promoErr.message)
  } else {
    console.log(`  Deleted ${promoCount ?? '?'} promotions`)
  }

  // 2b. Delete favorites where vehicle_type = 'new'
  console.log('  Deleting favorites (vehicle_type=new)...')
  const { error: favErr, count: favCount } = await supabase
    .from('favorites')
    .delete({ count: 'exact' })
    .eq('vehicle_type', 'new')

  if (favErr) {
    console.error('  ERROR deleting favorites:', favErr.message)
  } else {
    console.log(`  Deleted ${favCount ?? '?'} favorites (new)`)
  }

  // 2c. Delete all vehicles_new
  console.log('  Deleting all vehicles_new...')
  const { error: vehErr, count: vehCount } = await supabase
    .from('vehicles_new')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (vehErr) {
    console.error('  ERROR deleting vehicles_new:', vehErr.message)
  } else {
    console.log(`  Deleted ${vehCount ?? '?'} vehicles_new`)
  }

  // 2d. Delete all models
  console.log('  Deleting all models...')
  const { error: modelErr, count: modelCount } = await supabase
    .from('models')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (modelErr) {
    console.error('  ERROR deleting models:', modelErr.message)
  } else {
    console.log(`  Deleted ${modelCount ?? '?'} models`)
  }

  console.log('\nPhase 2 complete')
}

// ---------------------------------------------------------------------------
// Phase 3: Insert real models
// ---------------------------------------------------------------------------
async function phase3_insertModels() {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 3: Insert real models')
  console.log('='.repeat(60))

  const brands = modelsData.brands
  console.log(`Processing ${brands.length} brands with models...`)

  // Fetch all brands from DB for id lookup
  const { data: dbBrands, error: fetchErr } = await supabase
    .from('brands')
    .select('id, name')

  if (fetchErr) {
    console.error('CRITICAL: Failed to fetch brands:', fetchErr.message)
    process.exit(1)
  }

  const brandNameToId = new Map()
  for (const b of dbBrands) {
    brandNameToId.set(b.name, b.id)
  }

  // Map of "brandName::modelName" -> model_id (returned after insert)
  const modelKeyToId = new Map()
  let totalModelsInserted = 0
  let brandsSkipped = 0

  for (const brand of brands) {
    const brandId = brandNameToId.get(brand.name)
    if (!brandId) {
      console.warn(`  SKIP: Brand "${brand.name}" not found in DB`)
      brandsSkipped++
      continue
    }

    if (!brand.models || brand.models.length === 0) {
      console.log(`  ${brand.name}: no models to insert`)
      continue
    }

    // Prepare model rows
    const modelRows = brand.models.map(m => ({
      brand_id: brandId,
      name: m.name,
      category: mapBodyType(m.body_type),
    }))

    const { data: inserted, error: insertErr } = await supabase
      .from('models')
      .insert(modelRows)
      .select('id, name')

    if (insertErr) {
      console.error(`  ERROR inserting models for "${brand.name}":`, insertErr.message)
      continue
    }

    for (const row of inserted) {
      const key = `${brand.name}::${row.name}`
      modelKeyToId.set(key, row.id)
    }

    totalModelsInserted += inserted.length
    console.log(`  ${brand.name}: ${inserted.length} models inserted`)
  }

  console.log(`\nPhase 3 complete: ${totalModelsInserted} models inserted, ${brandsSkipped} brands skipped`)
  return modelKeyToId
}

// ---------------------------------------------------------------------------
// Phase 4: Insert versions as vehicles_new
// ---------------------------------------------------------------------------
async function phase4_insertVehicles(modelKeyToId) {
  console.log('\n' + '='.repeat(60))
  console.log('PHASE 4: Insert versions as vehicles_new')
  console.log('='.repeat(60))

  const brands = modelsData.brands

  // Fetch all brands from DB for id lookup
  const { data: dbBrands, error: fetchErr } = await supabase
    .from('brands')
    .select('id, name')

  if (fetchErr) {
    console.error('CRITICAL: Failed to fetch brands:', fetchErr.message)
    process.exit(1)
  }

  const brandNameToId = new Map()
  for (const b of dbBrands) {
    brandNameToId.set(b.name, b.id)
  }

  let totalVersionsInserted = 0
  let totalErrors = 0

  for (const brand of brands) {
    const brandId = brandNameToId.get(brand.name)
    if (!brandId) continue

    // Collect all vehicle rows for this brand
    const vehicleRows = []

    for (const model of (brand.models || [])) {
      const modelKey = `${brand.name}::${model.name}`
      const modelId = modelKeyToId.get(modelKey)
      if (!modelId) {
        console.warn(`  SKIP versions: model "${modelKey}" not found in lookup`)
        continue
      }

      for (const version of (model.versions || [])) {
        vehicleRows.push({
          brand_id: brandId,
          model_id: modelId,
          version: version.name,
          year: 2025,
          fuel_type: mapFuelType(version.fuel_type),
          transmission: mapTransmission(version.transmission),
          horsepower: version.horsepower || null,
          price_min: version.price_min || null,
          price_max: version.price_max || null,
          is_available: true,
          is_popular: false,
          is_new_release: false,
          is_coming_soon: false,
          is_coup_de_coeur: false,
          is_featured_offer: false,
          images: [],
          features: [],
          safety_features: [],
        })
      }
    }

    if (vehicleRows.length === 0) continue

    // Insert in batches of 50
    const BATCH_SIZE = 50
    let brandInserted = 0

    for (let i = 0; i < vehicleRows.length; i += BATCH_SIZE) {
      const batch = vehicleRows.slice(i, i + BATCH_SIZE)
      const { data: inserted, error: insertErr } = await supabase
        .from('vehicles_new')
        .insert(batch)
        .select('id')

      if (insertErr) {
        console.error(`  ERROR inserting vehicles for "${brand.name}" (batch ${Math.floor(i / BATCH_SIZE) + 1}):`, insertErr.message)
        totalErrors++
        continue
      }

      brandInserted += inserted.length
    }

    totalVersionsInserted += brandInserted
    console.log(`  ${brand.name}: ${brandInserted} vehicles inserted`)
  }

  console.log(`\nPhase 4 complete: ${totalVersionsInserted} vehicles inserted, ${totalErrors} batch errors`)
  return totalVersionsInserted
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
async function verify() {
  console.log('\n' + '='.repeat(60))
  console.log('VERIFICATION')
  console.log('='.repeat(60))

  // Count brands
  const { count: brandCount } = await supabase
    .from('brands')
    .select('id', { count: 'exact', head: true })
  console.log(`  Brands in DB: ${brandCount}`)

  // Count models
  const { count: modelCount } = await supabase
    .from('models')
    .select('id', { count: 'exact', head: true })
  console.log(`  Models in DB: ${modelCount}`)

  // Count vehicles_new
  const { count: vehicleCount } = await supabase
    .from('vehicles_new')
    .select('id', { count: 'exact', head: true })
  console.log(`  Vehicles (new) in DB: ${vehicleCount}`)

  // Spot check: BMW description
  const { data: bmw } = await supabase
    .from('brands')
    .select('name, description')
    .eq('name', 'BMW')
    .single()

  if (bmw) {
    const snippet = bmw.description ? bmw.description.substring(0, 80) + '...' : '(no description)'
    console.log(`\n  Spot check — BMW description: "${snippet}"`)
  } else {
    console.warn('  Spot check — BMW not found')
  }

  // Spot check: random vehicle
  const { data: sampleVehicle } = await supabase
    .from('vehicles_new')
    .select('version, year, fuel_type, transmission, horsepower, price_min, price_max, brands(name), models(name)')
    .limit(1)
    .single()

  if (sampleVehicle) {
    console.log('  Spot check — random vehicle:', JSON.stringify(sampleVehicle, null, 2))
  } else {
    console.warn('  Spot check — no vehicles found')
  }

  // Expected vs actual
  console.log('\n  Expected: 58 brands, 299 models, 745 vehicles')
  console.log(`  Actual:   ${brandCount} brands, ${modelCount} models, ${vehicleCount} vehicles`)

  if (modelCount === 299 && vehicleCount === 745) {
    console.log('\n  All counts match. Migration successful!')
  } else {
    console.warn('\n  WARNING: Counts do not match expected values. Review logs above for errors.')
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60))
  console.log('  TOMOBILE 360 — Real Data Seed Script')
  console.log('  Replacing mock data with Moroccan market data')
  console.log('='.repeat(60))

  // Phase 1
  await phase1_updateBrandDescriptions()

  // Phase 2
  await phase2_deleteMockData()

  // Phase 3
  const modelKeyToId = await phase3_insertModels()

  // Phase 4
  await phase4_insertVehicles(modelKeyToId)

  // Verify
  await verify()

  console.log('\n' + '='.repeat(60))
  console.log('  DONE')
  console.log('='.repeat(60))
}

main().catch(err => {
  console.error('\nFATAL ERROR:', err)
  process.exit(1)
})
