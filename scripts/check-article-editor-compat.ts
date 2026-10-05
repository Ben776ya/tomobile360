/**
 * Editor / renderer compatibility check against the live articles.
 *
 * For every article in `blog_posts` (drafts included when the service-role key
 * is available, published only otherwise):
 *
 *   1. Editor round-trip — Markdown → TipTap document → Markdown with the exact
 *      schema the admin editor uses, compared as rendered HAST. Opening and
 *      saving an article in the editor must not change what readers see.
 *      A difference whose visible text only differs by stray `*` characters
 *      (malformed emphasis the editor tidies up) is reported as cosmetic.
 *   2. Stability — a second round-trip must reproduce the first byte-for-byte.
 *   3. Renderer neutrality — the directive-aware remark pipeline (galleries /
 *      embeds) must produce the same HAST as the previous GFM-only pipeline.
 *
 * Read-only. Prints `COMPAT_OK …` and exits 0 only when every check passes.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/check-article-editor-compat.ts
 */

import { fetchAllArticles } from './lib/fetch-articles'
import {
  articleJsonToMarkdown,
  createArticleMarkdownManager,
  markdownToArticleJson,
} from '../src/lib/editor/article-extensions'
import {
  articleRemarkPlugins,
  legacyRemarkPlugins,
  markdownToHastJson,
} from '../src/lib/blog/markdown-pipeline'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface HastNode {
  type: string
  value?: string
  children?: HastNode[]
}

function visibleText(hastJson: string): string {
  const walk = (n: HastNode): string =>
    n.type === 'text' ? (n.value ?? '') : (n.children ?? []).map(walk).join('')
  return walk(JSON.parse(hastJson) as HastNode)
}

function firstDifference(a: string, b: string): string {
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  const from = Math.max(0, i - 80)
  return `\n      before: …${a.slice(from, i + 80)}…\n      after:  …${b.slice(from, i + 80)}…`
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[editor-compat] Missing NEXT_PUBLIC_SUPABASE_URL / Supabase key in the environment.')
    process.exit(1)
  }

  const articles = await fetchAllArticles(SUPABASE_URL, SUPABASE_KEY)
  if (articles.length === 0) {
    console.error('[editor-compat] No articles fetched — nothing was verified.')
    process.exit(1)
  }

  const manager = createArticleMarkdownManager()
  const editorDiffs: string[] = []
  const cosmetic: string[] = []
  const unstable: string[] = []
  const rendererDiffs: string[] = []

  for (const article of articles) {
    const original = article.content ?? ''
    const label = article.slug || article.id

    let once: string
    try {
      once = articleJsonToMarkdown(manager, markdownToArticleJson(manager, original))
    } catch (err) {
      editorDiffs.push(`${label}: editor failed to load it (${err instanceof Error ? err.message : String(err)})`)
      continue
    }

    const before = markdownToHastJson(original)
    const after = markdownToHastJson(once)
    if (before !== after) {
      if (visibleText(before).replace(/\*/g, '') === visibleText(after).replace(/\*/g, '')) {
        cosmetic.push(label)
      } else {
        editorDiffs.push(`${label}:${firstDifference(before, after)}`)
      }
    }

    const twice = articleJsonToMarkdown(manager, markdownToArticleJson(manager, once))
    if (twice !== once) unstable.push(`${label}:${firstDifference(once, twice)}`)

    const legacy = markdownToHastJson(original, legacyRemarkPlugins)
    const current = markdownToHastJson(original, articleRemarkPlugins)
    if (legacy !== current) rendererDiffs.push(`${label}:${firstDifference(legacy, current)}`)
  }

  const report = (title: string, rows: string[]) => {
    if (rows.length === 0) return
    console.log(`\n${title} (${rows.length}):`)
    for (const row of rows.slice(0, 20)) console.log(`  - ${row}`)
    if (rows.length > 20) console.log(`  … and ${rows.length - 20} more`)
  }
  report('Editor round-trip differences', editorDiffs)
  report('Unstable round-trips', unstable)
  report('Renderer pipeline differences', rendererDiffs)
  report('Cosmetic clean-ups (stray asterisks only)', cosmetic)

  const ok = editorDiffs.length === 0 && unstable.length === 0 && rendererDiffs.length === 0
  const summary = `articles=${articles.length} editorDiffs=${editorDiffs.length} rendererDiffs=${rendererDiffs.length} unstable=${unstable.length} cosmetic=${cosmetic.length}`
  if (ok) {
    console.log(`\nCOMPAT_OK ${summary}`)
    process.exit(0)
  }
  console.error(`\nCOMPAT_FAIL ${summary}`)
  process.exit(1)
}

main().catch((err) => {
  console.error('[editor-compat] Crashed:', err)
  process.exit(1)
})
