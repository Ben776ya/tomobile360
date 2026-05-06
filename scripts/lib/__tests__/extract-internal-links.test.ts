import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractInternalLinks } from '../extract-internal-links'

test('extracts markdown links', () => {
  const md = 'See [the comparatif](/comparatifs/peugeot-208) and [home](/).'
  const links = extractInternalLinks(md)
  assert.deepEqual(links.sort(), ['/', '/comparatifs/peugeot-208'])
})

test('extracts HTML anchor hrefs', () => {
  const html = '<p>Read more: <a href="/blog/post-1" class="x">here</a> and <a href=\'/actu/foo\'>foo</a>.</p>'
  const links = extractInternalLinks(html)
  assert.deepEqual(links.sort(), ['/actu/foo', '/blog/post-1'])
})

test('extracts mixed markdown and HTML', () => {
  const content = `
# Title
[md link](/neuf/dacia)
<a href="/fiches-techniques/duster">html</a>
[external](https://example.com)
`
  const links = extractInternalLinks(content)
  assert.deepEqual(links.sort(), ['/fiches-techniques/duster', '/neuf/dacia'])
})

test('ignores image syntax (markdown image)', () => {
  const md = '![alt](/images/foo.png)\n[real link](/actu/foo)'
  const links = extractInternalLinks(md)
  // image syntax starts with ! — must not be captured
  assert.deepEqual(links, ['/actu/foo'])
})

test('handles malformed markdown gracefully', () => {
  const md = '[unclosed (oops)\n[good](/actu/x)'
  const links = extractInternalLinks(md)
  assert.deepEqual(links, ['/actu/x'])
})

test('deduplicates repeated links', () => {
  const md = '[a](/actu/x) and again [b](/actu/x)'
  const links = extractInternalLinks(md)
  assert.deepEqual(links, ['/actu/x'])
})

test('returns empty for empty content', () => {
  assert.deepEqual(extractInternalLinks(''), [])
  assert.deepEqual(extractInternalLinks('plain text no links'), [])
})

test('strips surrounding whitespace inside href', () => {
  const md = '[link]( /actu/foo )'
  const links = extractInternalLinks(md)
  assert.deepEqual(links, ['/actu/foo'])
})

test('handles balanced parentheses in markdown URL', () => {
  const md = '[wiki](/en/Foo_(bar)) and [plain](/path)'
  const links = extractInternalLinks(md)
  assert.deepEqual(links.sort(), ['/en/Foo_(bar)', '/path'])
})
