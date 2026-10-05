import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { remarkBlockDirectives } from '@/lib/blog/remark-block-directives'
import type { JSONContent } from '@tiptap/core'
import {
  articleJsonToMarkdown,
  createArticleMarkdownManager,
  markdownToArticleJson,
  normalizeArticleMarkdown,
} from '../article-extensions'
import { markdownToHastJson } from '@/lib/blog/markdown-pipeline'
import { extractContentImages, serializeEmbed, serializeGallery } from '@/lib/blog/article-blocks'

const manager = createArticleMarkdownManager()
const roundTrip = (md: string) => articleJsonToMarkdown(manager, markdownToArticleJson(manager, md))

const IMG = 'https://abc.supabase.co/storage/v1/object/public/blog-images/blog'

/** Mirrors the constructs found in the live articles. */
const LEGACY = `Le marché **automobile** marocain a progressé de *12 %* en 2025, selon l'[AIVAM](https://aivam.ma).

![Showroom à Casablanca](${IMG}/showroom.webp "size:full|caption:Les showrooms modernes au Maroc")

## Les chiffres clés

Voir aussi notre [guide hybride](/actu/guide-motorisation-hybride-electrique-maroc).

**Fiche express :**
- Batterie : +110 kWh
- Autonomie : jusqu'à **800 km**

1. Première étape
2. Deuxième étape

> « Nous ne prévoyons pas d'arrêter la Taycan à court terme. »

| Modèle | Prix à partir de |
|---|---|
| Toyota bZ4X | 459 000 DH |
| BYD Atto 3 | 339 900 DH |

![Borne](${IMG}/borne.webp "size:medium|float:left|caption:Recharge à domicile | 7 kW")

Première ligne
Deuxième ligne après un retour forcé.

---

### Conclusion

Un texte avec Note:important et un horaire 10:30 qui doivent rester tels quels.`

describe('editor Markdown — legacy content', () => {
  it('round-trips with no semantic change', () => {
    expect(markdownToHastJson(roundTrip(LEGACY))).toBe(markdownToHastJson(LEGACY))
  })

  it('is stable after one round-trip (idempotent)', () => {
    const once = roundTrip(LEGACY)
    expect(roundTrip(once)).toBe(once)
  })

  it('keeps untouched image titles byte-for-byte', () => {
    const out = roundTrip(LEGACY)
    expect(out).toContain(`(${IMG}/showroom.webp "size:full|caption:Les showrooms modernes au Maroc")`)
    expect(out).toContain('"size:medium|float:left|caption:Recharge à domicile | 7 kW"')
  })

  it('rewrites the title when the image metadata is edited', () => {
    const json = markdownToArticleJson(manager, `![Alt](${IMG}/a.webp "size:full|caption:Avant")`)
    const image = json.content!.find((n) => n.type === 'image')!
    image.attrs = { ...image.attrs, size: 'medium', float: 'right', caption: 'Après "édition"' }
    expect(articleJsonToMarkdown(manager, json)).toBe(
      `![Alt](${IMG}/a.webp "size:medium|float:right|caption:Après 'édition'")`,
    )
  })
})

const GALLERY_MD = serializeGallery({
  layout: 'grid',
  caption: 'Salon [Auto Expo] *2026*',
  images: [
    { src: `${IMG}/1.webp`, alt: 'Vue avant', caption: 'Le stand Toyota | hall 2' },
    { src: `${IMG}/2.webp`, alt: '', caption: '' },
    { src: `${IMG}/3.webp`, alt: 'Intérieur', caption: 'Cockpit numérique' },
  ],
})

const EMBED_MD = serializeEmbed({
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s',
  caption: 'Essai vidéo — "Toyota" [teaser]',
})

