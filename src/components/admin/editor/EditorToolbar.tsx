'use client'

import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import {
  Bold,
  Code2,
  Columns3,
  Eye,
  Images,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Minus,
  MonitorPlay,
  PenLine,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table,
  Trash2,
  Undo2,
  Unlink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadProgress } from './upload'

export type EditorMode = 'visual' | 'markdown' | 'preview'

export interface ToolbarState {
  bold: boolean
  italic: boolean
  strike: boolean
  bulletList: boolean
  orderedList: boolean
  blockquote: boolean
  link: boolean
  inTable: boolean
  block: 'p' | 'h2' | 'h3' | 'h4' | 'other'
  canUndo: boolean
  canRedo: boolean
}

export function readToolbarState(editor: Editor): ToolbarState {
  const block = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
      ? 'h3'
      : editor.isActive('heading', { level: 4 })
        ? 'h4'
        : editor.isActive('paragraph')
          ? 'p'
          : 'other'
  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    strike: editor.isActive('strike'),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    blockquote: editor.isActive('blockquote'),
    link: editor.isActive('link'),
    inTable: editor.isActive('table'),
    block,
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  }
}

function ToolButton({
  label,
  shortcut,
  onClick,
  active,
  disabled,
  children,
  wide,
}: {
  label: string
  shortcut?: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: ReactNode
  wide?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        'flex h-8 items-center justify-center gap-1.5 rounded-md text-dark-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35',
        wide ? 'px-2.5 text-xs font-medium' : 'w-8',
        active && 'bg-secondary/25 text-white',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
}

interface EditorToolbarProps {
  editor: Editor | null
  state: ToolbarState | null
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onLink: () => void
  onImage: () => void
  onGallery: () => void
  onEmbed: () => void
  uploadProgress: UploadProgress | null
}

const MODES: Array<{ value: EditorMode; label: string; icon: typeof Eye }> = [
  { value: 'visual', label: 'Éditeur', icon: PenLine },
  { value: 'markdown', label: 'Markdown', icon: Code2 },
  { value: 'preview', label: 'Aperçu', icon: Eye },
]

export function EditorToolbar({
  editor,
  state,
  mode,
  onModeChange,
  onLink,
  onImage,
  onGallery,
  onEmbed,
  uploadProgress,
}: EditorToolbarProps) {
  const chain = () => editor!.chain().focus()

  return (
    <div
      className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-white/10 bg-dark-800/95 px-2 py-1.5 backdrop-blur"
      role="toolbar"
      aria-label="Mise en forme de l’article"
    >
      {mode === 'visual' && editor && state && (
        <>
          <ToolButton label="Annuler" shortcut="Ctrl+Z" onClick={() => chain().undo().run()} disabled={!state.canUndo}>
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Rétablir" shortcut="Ctrl+Maj+Z" onClick={() => chain().redo().run()} disabled={!state.canRedo}>
            <Redo2 className="h-4 w-4" />
          </ToolButton>
          <Divider />
          <select
            value={state.block === 'other' ? 'p' : state.block}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'p') chain().setParagraph().run()
              else chain().setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run()
            }}
            aria-label="Style du paragraphe"
            className="h-8 rounded-md border border-white/10 bg-dark-700 px-2 text-xs text-dark-100 focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="p">Paragraphe</option>
            <option value="h2">Titre de section</option>
            <option value="h3">Sous-titre</option>
            <option value="h4">Petit titre</option>
          </select>
          <Divider />
          <ToolButton label="Gras" shortcut="Ctrl+B" onClick={() => chain().toggleBold().run()} active={state.bold}>
            <Bold className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Italique" shortcut="Ctrl+I" onClick={() => chain().toggleItalic().run()} active={state.italic}>
            <Italic className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Barré" onClick={() => chain().toggleStrike().run()} active={state.strike}>
            <Strikethrough className="h-4 w-4" />
          </ToolButton>
          <ToolButton label={state.link ? 'Modifier le lien' : 'Insérer un lien'} shortcut="Ctrl+K" onClick={onLink} active={state.link}>
            <Link className="h-4 w-4" />
          </ToolButton>
          {state.link && (
            <ToolButton label="Retirer le lien" onClick={() => chain().extendMarkRange('link').unsetLink().run()}>
              <Unlink className="h-4 w-4" />
            </ToolButton>
          )}
          <Divider />
          <ToolButton label="Liste à puces" onClick={() => chain().toggleBulletList().run()} active={state.bulletList}>
            <List className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Liste numérotée" onClick={() => chain().toggleOrderedList().run()} active={state.orderedList}>
            <ListOrdered className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Citation" onClick={() => chain().toggleBlockquote().run()} active={state.blockquote}>
            <Quote className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="Séparateur" onClick={() => chain().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolButton>
          <Divider />
          <ToolButton label="Image" onClick={onImage} disabled={!!uploadProgress} wide>
            <ImagePlus className="h-4 w-4" />
            <span className="hidden md:inline">Image</span>
          </ToolButton>
          <ToolButton label="Galerie photos" onClick={onGallery} disabled={!!uploadProgress} wide>
            <Images className="h-4 w-4" />
            <span className="hidden md:inline">Galerie</span>
          </ToolButton>
          <ToolButton label="Vidéo / média (YouTube, Instagram, Facebook…)" onClick={onEmbed} wide>
            <MonitorPlay className="h-4 w-4" />
            <span className="hidden md:inline">Vidéo / média</span>
          </ToolButton>
          <ToolButton
            label="Tableau"
            onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={state.inTable}
          >
            <Table className="h-4 w-4" />
          </ToolButton>
          {state.inTable && (
            <>
              <ToolButton label="Ajouter une ligne" onClick={() => chain().addRowAfter().run()}>
                <Rows3 className="h-4 w-4" />
              </ToolButton>
              <ToolButton label="Ajouter une colonne" onClick={() => chain().addColumnAfter().run()}>
                <Columns3 className="h-4 w-4" />
              </ToolButton>
              <ToolButton label="Supprimer la ligne" onClick={() => chain().deleteRow().run()} wide>
                <span>− ligne</span>
              </ToolButton>
              <ToolButton label="Supprimer la colonne" onClick={() => chain().deleteColumn().run()} wide>
                <span>− col.</span>
              </ToolButton>
              <ToolButton label="Supprimer le tableau" onClick={() => chain().deleteTable().run()}>
                <Trash2 className="h-4 w-4" />
              </ToolButton>
            </>
          )}
          {uploadProgress && (
            <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-secondary" role="status">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Téléversement {uploadProgress.done}/{uploadProgress.total}
            </span>
          )}
        </>
      )}

      <div className="ml-auto flex items-center rounded-md border border-white/10 bg-dark-700/80 p-0.5" role="tablist" aria-label="Mode d’édition">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => onModeChange(value)}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition',
              mode === value ? 'bg-secondary text-white' : 'text-dark-300 hover:text-white',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
