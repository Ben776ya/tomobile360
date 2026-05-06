/**
 * Strips broken internal links from blog_posts content in Supabase.
 * Keeps the visible link text; removes only the href.
 *   [text](/broken/path) → text
 *   <a href="/broken/path">text</a> → text
 *
 * Dry-run by default — pass --apply to write changes to Supabase.
 *
 * Usage:
 *   npm run fix:broken-links           # dry-run
 *   npm run fix:broken-links -- --apply # apply
 */

import { createClient } from '@supabase/supabase-js'
import { validateInternalHref } from './lib/validate-route'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function stripBrokenLinks(content: string): { fixed: string; stripped: string[] } {
  const stripped: string[] = []

  // Markdown links: [text](/broken) → text
  let fixed = content.replace(
    /(?<!\!)\[([^\]]*)\]\(\s*((?:[^()\s]|\([^()]*\))+)\s*\)/g,
    (match, text, href) => {
      if (href.startsWith('/') && !validateInternalHref(href).valid) {
        stripped.push(href)
        return text
      }
      return match
    }
  )

  // HTML anchors: <a href="/broken">text</a> → text
  fixed = fixed.replace(
    /<a\s[^>]*?href=["']([^"']+)["'][^>]*>((?:(?!<\/a>)[\s\S])*?)<\/a>/gi,
    (match, href, inner) => {
      if (href.startsWith('/') && !validateInternalHref(href).valid) {
        stripped.push(href)
        return inner
      }
      return match
    }
  )

  return { fixed, stripped }
}

async function run(apply: boolean) {
  if (!apply) console.log('[DRY RUN] Pass --apply to write changes.\n')

  let allArticles: Array<{ id: string; slug: string; content: string }> = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, content')
      .range(from, from + 199)
    if (error) { console.error(error.message); process.exit(1) }
    if (!data?.length) break
    allArticles = allArticles.concat(data)
    if (data.length < 200) break
    from += 200
  }

  console.log(`Fetched ${allArticles.length} articles\n`)

  let articlesChanged = 0
  let totalStripped = 0

  for (const article of allArticles) {
    if (!article.content) continue
    const { fixed, stripped } = stripBrokenLinks(article.content)
    if (stripped.length === 0) continue

    console.log(`  ${article.slug}`)
    for (const href of stripped) console.log(`    - ${href}`)
    articlesChanged++
    totalStripped += stripped.length

    if (apply) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ content: fixed })
        .eq('id', article.id)
      if (error) console.error(`    ERROR updating: ${error.message}`)
    }
  }

  const verb = apply ? 'Updated' : 'Would update'
  console.log(`\n${verb} ${articlesChanged} articles, stripped ${totalStripped} broken link(s).`)
}

run(process.argv.includes('--apply')).catch((err) => {
  console.error('Crashed:', err)
  process.exit(1)
})