describe('editor Markdown — gallery and embed blocks', () => {
  it('writes the documented directive syntax', () => {
    expect(GALLERY_MD).toBe(
      [
        ':::gallery[Salon \\[Auto Expo\\] \\*2026\\*]{layout="grid"}',
        `![Vue avant](${IMG}/1.webp "caption:Le stand Toyota | hall 2")`,
        `![](${IMG}/2.webp)`,
        `![Intérieur](${IMG}/3.webp "caption:Cockpit numérique")`,
        ':::',
      ].join('\n'),
    )
    expect(EMBED_MD).toBe(
      '::embed[Essai vidéo — "Toyota" \\[teaser\\]]{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=90s"}',
    )
  })

  it('parses a gallery into one atom node with every image', () => {
    const json = markdownToArticleJson(manager, `Intro.\n\n${GALLERY_MD}\n\nSuite.`)
    const gallery = json.content!.find((n) => n.type === 'gallery') as JSONContent
    expect(gallery).toBeDefined()
    expect(gallery.attrs!.layout).toBe('grid')
    expect(gallery.attrs!.caption).toBe('Salon [Auto Expo] *2026*')
    expect(gallery.attrs!.images).toEqual([
      { src: `${IMG}/1.webp`, alt: 'Vue avant', caption: 'Le stand Toyota | hall 2' },
      { src: `${IMG}/2.webp`, alt: '', caption: '' },
      { src: `${IMG}/3.webp`, alt: 'Intérieur', caption: 'Cockpit numérique' },
    ])
  })

  it('parses an embed with its decoded url and caption', () => {
    const json = markdownToArticleJson(manager, EMBED_MD)
    const embed = json.content!.find((n) => n.type === 'embed') as JSONContent
    expect(embed.attrs).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s',
      caption: 'Essai vidéo — "Toyota" [teaser]',
    })
  })

  it('round-trips a document mixing text, gallery, embed and legacy blocks exactly', () => {
    const doc = `${LEGACY}\n\n${GALLERY_MD}\n\nTexte entre deux blocs.\n\n${EMBED_MD}\n\n## Fin`
    const once = roundTrip(doc)
    expect(once).toContain(GALLERY_MD)
    expect(once).toContain(EMBED_MD)
    expect(roundTrip(once)).toBe(once)
    expect(markdownToHastJson(once)).toBe(markdownToHastJson(doc))
  })

  it('leaves a hand-written gallery with non-image content to the regular parser (nothing dropped)', () => {
    const md = `:::gallery{layout="grid"}\nUn paragraphe libre.\n![A](${IMG}/1.webp)\n:::`
    const out = roundTrip(md)
    expect(out).toContain('Un paragraphe libre.')
    expect(out).toContain(`${IMG}/1.webp`)
  })

  it('agrees with the site directive parser on what the editor writes', () => {
    const tree = unified().use(remarkParse).use(remarkBlockDirectives).parse(`${GALLERY_MD}\n\n${EMBED_MD}`) as unknown as {
      children: Array<{ type: string; name?: string; attributes?: Record<string, string>; children: Array<{ data?: { directiveLabel?: boolean }; children?: Array<{ value?: string }> }> }>
    }
    const [gallery, embed] = tree.children
    expect(gallery.type).toBe('containerDirective')
    expect(gallery.name).toBe('gallery')
    expect(gallery.attributes).toEqual({ layout: 'grid' })
    expect(gallery.children[0].data?.directiveLabel).toBe(true)
    expect(embed.type).toBe('leafDirective')
    expect(embed.name).toBe('embed')
    expect(embed.attributes).toEqual({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s' })
  })
})

describe('storage helpers', () => {
  it('normalizeArticleMarkdown drops empty-paragraph placeholders and extra blank lines', () => {
    expect(normalizeArticleMarkdown('A\n\n&nbsp;\n\n&nbsp;\n\n\n\nB\n\n&nbsp;\n')).toBe('A\n\nB')
  })

  it('extractContentImages lists standalone and gallery images once, in order', () => {
    const images = extractContentImages(`${LEGACY}\n\n${GALLERY_MD}`)
    expect(images.map((i) => i.url)).toEqual([
      `${IMG}/showroom.webp`,
      `${IMG}/borne.webp`,
      `${IMG}/1.webp`,
      `${IMG}/2.webp`,
      `${IMG}/3.webp`,
    ])
    expect(images[1]).toMatchObject({ size: 'medium', float: 'left', caption: 'Recharge à domicile | 7 kW' })
  })
})
