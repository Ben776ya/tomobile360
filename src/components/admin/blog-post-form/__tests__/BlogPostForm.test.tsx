import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { BlogPost } from '@/lib/types/blog'

// Mock next/navigation — useRouter is not available in unit-test env.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// The form posts to /api/admin/blog. We mock fetch globally so submit handlers
// don't hit the network.
const fetchMock = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true, post: { id: 'new-post-id' } }),
})

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

import { BlogPostForm } from '@/components/admin/BlogPostForm'

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 'post-1',
    title: 'Test article',
    slug: 'test-article',
    subtitle: null,
    meta_description: null,
    category: 'business',
    tags: null,
    content: 'Hello world content',
    hero_image_url: null,
    hero_image_caption: null,
    author: 'Rédaction Tomobile360',
    status: 'draft',
    published_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    views: 0,
    featured: false,
    ...overrides,
  }
}

describe('BlogPostForm', () => {
  it('renders title input in create mode', () => {
    render(<BlogPostForm mode="create" />)
    expect(screen.getByLabelText(/titre \*/i)).toBeInTheDocument()
  })

  it('renders defaulted title value in edit mode', () => {
    render(
      <BlogPostForm
        mode="edit"
        post={makePost({ title: 'Article édité' })}
      />,
    )
    const titleInput = screen.getByLabelText(/titre \*/i) as HTMLInputElement
    expect(titleInput.value).toBe('Article édité')
  })

  it('renders all 6 category options in the select', () => {
    render(<BlogPostForm mode="create" />)
    // The category select has no label `for`, so query by the placeholder text.
    expect(screen.getByRole('option', { name: 'Nouveautés' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Essai' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Business' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Interview' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Classic Cars' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Sport Auto' })).toBeInTheDocument()
  })

  it('auto-fills slug from title in create mode', async () => {
    const user = userEvent.setup()
    render(<BlogPostForm mode="create" />)

    const titleInput = screen.getByLabelText(/titre \*/i) as HTMLInputElement
    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement

    await user.type(titleInput, 'Mon Super Article')

    expect(slugInput.value).toBe('mon-super-article')
  })

  it('renders the rich article editor instead of the old textarea + image manager', async () => {
    render(<BlogPostForm mode="create" />)
    expect(await screen.findByRole('button', { name: 'Galerie photos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vidéo \/ média/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Éditeur/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Images du contenu')).not.toBeInTheDocument()
  })

  it('opens an existing article in the editor', async () => {
    const { container } = render(
      <BlogPostForm mode="edit" post={makePost({ content: '## Intertitre\n\nCorps de l’article.' })} />,
    )
    await vi.waitFor(() => {
      expect(container.querySelector('.tm-editor-content h2')?.textContent).toBe('Intertitre')
    })
  })

  it('calls fetch with title/content/category payload when submitting', async () => {
    const user = userEvent.setup()
    render(<BlogPostForm mode="create" />)

    const titleInput = screen.getByLabelText(/titre \*/i) as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test submit' } })

    // Now that Catégorie label is wired with htmlFor/id we can locate by label.
    const categorySelect = screen.getByLabelText(/catégorie/i) as HTMLSelectElement
    fireEvent.change(categorySelect, { target: { value: 'business' } })

    // Write the body through the editor's Markdown mode.
    await user.click(await screen.findByRole('tab', { name: /Markdown/ }))
    const contentEditor = screen.getByPlaceholderText(/markdown/i) as HTMLTextAreaElement
    fireEvent.change(contentEditor, { target: { value: 'Hello body' } })

    const publishBtn = screen.getByRole('button', { name: /publier/i })
    fireEvent.click(publishBtn)

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/blog')
    expect((init as { method: string }).method).toBe('POST')
    const body = JSON.parse((init as { body: string }).body)
    expect(body.title).toBe('Test submit')
    expect(body.content).toBe('Hello body')
    expect(body.category).toBe('business')
    expect(body.status).toBe('published')
    expect(body.inline_images).toEqual([])
  })

  it('derives inline_images from every image in the content, galleries included', async () => {
    const IMG = 'https://abc.supabase.co/storage/v1/object/public/blog-images/blog'
    const content = [
      `![Borne](${IMG}/borne.webp "size:medium|float:left|caption:Recharge")`,
      '',
      ':::gallery[Salon]{layout="grid"}',
      `![Avant](${IMG}/1.webp "caption:Vue avant")`,
      `![](${IMG}/2.webp)`,
      ':::',
      '',
      '::embed{url="https://youtu.be/dQw4w9WgXcQ"}',
    ].join('\n')
    render(<BlogPostForm mode="edit" post={makePost({ content })} />)

    fireEvent.click(screen.getByRole('button', { name: /enregistrer brouillon/i }))
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/blog/post-1')
    const body = JSON.parse((init as { body: string }).body)
    expect(body.content).toBe(content)
    expect(body.status).toBe('draft')
    expect(body.inline_images).toEqual([
      { image_url: `${IMG}/borne.webp`, alt_text: 'Borne', caption: 'Recharge', display_order: 0, size: 'medium', float_position: 'left' },
      { image_url: `${IMG}/1.webp`, alt_text: 'Avant', caption: 'Vue avant', display_order: 1, size: 'full', float_position: 'none' },
      { image_url: `${IMG}/2.webp`, alt_text: null, caption: null, display_order: 2, size: 'full', float_position: 'none' },
    ])
  })

  it('adds a tag chip and removes it', async () => {
    const user = userEvent.setup()
    render(<BlogPostForm mode="create" />)

    // Add the tag via the input + Enter key (matches the keyboard UX in
    // TagsSection.tsx — Enter is intercepted to call addTag()).
    const tagInput = screen.getByPlaceholderText(
      /ajouter un tag/i,
    ) as HTMLInputElement
    await user.type(tagInput, 'electrique{enter}')

    // The chip is rendered inside a <span> alongside an aria-labelled remove
    // button; assert the button (and therefore the chip) is in the DOM.
    const removeBtn = screen.getByRole('button', {
      name: /supprimer le tag electrique/i,
    })
    expect(removeBtn).toBeInTheDocument()

    // Click the remove control; the chip and its remove button should vanish.
    await user.click(removeBtn)
    expect(
      screen.queryByRole('button', {
        name: /supprimer le tag electrique/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('splits a pasted "#A#B#C" chunk into separate tag chips', async () => {
    const user = userEvent.setup()
    render(<BlogPostForm mode="create" />)

    const tagInput = screen.getByPlaceholderText(
      /ajouter un tag/i,
    ) as HTMLInputElement
    // Writer pastes a glued hashtag block and hits Enter.
    await user.type(
      tagInput,
      '#AFRIQUEAUTOMOBILE#ALGERIEINDUSTRIE#FASTLANE2030{enter}',
    )

    // Each hashtag becomes its own chip, not one blob.
    for (const t of ['AFRIQUEAUTOMOBILE', 'ALGERIEINDUSTRIE', 'FASTLANE2030']) {
      expect(
        screen.getByRole('button', { name: `Supprimer le tag ${t}` }),
      ).toBeInTheDocument()
    }
  })
})
