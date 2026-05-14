// tomobile360/scripts/curated-images/upload-curated.mjs
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
const BUCKET = 'images'
const STORAGE_PREFIX = 'vehicles'

const DRY_RUN = process.argv.includes('--dry-run')

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
function imageFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => IMG.has(path.extname(f).toLowerCase()) && f !== '_preview.jpg')
    .sort()
}
function contentType(ext) {
  const e = ext.toLowerCase()
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg'
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

const OVERRIDES = {
  // Keep in sync with audit-mapping.mjs OVERRIDES.
  // 'curated-brand-slug::curated-model-slug': 'db-brand-slug::db-model-slug',
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: models, error } = await supabase.from('models').select('id, name, brands(name)')
  if (error) { console.error(error); process.exit(1) }

  const dbMap = new Map()
  for (const m of models) {
    const brandName = Array.isArray(m.brands) ? m.brands[0]?.name : m.brands?.name
    if (!brandName) continue
    dbMap.set(`${slug(brandName)}::${slug(m.name)}`, { model_id: m.id, brand_name: brandName, model_name: m.name })
  }
  for (const [curatedKey, dbKey] of Object.entries(OVERRIDES)) {
    const hit = dbMap.get(dbKey)
    if (hit) dbMap.set(curatedKey, hit)
  }

  const log = []
  let totalUploaded = 0
  let totalRowsUpdated = 0
  let modelsWithImages = 0
  let modelsEmpty = 0
  let modelsUnmapped = 0
  let uploadFailures = 0

  for (const brand of fs.readdirSync(CURATED).sort()) {
    const brandDir = path.join(CURATED, brand)
    if (!fs.statSync(brandDir).isDirectory()) continue
    for (const model of fs.readdirSync(brandDir).sort()) {
      const modelDir = path.join(brandDir, model)
      if (!fs.statSync(modelDir).isDirectory()) continue

      const key = `${slug(brand)}::${slug(model)}`
      const hit = dbMap.get(key)
      if (!hit) {
        log.push({ brand, model, status: 'UNMAPPED', uploaded: 0, rows_updated: 0 })
        modelsUnmapped++
        continue
      }

      const files = imageFiles(modelDir)
      if (files.length === 0) {
        log.push({ brand, model, status: 'EMPTY', uploaded: 0, rows_updated: 0, model_id: hit.model_id })
        modelsEmpty++
        continue
      }

      const urls = []
      for (const filename of files) {
        const localPath = path.join(modelDir, filename)
        const storagePath = `${STORAGE_PREFIX}/${slug(brand)}/${slug(model)}/${filename}`

        if (DRY_RUN) {
          urls.push(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`)
          continue
        }

        const buf = fs.readFileSync(localPath)
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
          contentType: contentType(path.extname(filename)),
          upsert: true,
        })
        if (upErr) {
          uploadFailures++
          console.error(`  UPLOAD FAIL ${storagePath}: ${upErr.message}`)
          continue
        }
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
        urls.push(publicUrl)
        totalUploaded++
      }

      if (urls.length === 0) {
        log.push({ brand, model, status: 'ALL_UPLOADS_FAILED', uploaded: 0, rows_updated: 0, model_id: hit.model_id })
        continue
      }

      let rowsUpdated = 0
      if (!DRY_RUN) {
        const { data: updated, error: updErr } = await supabase
          .from('vehicles_new')
          .update({ images: urls })
          .eq('model_id', hit.model_id)
          .select('id')
        if (updErr) {
          console.error(`  DB UPDATE FAIL for ${brand}/${model}: ${updErr.message}`)
          log.push({ brand, model, status: 'DB_UPDATE_FAILED', uploaded: urls.length, rows_updated: 0, model_id: hit.model_id })
          continue
        }
        rowsUpdated = updated?.length ?? 0
        totalRowsUpdated += rowsUpdated
      }

      modelsWithImages++
      log.push({ brand, model, status: 'OK', uploaded: urls.length, rows_updated: rowsUpdated, model_id: hit.model_id })
      console.log(`  ${brand}/${model}: ${urls.length} images, ${rowsUpdated} rows`)
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'upload-log.json'), JSON.stringify(log, null, 2))

  console.log('\n=== SUMMARY ===')
  console.log(`Mode:                       ${DRY_RUN ? 'DRY RUN (no uploads, no DB writes)' : 'LIVE'}`)
  console.log(`Models with images uploaded: ${modelsWithImages}`)
  console.log(`Models empty (skipped):      ${modelsEmpty}`)
  console.log(`Models unmapped (skipped):   ${modelsUnmapped}`)
  console.log(`Total images uploaded:       ${totalUploaded}`)
  console.log(`Total vehicles_new updated:  ${totalRowsUpdated}`)
  console.log(`Upload failures:             ${uploadFailures}`)
  console.log(`Log written to: ${path.join(OUT_DIR, 'upload-log.json')}`)
}

main().catch(e => { console.error(e); process.exit(1) })
