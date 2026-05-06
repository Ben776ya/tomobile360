/**
 * Build-time guard. Runs the same article audit as audit-internal-links.ts,
 * but exits non-zero (failing the build) if any broken internal link is found.
 *
 * Wired into `npm run build` via package.json.
 *
 * NOTE (2026-05-06): On introduction, 34 existing articles contain broken
 * internal links (e.g. /comparatifs/..., /fiches-techniques/..., /blog/...).
 * `npm run build` will exit 1 until those links are fixed. Run:
 *   npm run audit:internal-links
 * for the full CSV of what needs fixing. The pre-insertion validators
 * in /api/admin/blog (POST + PUT) prevent NEW broken links from entering.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/validate-content.ts
 */

import { fetchAllArticles } from './lib/fetch-articles'
import { auditArticles } from './lib/audit-articles'

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


async function main() {
  let articles
  try {
    articles = await fetchAllArticles(SUPABASE_URL!, SUPABASE_KEY!)
  } catch (err) {
    console.error('[validate-content] Supabase error:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
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
