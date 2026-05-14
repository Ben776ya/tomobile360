// tomobile360/scripts/curated-images/snapshot-images.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const all = []
  const page = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('vehicles_new')
      .select('id, model_id, brand_id, version, year, images')
      .range(from, from + page - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < page) break
    from += page
  }

  const outPath = path.join(__dirname, 'output', 'snapshot-vehicles_new-images.json')
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2))

  const withImages = all.filter(r => Array.isArray(r.images) && r.images.length > 0).length
  console.log(`Snapshot rows:           ${all.length}`)
  console.log(`Rows with non-empty images: ${withImages}`)
  console.log(`Saved to: ${outPath}`)
}

main().catch(e => { console.error(e); process.exit(1) })
