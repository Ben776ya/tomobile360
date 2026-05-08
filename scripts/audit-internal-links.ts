/**
 * Internal-link audit. Pages through every published+draft blog_posts row,
 * extracts internal links from `content`, validates against the canonical
 * route map, and writes a CSV report.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-internal-links.ts
 *
 * Outputs:
 *   scripts/output/broken-links.csv
 *   stdout summary (article count, broken link count, top 5 hrefs)
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchAllArticles } from './lib/fetch-articles'
import { auditArticles } from './lib/audit-articles'
import type { BrokenLinkRow } from './lib/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const OUT_DIR = join(PROJECT_ROOT, 'scripts', 'output')
const OUT_FILE = join(OUT_DIR, 'broken-links.csv')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  console.error('Run with: npx tsx --env-file=.env.local scripts/audit-internal-links.ts')
  process.exit(1)
}


function csvEscape(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function toCsv(rows: BrokenLinkRow[]): string {
  const header = 'article_slug,broken_href,suggested_replacement'
  const body = rows.map((r) =>
    [r.article_slug, r.broken_href, r.suggested_replacement].map(csvEscape).join(','),
  )
  return [header, ...body].join('\n') + '\n'
}

async function main() {
  const start = Date.now()
  console.log('Fetching articles from blog_posts...')
  let articles
  try {
    articles = await fetchAllArticles(SUPABASE_URL!, SUPABASE_KEY!)
  } catch (err) {
    console.error('Supabase fetch error:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
  console.log(`Fetched ${articles.length} articles in ${Date.now() - start}ms`)

  console.log('Auditing internal links...')
  const result = auditArticles(articles)

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, toCsv(result.rows), 'utf8')

  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  console.log('')
  console.log('=== Summary ===')
  console.log(`Total articles scanned: ${result.summary.totalArticlesScanned}`)
  console.log(`Total broken links:     ${result.summary.totalBrokenLinks}`)
  console.log(`Elapsed:                ${elapsed}s`)
  console.log('Top 5 broken hrefs by frequency:')
  if (result.summary.topBrokenHrefs.length === 0) {
    console.log('  (none)')
  } else {
    for (const { href, count } of result.summary.topBrokenHrefs) {
      console.log(`  ${count.toString().padStart(4)}  ${href}`)
    }
  }
  console.log('')
  console.log(`CSV written to: ${OUT_FILE}`)

  // Exit code: 0 always for the audit script. The build-time guard (Task 6)
  // is the one that fails the build; this script is for reporting.
  process.exit(0)
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
