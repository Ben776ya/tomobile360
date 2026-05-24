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
