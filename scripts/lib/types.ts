export type ArticleForAudit = {
  id: string
  slug: string
  title: string
  content: string
}

export type BrokenLinkRow = {
  article_slug: string
  broken_href: string
  suggested_replacement: string
}

export type AuditSummary = {
  totalArticlesScanned: number
  totalBrokenLinks: number
  topBrokenHrefs: Array<{ href: string; count: number }>
}

export type AuditResult = {
  rows: BrokenLinkRow[]
  summary: AuditSummary
}
