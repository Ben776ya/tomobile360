// tomobile360/scripts/curated-images/audit-mapping.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')   // tomobile360/
const workspaceRoot = path.resolve(projectRoot, '..')      // tomobil-test/
const CURATED = path.join(workspaceRoot, 'curated')
const OUT_DIR = path.join(__dirname, 'output')

function loadEnvLocal() {
  const envPath = path.join(projectRoot, '.env.local')
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    let v = line.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[k] = v
  }
}
loadEnvLocal()

function slug(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp'])
function countImages(dir) {
  return fs.readdirSync(dir)
    .filter(f => IMG.has(path.extname(f).toLowerCase()) && f !== '_preview.jpg')
    .length
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: models, error } = await supabase
    .from('models')
    .select('id, name, brands(name)')
  if (error) { console.error(error); process.exit(1) }

  const { data: counts, error: countErr } = await supabase
    .from('vehicles_new')
    .select('model_id')
  if (countErr) { console.error(countErr); process.exit(1) }
  const countByModel = new Map()
  for (const r of counts) countByModel.set(r.model_id, (countByModel.get(r.model_id) || 0) + 1)

  const dbMap = new Map()
  for (const m of models) {
    const brandName = Array.isArray(m.brands) ? m.brands[0]?.name : m.brands?.name
    if (!brandName) continue
    const key = `${slug(brandName)}::${slug(m.name)}`
    if (dbMap.has(key)) {
      const prior = dbMap.get(key)
      console.warn(`WARN: DB slug collision "${key}" — "${brandName} ${m.name}" overwrites "${prior.brand_name} ${prior.model_name}"`)
    }
    dbMap.set(key, {
      model_id: m.id,
      brand_name: brandName,
      model_name: m.name,
      vehicle_count: countByModel.get(m.id) || 0,
    })
  }

  const mapping = []
  const unmapped = []

  for (const brand of fs.readdirSync(CURATED).sort()) {
    const brandDir = path.join(CURATED, brand)
    if (!fs.statSync(brandDir).isDirectory()) continue
    for (const model of fs.readdirSync(brandDir).sort()) {
      const modelDir = path.join(brandDir, model)
      if (!fs.statSync(modelDir).isDirectory()) continue
      const imgCount = countImages(modelDir)
      const key = `${slug(brand)}::${slug(model)}`
      const hit = dbMap.get(key)
      if (hit) {
        mapping.push({
          curated_brand: brand,
          curated_model: model,
          brand_slug: slug(brand),
          model_slug: slug(model),
          db_brand: hit.brand_name,
          db_model: hit.model_name,
          model_id: hit.model_id,
          image_count: imgCount,
          vehicle_rows_to_update: hit.vehicle_count,
        })
      } else {
        unmapped.push({
          curated_brand: brand,
          curated_model: model,
          brand_slug: slug(brand),
          model_slug: slug(model),
          image_count: imgCount,
          reason: 'no DB model with matching slug',
        })
      }
    }
  }

  const toCsv = (rows) => {
    if (rows.length === 0) return ''
    const cols = Object.keys(rows[0])
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n')
  }

  fs.writeFileSync(path.join(OUT_DIR, 'mapping.csv'), toCsv(mapping))
  fs.writeFileSync(path.join(OUT_DIR, 'unmapped.csv'), toCsv(unmapped))

  const withImages = mapping.filter(r => r.image_count > 0)
  const empty = mapping.filter(r => r.image_count === 0)
  console.log(`Curated folders scanned:        ${mapping.length + unmapped.length}`)
  console.log(`Matched to DB models:           ${mapping.length}`)
  console.log(`  - with images (will upload):  ${withImages.length}`)
  console.log(`  - empty (will leave images=[]): ${empty.length}`)
  console.log(`Unmapped (review unmapped.csv): ${unmapped.length}`)
  console.log(`Total vehicles_new rows touched by upload: ${withImages.reduce((a, b) => a + b.vehicle_rows_to_update, 0)}`)
  console.log(`Total images to upload:         ${withImages.reduce((a, b) => a + b.image_count, 0)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
