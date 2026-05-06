/**
 * Build-time guard. Runs the same article audit as audit-internal-links.ts,
 * but exits non-zero (failing the build) if any broken internal link is found.
 *
 * Wired into `npm run build` via package.json.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/validate-content.ts
 */

import { createClient } from '@supabase/supabase-js'
import { auditArticles } from './lib/audit-articles'
import type { ArticleForAudit } from './lib/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[validate-content] Missing Supabase env vars; skipping audit.')
  console.error('[validate-content] To enforce: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  // Soft-skip when env is unavailable (CI without secrets, local builds without .env.local).
  // This is intentional: the audit needs DB access, and we don't want to break offline builds.
  // The pre-insertion validator (Task 7) is the runtime safety net.
  process.exit(0)
}

const PAGE_SIZE = 200

async function fetchAllArticles(): Promise<ArticleForAudit[]> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!)
  const all: ArticleForAudit[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, content')
      .range(from, from + PAGE_SIZE - 1)
      .order('id', { ascending: true })
    if (error) {
      console.error('[validate-content] Supabase error:', error.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    all.push(...(data as ArticleForAudit[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return all
}

async function main() {
  const articles = await fetchAllArticles()
  const result = auditArticles(articles)

  if (result.summary.totalBrokenLinks === 0) {
    console.log(`[validate-content] OK — ${result.summary.totalArticlesScanned} articles, 0 broken internal links.`)
    process.exit(0)
  }

  console.error('')
  console.error(`[validate-content] FAIL — ${result.summary.totalBrokenLinks} broken internal link(s) across ${result.summary.totalArticlesScanned} articles.`)
  console.error('')
  console.error('First 20 broken links:')
  for (const row of result.rows.slice(0, 20)) {
    console.error(`  ${row.article_slug} -> ${row.broken_href}`)
  }
  if (result.rows.length > 20) {
    console.error(`  ... and ${result.rows.length - 20} more`)
  }
  console.error('')
  console.error('Run `npx tsx --env-file=.env.local scripts/audit-internal-links.ts` for the full CSV.')
  process.exit(1)
}

main().catch((err) => {
  console.error('[validate-content] Crashed:', err)
  process.exit(1)
})
