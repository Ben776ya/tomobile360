'use client'

import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Move the top-level block at `pos` one step up (-1) or down (+1). */
export function moveBlock(editor: Editor, pos: number | undefined, direction: -1 | 1): void {
  if (typeof pos !== 'number') return
  const { state } = editor
  const node = state.doc.nodeAt(pos)
  if (!node) return
  const $pos = state.doc.resolve(pos)
  const index = $pos.index()
  const parent = $pos.parent

  let tr = state.tr
  if (direction === -1) {
    if (index === 0) return
    const prev = parent.child(index - 1)
    tr = tr.delete(pos, pos + node.nodeSize).insert(pos - prev.nodeSize, node)
  } else {
    if (index >= parent.childCount - 1) return
    const next = parent.child(index + 1)
    tr = tr.delete(pos, pos + node.nodeSize).insert(pos + next.nodeSize, node)
  }
  editor.view.dispatch(tr.scrollIntoView())
}

export function BlockToolbarButton({
  onClick,
  label,
  children,
  danger,
  disabled,
}: {
  onClick: () => void
  label: string
  children: ReactNode
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40',
        danger && 'hover:bg-red-50 hover:text-red-600',
      )}
    >
      {children}
    </button>
  )
}

/**
 * Card chrome shared by the gallery and embed blocks in the editor: a header
 * with the block's identity and move / delete controls, then the body.
 */
export function BlockFrame({
  icon,
  title,
  badge,
  actions,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  badge?: ReactNode
  actions?: ReactNode
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'my-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow focus-within:border-secondary/60 focus-within:shadow-md',
        className,
      )}
      contentEditable={false}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-secondary">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{title}</span>
        {badge}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {actions}
          <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
          <BlockToolbarButton onClick={onMoveUp} label="Monter le bloc">
            <ArrowUp className="h-3.5 w-3.5" />
          </BlockToolbarButton>
          <BlockToolbarButton onClick={onMoveDown} label="Descendre le bloc">
            <ArrowDown className="h-3.5 w-3.5" />
          </BlockToolbarButton>
          <BlockToolbarButton onClick={onDelete} label="Supprimer le bloc" danger>
            <Trash2 className="h-3.5 w-3.5" />
          </BlockToolbarButton>
        </div>
      </div>
      {children}
    </div>
  )
}
