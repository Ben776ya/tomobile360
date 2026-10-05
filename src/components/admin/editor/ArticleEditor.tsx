'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import type { EditorView } from '@tiptap/pm/view'
import { AlertTriangle, Lightbulb } from 'lucide-react'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ArticleEmbed } from '@/components/blog/ArticleEmbed'
import { describeEmbedProblem, parseEmbedUrl } from '@/lib/blog/embeds'
import { normalizeArticleMarkdown } from '@/lib/editor/article-extensions'
import { articleEditorExtensions } from './editor-extensions'
import { EditorToolbar, readToolbarState, type EditorMode } from './EditorToolbar'
import { UrlDialog, type UrlCheck } from './UrlDialog'
import {
  IMAGE_ACCEPT_ATTR,
  isImageFile,
  uploadBlogImages,
  type UploadImages,
  type UploadProgress,
} from './upload'

interface ArticleEditorProps {
  /** Article body as Markdown (the stored format). */
  value: string
  onChange: (markdown: string) => void
  /** Injected in tests; defaults to the staff upload endpoint. */
  upload?: UploadImages
}

const EMPTY_EDITOR_HINT = 'Commencez à écrire votre article… (collez un lien YouTube, Instagram ou Facebook sur une ligne vide pour l’intégrer)'

function checkEmbedUrl(value: string): UrlCheck {
  if (!value.trim()) return { ok: false, tone: 'neutral', message: 'YouTube, Vimeo, Dailymotion, Facebook, Instagram ou TikTok.' }
  const info = parseEmbedUrl(value)
  if (info) return { ok: true, tone: 'success', message: `${info.label} détecté — le lecteur s’affichera dans l’article.` }
  const looksLikeUrl = /^[\w-]+\.[\w.-]+/.test(value.trim().replace(/^https?:\/\//i, ''))
  return { ok: looksLikeUrl, tone: looksLikeUrl ? 'warning' : 'error', message: describeEmbedProblem(value) ?? undefined }
}

function checkLinkUrl(value: string): UrlCheck {
  const v = value.trim()
  if (!v) return { ok: false, tone: 'neutral', message: 'Lien interne (/neuf/…, /actu/…) ou adresse complète (https://…).' }
  if (v.startsWith('/') && !v.startsWith('//')) return { ok: true, tone: 'success', message: 'Lien interne Tomobile360.' }
  if (/^(https?:\/\/|mailto:|tel:)\S+$/i.test(v)) return { ok: true, tone: 'success' }
  if (!/\s/.test(v) && /^[\w-]+\.[\w.-]+(?:\/|$)/.test(v)) return { ok: true, tone: 'warning', message: 'https:// sera ajouté automatiquement.' }
  return { ok: false, tone: 'error', message: 'Adresse invalide.' }
}

function normalizeLinkHref(value: string): string {
  const v = value.trim()
  if (v.startsWith('/') || /^(https?:|mailto:|tel:)/i.test(v)) return v
  return `https://${v}`
}

/**
 * The journalists' writing panel: a TipTap WYSIWYG editor that reads and
 * writes the article's Markdown, with galleries, URL embeds, images,
 * tables, a raw Markdown mode and a site-accurate preview.
 */
export function ArticleEditor({ value, onChange, upload = uploadBlogImages }: ArticleEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [linkOpen, setLinkOpen] = useState(false)
  const [embedOpen, setEmbedOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])

  const imageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor | null>(null)
  // Markdown most recently emitted by (or loaded into) the editor; any other
  // incoming `value` is an external change (.md import, Markdown mode, reset).
  const lastSynced = useRef(value)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const uploadRef = useRef(upload)
  uploadRef.current = upload

  const runUpload = useCallback(async (files: File[]) => {
    setUploadErrors([])
    const result = await uploadRef.current(files, setUploadProgress)
    setUploadProgress(null)
    setUploadErrors(result.errors)
    return result.urls
  }, [])

  /** Upload files, then insert one image — or a gallery for several files. */
  const insertFiles = useCallback(
    async (files: File[], options: { asGallery?: boolean; at?: number | null } = {}) => {
      const urls = await runUpload(files)
      const editor = editorRef.current
      if (!editor || editor.isDestroyed || urls.length === 0) return
      const content: JSONContent =
        options.asGallery || urls.length > 1
          ? { type: 'gallery', attrs: { layout: 'mosaic', caption: '', images: urls.map((src) => ({ src, alt: '', caption: '' })) } }
          : { type: 'image', attrs: { src: urls[0], alt: '' } }
      if (typeof options.at === 'number') {
        editor.chain().focus().insertContentAt(Math.min(options.at, editor.state.doc.content.size), content).run()
      } else {
        editor.chain().focus().insertContent(content).run()
      }
    },
    [runUpload],
  )

  // ProseMirror handlers are created once with the editor; route them through
  // a ref so they always see the latest callbacks.
  const handlers = useRef<{
    paste: (view: EditorView, event: ClipboardEvent) => boolean
    drop: (view: EditorView, event: DragEvent, moved: boolean) => boolean
  }>({ paste: () => false, drop: () => false })
  handlers.current = {
    paste: (view, event) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile)
      if (files.length > 0) {
        event.preventDefault()
        void insertFiles(files)
        return true
      }
      // A bare media URL pasted on an empty line becomes an embed block.
      const text = event.clipboardData?.getData('text/plain')?.trim() ?? ''
      const { $from, empty } = view.state.selection
      if (
        text &&
        !/\s/.test(text) &&
        empty &&
        $from.parent.type.name === 'paragraph' &&
        $from.parent.content.size === 0 &&
        parseEmbedUrl(text)
      ) {
        event.preventDefault()
        editorRef.current?.chain().focus().insertEmbed({ url: text }).run()
        return true
      }
      return false
    },
    drop: (view, event, moved) => {
      if (moved) return false
      const files = Array.from(event.dataTransfer?.files ?? [])
      if (files.length === 0) return false
      event.preventDefault()
      const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
      void insertFiles(files, { at: coords?.pos ?? null })
      return true
    },
  }

  const extensions = useMemo(
    () =>
      articleEditorExtensions({
        upload: (files, onProgress) => uploadRef.current(files, onProgress),
        onLinkShortcut: () => setLinkOpen(true),
        placeholder: EMPTY_EDITOR_HINT,
      }),
    [],
  )

  const editor = useEditor({
    extensions,
    content: value,
    contentType: 'markdown',
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: 'tm-editor-content',
        'aria-label': 'Contenu de l’article',
      },
      handlePaste: (view, event) => handlers.current.paste(view, event),
      handleDrop: (view, event, _slice, moved) => handlers.current.drop(view, event, moved),
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    onUpdate: ({ editor }) => {
      const markdown = normalizeArticleMarkdown(editor.getMarkdown())
      if (markdown === lastSynced.current) return
      lastSynced.current = markdown
      onChangeRef.current(markdown)
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // External content changes → reload the editor without echoing them back.
  useEffect(() => {
    if (!editor || editor.isDestroyed || value === lastSynced.current) return
    lastSynced.current = value
    editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
  }, [value, editor])

  // A file dropped beside the editor must not navigate away from the form.
  useEffect(() => {
    const guard = (e: DragEvent) => {
      if (e.defaultPrevented || !e.dataTransfer?.types.includes('Files')) return
      const target = e.target as HTMLElement | null
      if (target instanceof HTMLInputElement && target.type === 'file') return
      e.preventDefault()
    }
    window.addEventListener('dragover', guard)
    window.addEventListener('drop', guard)
    return () => {
      window.removeEventListener('dragover', guard)
      window.removeEventListener('drop', guard)
    }
  }, [])

  // Re-render the toolbar / word count on every transaction. (useEditorState
  // keeps a null-editor snapshot until the first transaction, which would hide
  // the formatting tools until the writer starts typing.)
  const [, refresh] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (!editor) return
    editor.on('transaction', refresh)
    refresh()
    return () => {
      editor.off('transaction', refresh)
    }
  }, [editor])
  const toolbarState = editor && !editor.isDestroyed ? readToolbarState(editor) : null
  const words: number = editor && !editor.isDestroyed ? (editor.storage.characterCount?.words() ?? 0) : 0

  const currentLinkHref = linkOpen && editor ? ((editor.getAttributes('link').href as string | undefined) ?? '') : ''

  const applyLink = (raw: string) => {
    if (!editor) return
    const href = normalizeLinkHref(raw)
    const chain = editor.chain().focus().extendMarkRange('link')
    if (editor.state.selection.empty && !editor.isActive('link')) {
      chain.insertContent({ type: 'text', text: raw.trim(), marks: [{ type: 'link', attrs: { href } }] }).run()
    } else {
      chain.setLink({ href }).run()
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-dark-700/60">
      <EditorToolbar
        editor={editor}
        state={toolbarState}
        mode={mode}
        onModeChange={setMode}
        onLink={() => setLinkOpen(true)}
        onImage={() => imageInputRef.current?.click()}
        onGallery={() => galleryInputRef.current?.click()}
        onEmbed={() => setEmbedOpen(true)}
        uploadProgress={uploadProgress}
      />

      {uploadErrors.length > 0 && (
        <div className="flex items-start gap-2 border-b border-red-500/20 bg-red-900/30 px-4 py-2 text-xs text-red-300" role="alert">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <ul className="space-y-0.5">
            {uploadErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={mode === 'visual' ? 'block' : 'hidden'}>
        <div className="min-h-[520px] bg-white px-5 py-8 sm:px-10">
          <div className="mx-auto max-w-[65ch]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {mode === 'markdown' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Écrivez votre article en Markdown..."
          aria-label="Contenu Markdown"
          spellCheck
          className="block min-h-[520px] w-full resize-y bg-dark-700/80 px-5 py-4 font-mono text-sm leading-relaxed text-white placeholder-dark-400 focus-visible:outline-none"
        />
      )}

      {mode === 'preview' && (
        <div className="min-h-[520px] bg-white px-5 py-8 sm:px-10">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="italic text-gray-400">Aucun contenu à afficher</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-lg border-t border-white/10 px-4 py-2 text-xs text-dark-300">
        <span>
          {words} mot{words > 1 ? 's' : ''} · {Math.max(1, Math.ceil(words / 200))} min de lecture
        </span>
        <span className="hidden items-center gap-1 sm:inline-flex">
          <Lightbulb className="h-3.5 w-3.5 text-secondary" />
          Glissez-déposez des photos dans le texte · plusieurs photos = galerie · Ctrl+K pour un lien
        </span>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTR}
        multiple
        className="hidden"
        aria-label="Choisir une image"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length > 0) void insertFiles(files)
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={IMAGE_ACCEPT_ATTR}
        multiple
        className="hidden"
        aria-label="Choisir les photos de la galerie"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length > 0) void insertFiles(files, { asGallery: true })
        }}
      />

      <UrlDialog
        open={embedOpen}
        onOpenChange={setEmbedOpen}
        title="Intégrer une vidéo ou une publication"
        description="Collez le lien d’une vidéo YouTube, Vimeo, Dailymotion, TikTok, ou d’une publication / reel Facebook ou Instagram."
        placeholder="https://www.youtube.com/watch?v=…"
        submitLabel="Insérer"
        check={checkEmbedUrl}
        onSubmit={(url) => editor?.chain().focus().insertEmbed({ url }).run()}
        renderPreview={(url) => (parseEmbedUrl(url) ? <ArticleEmbed url={url} className="!my-0" /> : null)}
      />
      <UrlDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        title={currentLinkHref ? 'Modifier le lien' : 'Insérer un lien'}
        description="Sélectionnez du texte avant d’insérer le lien, ou le lien sera inséré tel quel."
        placeholder="/neuf/toyota ou https://…"
        submitLabel="Appliquer"
        initialValue={currentLinkHref}
        check={checkLinkUrl}
        onSubmit={applyLink}
      />
    </div>
  )
}
