import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const vehiclesDir = path.resolve('public/vehicles')

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function resyncImages() {
  // Get all brands from DB
  const { data: brands } = await supabase.from('brands').select('id, name')
  const brandByName = {}
  for (const b of brands) brandByName[b.name] = b.id

  // Get all models from DB
  const { data: models } = await supabase.from('models').select('id, name, brand_id')

  // Get all vehicles from DB
  const { data: vehicles } = await supabase
    .from('vehicles_new')
    .select('id, brand_id, model_id, images')

  // Build lookup: model_id -> vehicle
  const vehicleByModel = {}
  for (const v of vehicles) {
    vehicleByModel[v.model_id] = v
  }

  // Build lookup: brand_id -> brand name
  const brandNameById = {}
  for (const b of brands) brandNameById[b.id] = b.name

  let updated = 0
  let skipped = 0
  let notFound = 0

  for (const model of models) {
    const brandName = brandNameById[model.brand_id]
    if (!brandName) continue

    const brandSlug = slugify(brandName)
    const modelSlug = slugify(model.name)
    const modelDir = path.join(vehiclesDir, brandSlug, modelSlug)

    if (!fs.existsSync(modelDir)) {
      notFound++
      continue
    }

    // Read and sort images from filesystem
    const images = fs.readdirSync(modelDir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()

    if (images.length === 0) {
      skipped++
      continue
    }

    const imagePaths = images.map(f => `/vehicles/${brandSlug}/${modelSlug}/${f}`)

    // Find matching vehicle
    const vehicle = vehicleByModel[model.id]
    if (!vehicle) {
      skipped++
      continue
    }

    // Check if images changed
    const currentImages = vehicle.images || []
    const changed = JSON.stringify(currentImages) !== JSON.stringify(imagePaths)

    if (!changed) {
      skipped++
      continue
    }

    // Update in DB
    const { error } = await supabase
      .from('vehicles_new')
      .update({ images: imagePaths })
      .eq('id', vehicle.id)

    if (error) {
      console.error(`  ERROR ${brandName} ${model.name}: ${error.message}`)
    } else {
      updated++
      const oldThumb = currentImages[0]?.split('/').pop() || '(none)'
      const newThumb = images[0]
      console.log(`  ${brandName} ${model.name}: ${oldThumb} → ${newThumb}`)
    }
  }

  console.log(`\n=== Re-sync Complete ===`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped (unchanged): ${skipped}`)
  console.log(`Not found on disk: ${notFound}`)
}

resyncImages().catch(console.error)
