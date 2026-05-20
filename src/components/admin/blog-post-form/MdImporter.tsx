'use client'

import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { FileUp } from 'lucide-react'
import { parseMarkdownFile } from '@/lib/parseMarkdownFile'
import type { BlogPostFormValues } from './types'
import { slugify } from './form-helpers'

interface MdImporterProps {
  mode: 'create' | 'edit'
}

/**
 * Hidden-input + label-button pair that imports a `.md` file with YAML
 * frontmatter and writes its parsed body + metadata into the surrounding
 * react-hook-form context. Extracted from ContentSection so that file
 * can stay focused on the editor / preview / inline-image trio.
 */
export function MdImporter({ mode }: MdImporterProps) {
  const { setValue } = useFormContext<BlogPostFormValues>()
  const mdFileRef = useRef<HTMLInputElement>(null)

  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const parsed = parseMarkdownFile(text)
      setValue('content', parsed.content)

      // Auto-fill metadata from frontmatter
      const m = parsed.metadata
      if (m.title) {
        setValue('title', m.title)
        if (mode === 'create') {
          setValue('slug', m.slug || slugify(m.title))
        }
      }
      if (m.slug && mode === 'create') setValue('slug', m.slug)
      if (m.subtitle) setValue('subtitle', m.subtitle)
      if (m.meta_description) setValue('meta_description', m.meta_description)
      if (m.category) setValue('category', m.category)
      if (m.tags && m.tags.length > 0) setValue('tags', m.tags)
      if (m.author) setValue('author', m.author)
    }
    reader.readAsText(file)
  }

  return (
    <label className="cursor-pointer">
      <input
        ref={mdFileRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleMdUpload}
        className="hidden"
      />
      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-dark-700/80 text-sm text-dark-100 hover:bg-dark-600/50 transition cursor-pointer">
        <FileUp className="h-4 w-4" />
        Importer .md
      </span>
    </label>
  )
}
