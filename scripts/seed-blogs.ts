/**
 * Seed blog_posts table from .md files in /blogs/
 *
 * Usage:  npx tsx scripts/seed-blogs.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * Upserts on slug — safe to run multiple times.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// 1. Load .env.local
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌  .env.local not found at', envPath)
    process.exit(1)
  }
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ---------------------------------------------------------------------------
// 2. Category mapping — display name → DB value
// ---------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, string> = {
  'marché & tendances': 'marche',
  'marché':             'marche',
  'marche':             'marche',
  'nouveautés':         'nouveautes',
  'nouveautes':         'nouveautes',
  'pratique & conseils': 'pratique',
  'pratique':           'pratique',
  'tendances & analyse': 'tendances',
  'tendances':          'tendances',
  'interview & industrie': 'interview',
  'interview':          'interview',
}

// ---------------------------------------------------------------------------
// 3. Parse a blog .md file with custom header format
// ---------------------------------------------------------------------------
interface BlogMeta {
  title: string
  slug: string
  subtitle: string | null
  meta_description: string | null
  category: string
  tags: string[]
  author: string
  hero_image_caption: string | null
  content: string
}

function parseBlogFile(raw: string): BlogMeta {
  const lines = raw.split('\n')

  // --- Extract H1 title ---
  let title = ''
  let headerEndLine = 0
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l.startsWith('# ') && !l.startsWith('## ')) {
      title = l.slice(2).trim()
      headerEndLine = i + 1
      break
    }
  }

  // --- Extract bold key-value metadata from the header block ---
  let slug = ''
  let category = ''
  let author = 'Rédaction Tomobile360'
  let metaDescription: string | null = null
  let tags: string[] = []

  // Find the first --- separator
  let firstSepLine = -1
  for (let i = headerEndLine; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      firstSepLine = i
      break
    }
    const match = lines[i].match(/^\*\*(.+?):\*\*\s*(.+)/)
    if (match) {
      const key = match[1].trim().toLowerCase()
      const val = match[2].trim()
      if (key === 'catégorie' || key === 'categorie' || key === 'category') {
        category = CATEGORY_MAP[val.toLowerCase()] || val.toLowerCase()
      } else if (key === 'slug') {
        // Strip /blog/ prefix — our routes use /actu/
        slug = val.replace(/^\/blog\//, '').replace(/^\//, '')
      } else if (key === 'meta description' || key === 'meta_description') {
        metaDescription = val
      } else if (key === 'auteur' || key === 'author') {
        author = val
      } else if (key === 'tags') {
        tags = val.split(',').map(t => t.trim()).filter(Boolean)
      }
    }
  }

  // --- Extract subtitle, hero caption from the block between first and second --- ---
  let subtitle: string | null = null
  let heroCaption: string | null = null
  let secondSepLine = -1

  if (firstSepLine !== -1) {
    for (let i = firstSepLine + 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        secondSepLine = i
        break
      }
      const match = lines[i].match(/^\*\*(.+?):\*\*\s*(.+)/)
      if (match) {
        const key = match[1].trim().toLowerCase()
        const val = match[2].trim()
        if (key === 'sous-titre' || key === 'subtitle') {
          subtitle = val
        } else if (key === 'légende' || key === 'legende' || key === 'caption') {
          heroCaption = val
        }
      }
    }
  }

  // --- Content is everything after the second --- separator ---
  const contentStart = secondSepLine !== -1 ? secondSepLine + 1 : firstSepLine !== -1 ? firstSepLine + 1 : headerEndLine
  const content = lines.slice(contentStart).join('\n').trim()

  return { title, slug, subtitle, meta_description: metaDescription, category, tags, author, hero_image_caption: heroCaption, content }
}

// ---------------------------------------------------------------------------
// 4. Seed
// ---------------------------------------------------------------------------
async function main() {
  const blogsDir = path.resolve(__dirname, '..', 'blogs')
  if (!fs.existsSync(blogsDir)) {
    console.error(`❌  blogs/ directory not found at ${blogsDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(blogsDir)
    .filter(f => f.endsWith('.md'))
    .sort()

  if (files.length === 0) {
    console.log('No .md files found in blogs/')
    process.exit(0)
  }

  console.log(`\nFound ${files.length} blog file(s):\n`)

  let success = 0
  let skipped = 0

  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogsDir, file), 'utf-8')
    const meta = parseBlogFile(raw)

    if (!meta.title || !meta.slug) {
      console.log(`  ⚠  ${file} — missing title or slug, skipping`)
      skipped++
      continue
    }

    console.log(`  📝 ${file}`)
    console.log(`     title:    ${meta.title}`)
    console.log(`     slug:     ${meta.slug}`)
    console.log(`     category: ${meta.category}`)
    console.log(`     tags:     ${meta.tags.join(', ')}`)

    const { error } = await supabase
      .from('blog_posts')
      .upsert(
        {
          title: meta.title,
          slug: meta.slug,
          subtitle: meta.subtitle,
          meta_description: meta.meta_description,
          category: meta.category,
          tags: meta.tags,
          content: meta.content,
          author: meta.author,
          hero_image_caption: meta.hero_image_caption,
          hero_image_url: null,
          status: 'published',
          published_at: new Date().toISOString(),
          featured: false,
          views: 0,
        },
        { onConflict: 'slug' }
      )

    if (error) {
      console.log(`     ❌ ERROR: ${error.message}`)
    } else {
      console.log(`     ✅ upserted`)
      success++
    }
  }

  console.log(`\nDone — ${success} upserted, ${skipped} skipped\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
