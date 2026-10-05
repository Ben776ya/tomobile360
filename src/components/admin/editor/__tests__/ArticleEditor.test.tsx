import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleEditor } from '../ArticleEditor'
import type { UploadImages } from '../upload'

const IMG = 'https://abc.supabase.co/storage/v1/object/public/blog-images/blog'

function Harness({
  initial = '',
  upload,
  onChangeSpy,
}: {
  initial?: string
  upload?: UploadImages
  onChangeSpy?: (md: string) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <ArticleEditor
        value={value}
        onChange={(md) => {
          onChangeSpy?.(md)
          setValue(md)
        }}
        upload={upload}
      />
      <output data-testid="markdown">{value}</output>
      <button type="button" onClick={() => setValue('# Importé\n\nTexte importé depuis un fichier .md')}>
        simulate-md-import
      </button>
    </>
  )
}

function file(name: string, type = 'image/webp') {
  return new File([new Uint8Array([1, 2, 3])], name, { type })
}

async function editorRoot(container: HTMLElement) {
  await waitFor(() => expect(container.querySelector('.tm-editor-content')).not.toBeNull())
  return container.querySelector('.tm-editor-content') as HTMLElement
}

describe('ArticleEditor', () => {
  it('exposes the Image, Galerie and Vidéo / média tools', async () => {
    const { container } = render(<Harness initial="Bonjour" />)
    await editorRoot(container)
    expect(await screen.findByRole('button', { name: 'Image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Galerie photos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vidéo \/ média/ })).toBeInTheDocument()
  })

  it('loads existing Markdown without reporting a change (opening an article does not dirty it)', async () => {
    const spy = vi.fn()
    const { container } = render(
      <Harness initial={`## Titre\n\nUn paragraphe **gras**.\n\n![Alt](${IMG}/a.webp "size:full|caption:Cap")`} onChangeSpy={spy} />,
    )
    const root = await editorRoot(container)
    await waitFor(() => expect(root.textContent).toContain('Un paragraphe gras.'))
    expect(root.querySelector('h2')?.textContent).toBe('Titre')
    expect(spy).not.toHaveBeenCalled()
  })

  it('uploads several files through Galerie into one :::gallery block with every URL', async () => {
    const upload = vi.fn<UploadImages>(async (files, onProgress) => {
      onProgress?.({ done: files.length, total: files.length })
      return { urls: files.map((f) => `${IMG}/${f.name}`), errors: [] }
    })
    const { container } = render(<Harness initial="Intro." upload={upload} />)
    await editorRoot(container)

    fireEvent.change(screen.getByLabelText('Choisir les photos de la galerie'), {
      target: { files: [file('1.webp'), file('2.webp'), file('3.webp')] },
    })

    await waitFor(() => expect(screen.getByTestId('markdown').textContent).toContain(':::gallery'))
    const md = screen.getByTestId('markdown').textContent!
    expect(upload).toHaveBeenCalledTimes(1)
    expect(md).toContain(':::gallery{layout="mosaic"}')
    expect(md).toContain(`![](${IMG}/1.webp)`)
    expect(md).toContain(`![](${IMG}/2.webp)`)
    expect(md).toContain(`![](${IMG}/3.webp)`)
    expect(md.match(/:::gallery/g)).toHaveLength(1)
    // The gallery block is rendered with its editing UI.
    expect(await screen.findByLabelText('Légende de la galerie')).toBeInTheDocument()
  })

  it('a single file through Image inserts a standalone image', async () => {
    const upload = vi.fn<UploadImages>(async (files) => ({ urls: files.map((f) => `${IMG}/${f.name}`), errors: [] }))
    const { container } = render(<Harness initial="Intro." upload={upload} />)
    await editorRoot(container)
    fireEvent.change(screen.getByLabelText('Choisir une image'), { target: { files: [file('solo.webp')] } })
    await waitFor(() => expect(screen.getByTestId('markdown').textContent).toContain(`![](${IMG}/solo.webp)`))
    expect(screen.getByTestId('markdown').textContent).not.toContain(':::gallery')
  })

  it('shows upload errors to the writer', async () => {
    const upload = vi.fn<UploadImages>(async () => ({ urls: [], errors: ['« big.png » : fichier trop volumineux (5 Mo max).'] }))
    const { container } = render(<Harness upload={upload} />)
    await editorRoot(container)
    fireEvent.change(screen.getByLabelText('Choisir une image'), { target: { files: [file('big.png', 'image/png')] } })
    expect(await screen.findByRole('alert')).toHaveTextContent('fichier trop volumineux')
  })

  it('inserts an ::embed block from the Vidéo / média dialog', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness initial="Intro." />)
    await editorRoot(container)

    await user.click(await screen.findByRole('button', { name: /Vidéo \/ média/ }))
    const dialog = await screen.findByRole('dialog')
    const input = within(dialog).getByRole('textbox')
    await user.type(input, 'https://www.instagram.com/reel/C8AbCdEfGh/')
    expect(within(dialog).getByRole('status')).toHaveTextContent('Instagram détecté')
    await user.click(within(dialog).getByRole('button', { name: 'Insérer' }))

    await waitFor(() =>
      expect(screen.getByTestId('markdown').textContent).toContain('::embed{url="https://www.instagram.com/reel/C8AbCdEfGh/"}'),
    )
    expect(await screen.findByLabelText('Légende de la vidéo')).toBeInTheDocument()
  })

  it('turns a media URL pasted on an empty line into an embed', async () => {
    const { container } = render(<Harness initial="" />)
    const root = await editorRoot(container)
    const paste = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: unknown }
    paste.clipboardData = {
      files: [],
      types: ['text/plain'],
      getData: (type: string) => (type === 'text/plain' ? 'https://youtu.be/dQw4w9WgXcQ' : ''),
    }
    await act(async () => {
      root.dispatchEvent(paste)
    })
    await waitFor(() =>
      expect(screen.getByTestId('markdown').textContent).toBe('::embed{url="https://youtu.be/dQw4w9WgXcQ"}'),
    )
  })

  it('shows the raw Markdown in Markdown mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness initial={'Bonjour **monde**'} />)
    await editorRoot(container)
    await user.click(screen.getByRole('tab', { name: /Markdown/ }))
    const textarea = screen.getByPlaceholderText(/markdown/i) as HTMLTextAreaElement
    expect(textarea.value).toBe('Bonjour **monde**')
  })

  it('edits in Markdown mode flow back into the visual editor', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness initial="Avant" />)
    const root = await editorRoot(container)
    await user.click(screen.getByRole('tab', { name: /Markdown/ }))
    fireEvent.change(screen.getByPlaceholderText(/markdown/i), { target: { value: '## Après\n\nNouveau texte' } })
    await user.click(screen.getByRole('tab', { name: /Éditeur/ }))
    await waitFor(() => expect(root.querySelector('h2')?.textContent).toBe('Après'))
  })

  it('reflects an external content change (the .md importer)', async () => {
    const spy = vi.fn()
    const { container } = render(<Harness initial="Ancien contenu" onChangeSpy={spy} />)
    const root = await editorRoot(container)
    fireEvent.click(screen.getByRole('button', { name: 'simulate-md-import' }))
    await waitFor(() => expect(root.textContent).toContain('Texte importé depuis un fichier .md'))
    expect(root.querySelector('h1')?.textContent).toBe('Importé')
    expect(spy).not.toHaveBeenCalled()
  })

  it('previews with the public renderer', async () => {
    const user = userEvent.setup()
    const md = ':::gallery{layout="grid"}\n![](' + IMG + '/1.webp)\n![](' + IMG + '/2.webp)\n:::'
    const { container } = render(<Harness initial={md} />)
    await editorRoot(container)
    await user.click(screen.getByRole('tab', { name: /Aperçu/ }))
    expect(container.querySelector('figure[data-gallery-layout="grid"]')).not.toBeNull()
  })
})
