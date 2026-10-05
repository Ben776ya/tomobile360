'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface UrlCheck {
  /** Whether the value may be submitted. */
  ok: boolean
  tone: 'success' | 'warning' | 'error' | 'neutral'
  message?: string
}

interface UrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  placeholder: string
  submitLabel: string
  initialValue?: string
  check: (value: string) => UrlCheck
  onSubmit: (value: string) => void
  /** Extra action rendered left of the submit button (e.g. "Retirer le lien"). */
  secondaryAction?: ReactNode
  /** Live preview for the current (valid) value. */
  renderPreview?: (value: string) => ReactNode
}

const TONE: Record<UrlCheck['tone'], string> = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  error: 'text-red-600',
  neutral: 'text-gray-500',
}

export function UrlDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  submitLabel,
  initialValue = '',
  check,
  onSubmit,
  secondaryAction,
  renderPreview,
}: UrlDialogProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])

  const result = check(value)
  const submit = () => {
    if (!result.ok) return
    onSubmit(value.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={placeholder}
            aria-label={title}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-primary placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
          {result.message && (
            <p className={cn('mt-2 text-xs', TONE[result.tone])} role="status">
              {result.message}
            </p>
          )}
        </div>

        {renderPreview && result.ok && value.trim() && (
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
            {renderPreview(value.trim())}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          {secondaryAction}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={submit} disabled={!result.ok}>
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
