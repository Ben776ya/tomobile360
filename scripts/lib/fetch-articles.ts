import { createClient } from '@supabase/supabase-js'
import type { ArticleForAudit } from './types'

const PAGE_SIZE = 200

/**
 * Pages through `blog_posts` and returns every row as an `ArticleForAudit`.
 * Throws on Supabase error so callers can decide how to surface it.
 */
export async function fetchAllArticles(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ArticleForAudit[]> {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const all: ArticleForAudit[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, content')
      .range(from, from + PAGE_SIZE - 1)
      .order('id', { ascending: true })

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    all.push(...(data as ArticleForAudit[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return all
}
