import { test } from 'node:test'
import assert from 'node:assert/strict'
import { auditArticles } from '../audit-articles'
import type { ArticleForAudit } from '../types'

const sample: ArticleForAudit[] = [
  {
    id: '1',
    slug: 'jeep-compass-2026',
    title: 'Jeep Compass 2026',
    content: 'See [comparatif](/comparatifs/jeep-compass) and [techniques](/fiches-techniques/jeep-compass) and [home](/).',
  },
  {
    id: '2',
    slug: 'all-good',
    title: 'All Good',
    content: '[actu](/actu/foo) and [neuf](/neuf/dacia/sandero) — both valid.',
  },
  {
    id: '3',
    slug: 'mixed',
    title: 'Mixed',
    content: '<a href="/blog/x">old blog</a> and [external](https://example.com)',
  },
]

test('auditArticles — counts and rows', () => {
  const result = auditArticles(sample)
  assert.equal(result.summary.totalArticlesScanned, 3)
  assert.equal(result.summary.totalBrokenLinks, 3) // /comparatifs/..., /fiches-techniques/..., /blog/x

  const slugs = result.rows.map((r) => r.article_slug).sort()
  assert.deepEqual(slugs, ['jeep-compass-2026', 'jeep-compass-2026', 'mixed'])

  const hrefs = result.rows.map((r) => r.broken_href).sort()
  assert.deepEqual(hrefs, ['/blog/x', '/comparatifs/jeep-compass', '/fiches-techniques/jeep-compass'])
})

test('auditArticles — top broken hrefs by frequency', () => {
  const articles: ArticleForAudit[] = [
    { id: '1', slug: 'a', title: 'A', content: '[x](/comparatifs/a) [y](/comparatifs/a)' }, // dedupe within article
    { id: '2', slug: 'b', title: 'B', content: '[x](/comparatifs/a)' },
    { id: '3', slug: 'c', title: 'C', content: '[x](/blog/z)' },
  ]
  const result = auditArticles(articles)
  // /comparatifs/a appears in 2 articles, /blog/z in 1
  const top = result.summary.topBrokenHrefs
  assert.equal(top[0].href, '/comparatifs/a')
  assert.equal(top[0].count, 2)
  assert.equal(top[1].href, '/blog/z')
  assert.equal(top[1].count, 1)
})

test('auditArticles — empty input', () => {
  const result = auditArticles([])
  assert.equal(result.summary.totalArticlesScanned, 0)
  assert.equal(result.summary.totalBrokenLinks, 0)
  assert.deepEqual(result.rows, [])
  assert.deepEqual(result.summary.topBrokenHrefs, [])
})

test('auditArticles — suggested_replacement is blank', () => {
  const result = auditArticles(sample)
  for (const row of result.rows) {
    assert.equal(row.suggested_replacement, '')
  }
})
