import { extractInternalLinks } from './extract-internal-links'
import { validateInternalHref } from './validate-route'
import type { ArticleForAudit, AuditResult, BrokenLinkRow } from './types'

export function auditArticles(articles: ArticleForAudit[]): AuditResult {
  const rows: BrokenLinkRow[] = []
  const hrefCounts = new Map<string, number>()

  for (const article of articles) {
    const links = extractInternalLinks(article.content)
    const seenInArticle = new Set<string>()

    for (const href of links) {
      const result = validateInternalHref(href)
      if (!result.isInternal || result.valid) continue
      if (seenInArticle.has(href)) continue
      seenInArticle.add(href)

      rows.push({
        article_slug: article.slug,
        broken_href: href,
        suggested_replacement: '',
      })
      hrefCounts.set(href, (hrefCounts.get(href) ?? 0) + 1)
    }
  }

  const topBrokenHrefs = Array.from(hrefCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([href, count]) => ({ href, count }))

  return {
    rows,
    summary: {
      totalArticlesScanned: articles.length,
      totalBrokenLinks: rows.length,
      topBrokenHrefs,
    },
  }
}
