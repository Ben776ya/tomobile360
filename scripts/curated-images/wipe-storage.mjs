// tomobile360/scripts/curated-images/wipe-storage.mjs
// Deletes all objects under images/vehicles/* via the Supabase Storage API.
// Direct SQL DELETE on storage.objects is blocked by storage.protect_delete().

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

const BUCKET = 'images'
const PREFIX = 'vehicles'
const PAGE = 1000

async function listAllUnder(prefix) {
  // Storage list() is not recursive — must walk folders.
  const all = []
  const stack = [prefix]
  while (stack.length) {
    const dir = stack.pop()
    let offset = 0
    while (true) {
      const { data, error } = await supabase.storage.from(BUCKET).list(dir, {
        limit: PAGE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })
      if (error) throw error
      if (!data || data.length === 0) break
      for (const entry of data) {
        const fullPath = `${dir}/${entry.name}`
        // A folder entry has id === null (per Supabase Storage API).
        if (entry.id === null) {
          stack.push(fullPath)
        } else {
          all.push(fullPath)
        }
      }
      if (data.length < PAGE) break
      offset += PAGE
    }
  }
  return all
}

async function main() {
  console.log(`Listing all objects under ${BUCKET}/${PREFIX}/ ...`)
  const paths = await listAllUnder(PREFIX)
  console.log(`Found ${paths.length} objects to delete.`)

  if (paths.length === 0) {
    console.log('Nothing to delete. Done.')
    return
  }

  const BATCH = 1000
  let deleted = 0
  for (let i = 0; i < paths.length; i += BATCH) {
    const chunk = paths.slice(i, i + BATCH)
    const { data, error } = await supabase.storage.from(BUCKET).remove(chunk)
    if (error) {
      console.error(`Batch ${i}-${i + chunk.length} failed:`, error.message)
      process.exit(1)
    }
    deleted += data?.length ?? chunk.length
    console.log(`  Deleted ${deleted}/${paths.length}`)
  }

  console.log(`\nDone. Removed ${deleted} objects.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
