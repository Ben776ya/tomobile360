/**
 * Read-only audit: propose video -> model-page matches for human validation.
 *
 * Lists every published video from the `videos` table and, for each model,
 * proposes matches by brand/model in the title (reusing scoreVideoMatch from
 * src/lib/videos/match-video-to-car). Writes audits/video-model-mapping.csv
 * with a confidence column. Makes NO writes to the DB — anon read only, via the
 * same key the app uses (no MCP). After you validate the CSV, copy the chosen
 * rows into src/config/video-model-map.json to feature them on model pages.
 *
 * Run: npx tsx --env-file=.env.local scripts/map-videos-to-models.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { scoreVideoMatch } from '@/lib/videos/match-video-to-car'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (load via --env-file=.env.local)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })

type ModelRow = { id: string; name: string; brands: { name: string } | { name: string }[] | null }
type VideoRow = {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: string | null
  views: number | null
  created_at: string | null
}

function brandNameOf(m: ModelRow): string {
  const b = Array.isArray(m.brands) ? m.brands[0] : m.brands
  return b?.name ?? ''
}

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const CONF_RANK: Record<string, number> = { high: 0, medium: 1 }

async function main() {
  const { data: models, error: mErr } = await supabase
    .from('models')
    .select('id, name, brands:brand_id (name)')
  if (mErr) {
    console.error('models query failed:', mErr.message)
    process.exit(1)
  }

  const { data: videos, error: vErr } = await supabase
    .from('videos')
    .select('id, title, description, video_url, thumbnail_url, duration, views, created_at')
    .eq('is_published', true)
  if (vErr) {
    console.error('videos query failed:', vErr.message)
    process.exit(1)
  }

  const rows: string[][] = []
  for (const m of (models ?? []) as ModelRow[]) {
    const brand = brandNameOf(m)
    if (!brand || !m.name) continue
    for (const v of (videos ?? []) as VideoRow[]) {
      const confidence = scoreVideoMatch(v.title, v.description, brand, m.name)
      if (!confidence) continue
      rows.push([
        brand,
        m.name,
        m.id,
        confidence,
        String(v.views ?? 0),
        v.id,
        v.title,
        v.video_url,
        v.thumbnail_url ?? '',
        v.duration ?? '',
        v.created_at ?? '',
      ])
    }
  }

  // Sort: model (brand + name), then confidence (high first), then views desc.
  rows.sort((a, b) => {
    const modelCmp = `${a[0]} ${a[1]}`.localeCompare(`${b[0]} ${b[1]}`)
    if (modelCmp !== 0) return modelCmp
    const confCmp = CONF_RANK[a[3]] - CONF_RANK[b[3]]
    if (confCmp !== 0) return confCmp
    return Number(b[4]) - Number(a[4])
  })

  const header = [
    'brand',
    'model',
    'model_id',
    'confidence',
    'views',
    'video_id',
    'video_title',
    'video_url',
    'thumbnail_url',
    'duration',
    'upload_date',
  ]
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n'

  const outDir = resolve(process.cwd(), 'audits')
  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, 'video-model-mapping.csv')
  writeFileSync(outPath, csv, 'utf8')

  const highCount = rows.filter((r) => r[3] === 'high').length
  console.log(
    `Wrote ${rows.length} proposed matches (${highCount} high, ${rows.length - highCount} medium) to ${outPath}`,
  )
  console.log(`Scanned ${(models ?? []).length} models x ${(videos ?? []).length} published videos.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
