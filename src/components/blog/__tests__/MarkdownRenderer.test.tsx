import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { serializeEmbed, serializeGallery, type GalleryLayout } from '@/lib/blog/article-blocks'

const IMG = 'https://abc.supabase.co/storage/v1/object/public/blog-images/blog'

function gallery(layout: GalleryLayout, count: number, caption = 'Salon Auto Expo 2026') {
  return serializeGallery({
    layout,
    caption,
    images: Array.from({ length: count }, (_, i) => ({
      src: `${IMG}/${i + 1}.webp`,
      alt: `Photo alt ${i + 1}`,
      caption: `Légende ${i + 1}`,
    })),
  })
}

/** next/image may rewrite src through its loader; compare on the decoded value. */
function srcOf(el: Element): string {
  return decodeURIComponent(el.getAttribute('src') ?? '')
}

describe('MarkdownRenderer — galleries', () => {
  it.each(['mosaic', 'grid', 'carousel'] as const)('renders a %s gallery with every image and the caption', (layout) => {
    const { container } = render(<MarkdownRenderer content={`Intro.\n\n${gallery(layout, 4)}\n\nSuite.`} />)
    const figure = container.querySelector(`figure[data-gallery-layout="${layout}"]`)
    expect(figure).not.toBeNull()
    const imgs = figure!.querySelectorAll('img')
    expect(imgs).toHaveLength(4)
    imgs.forEach((img, i) => expect(srcOf(img)).toContain(`${IMG}/${i + 1}.webp`))
    expect(figure!.querySelector('figcaption')!.textContent).toContain('Salon Auto Expo 2026')
    expect(figure!.querySelector('figcaption')!.textContent).toContain('4 photos')
    // Text around the block still renders as paragraphs.
    expect(screen.getByText('Intro.')).toBeInTheDocument()
    expect(screen.getByText('Suite.')).toBeInTheDocument()
  })

  it('mosaic shows five tiles and a "+N" overflow tile for larger galleries', () => {
    const { container } = render(<MarkdownRenderer content={gallery('mosaic', 8)} />)
    const figure = container.querySelector('figure[data-gallery-layout="mosaic"]')!
    expect(figure.querySelectorAll('img')).toHaveLength(5)
    expect(within(figure as HTMLElement).getByText('+3')).toBeInTheDocument()
    expect(figure.querySelector('figcaption')!.textContent).toContain('8 photos')
  })

  it('carousel shows each photo caption under its slide', () => {
    render(<MarkdownRenderer content={gallery('carousel', 3)} />)
    expect(screen.getByText('Légende 1')).toBeInTheDocument()
    expect(screen.getByText('Légende 3')).toBeInTheDocument()
  })

  it('opens a lightbox on click and navigates with the keyboard', async () => {
    render(<MarkdownRenderer content={gallery('grid', 3)} />)
    fireEvent.click(screen.getByRole('button', { name: /Agrandir la photo 2/ }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('2 / 3')).toBeInTheDocument()
    expect(within(dialog).getByText('Légende 2')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Photo précédente' }))
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
  })
})

describe('MarkdownRenderer — embeds', () => {
  it('renders YouTube as a click-to-load facade, then the privacy-enhanced player', () => {
    const { container } = render(
      <MarkdownRenderer content={serializeEmbed({ url: 'https://youtu.be/dQw4w9WgXcQ', caption: 'Essai du Toyota bZ4X' })} />,
    )
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText('Essai du Toyota bZ4X')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Lire la vidéo : Essai du Toyota bZ4X/ }))
    const iframe = container.querySelector('iframe')!
    expect(iframe.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1')
  })

  it.each([
    ['https://www.instagram.com/reel/C8AbCdEfGh/', 'https://www.instagram.com/reel/C8AbCdEfGh/embed/', 'instagram'],
    ['https://www.facebook.com/watch/?v=1234567890', 'https://www.facebook.com/plugins/video.php?href=', 'facebook'],
    ['https://www.tiktok.com/@a/video/7312345678901234567', 'https://www.tiktok.com/player/v1/7312345678901234567', 'tiktok'],
    ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871', 'vimeo'],
    ['https://dai.ly/x8abcd1', 'https://www.dailymotion.com/embed/video/x8abcd1', 'dailymotion'],
  ])('renders %s as an iframe player', (url, srcPrefix, provider) => {
    const { container } = render(<MarkdownRenderer content={serializeEmbed({ url })} />)
    const figure = container.querySelector(`figure[data-embed-provider="${provider}"]`)
    expect(figure).not.toBeNull()
    const iframe = figure!.querySelector('iframe')!
    expect(iframe.getAttribute('src')!.startsWith(srcPrefix)).toBe(true)
    expect(iframe.getAttribute('loading')).toBe('lazy')
  })

  it('degrades an unsupported URL to a plain link card, without an iframe', () => {
    const { container } = render(
      <MarkdownRenderer content={serializeEmbed({ url: 'https://www.example.com/article', caption: 'Lire sur Example' })} />,
    )
    expect(container.querySelector('iframe')).toBeNull()
    const link = screen.getByRole('link', { name: /Lire sur Example/ })
    expect(link.getAttribute('href')).toBe('https://www.example.com/article')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('never frames or links a hostile URL', () => {
    const md = [
      '::embed{url="javascript:alert(1)"}',
      '',
      '::embed{url="https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"}',
      '',
      '<iframe src="https://evil.example/x"></iframe>',
    ].join('\n')
    const { container } = render(<MarkdownRenderer content={md} />)
    const iframes = Array.from(container.querySelectorAll('iframe'))
    expect(iframes).toHaveLength(0)
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '')
    expect(hrefs.some((h) => h.startsWith('javascript:'))).toBe(false)
  })
})

describe('MarkdownRenderer — legacy content is unchanged', () => {
  it('keeps prose with colons and stray directive-like lines literal', () => {
    const { container } = render(
      <MarkdownRenderer content={'Un texte avec Note:important et 10:30.\n\n::note quelque chose\n\n:::\n\nFin.'} />,
    )
    expect(container.textContent).toContain('Un texte avec Note:important et 10:30.')
    expect(container.textContent).toContain('::note quelque chose')
    expect(container.textContent).toContain('Fin.')
  })

  it('keeps colon-separated figures intact in text, bold and image alt text', () => {
    const { container } = render(
      <MarkdownRenderer
        content={`Record en **6:49.337** puis 6:40.835.\n\n![Record au Nürburgring en 6:40.835](${IMG}/ford.webp "size:full|caption:")`}
      />,
    )
    expect(container.querySelector('strong')!.textContent).toBe('6:49.337')
    expect(container.textContent).toContain('puis 6:40.835.')
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('Record au Nürburgring en 6:40.835')
  })

  it('still renders single images with their size/float/caption metadata', () => {
    const { container } = render(
      <MarkdownRenderer content={`![Borne](${IMG}/borne.webp "size:medium|float:left|caption:Recharge à domicile")`} />,
    )
    const img = container.querySelector('img')!
    expect(srcOf(img)).toContain(`${IMG}/borne.webp`)
    expect(container.textContent).toContain('Recharge à domicile')
    expect(container.querySelector('.sm\\:float-left')).not.toBeNull()
  })
})
