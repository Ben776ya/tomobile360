'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

function isExternalUrl(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

type ImageMeta = {
  size: 'small' | 'medium' | 'large' | 'full'
  float: 'left' | 'right' | 'none'
  caption: string
}

function parseImageMeta(title?: string): ImageMeta {
  if (!title) return { size: 'full', float: 'none', caption: '' }

  // Caption may contain pipes, so extract it first (everything after "caption:")
  let caption = ''
  let rest = title
  const captionIdx = title.indexOf('caption:')
  if (captionIdx >= 0) {
    caption = title.slice(captionIdx + 'caption:'.length).trim()
    rest = title.slice(0, captionIdx).replace(/\|$/, '')
  }

  const meta: Record<string, string> = {}
  rest.split('|').forEach((part) => {
    const colonIdx = part.indexOf(':')
    if (colonIdx > 0) {
      const key = part.slice(0, colonIdx).trim()
      const val = part.slice(colonIdx + 1).trim()
      meta[key] = val
    }
  })

  return {
    size: (['small', 'medium', 'large', 'full'].includes(meta.size) ? meta.size : 'full') as ImageMeta['size'],
    float: (['left', 'right', 'none'].includes(meta.float) ? meta.float : 'none') as ImageMeta['float'],
    caption,
  }
}

const SIZE_CLASSES: Record<ImageMeta['size'], string> = {
  small: 'max-w-[200px]',
  medium: 'max-w-[340px]',
  large: 'max-w-[500px]',
  full: 'w-full',
}

const SIZE_ATTR: Record<ImageMeta['size'], string> = {
  small: '200px',
  medium: '340px',
  large: '500px',
  full: '(max-width: 768px) 100vw, 720px',
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="clear-both relative pl-5 text-2xl md:text-3xl font-bold text-primary font-display mt-10 mb-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-full before:bg-secondary">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="clear-both relative pl-5 text-xl md:text-2xl font-bold text-primary font-display mt-10 mb-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-full before:bg-secondary">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="clear-both relative pl-4 text-lg md:text-xl font-bold text-primary font-display mt-8 mb-3 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-secondary/50">
      {children}
    </h3>
  ),
  p: ({ children, node }: any) => {
    // Unwrap paragraphs containing only an image so float works with sibling text
    if (
      node &&
      node.children &&
      node.children.length === 1 &&
      node.children[0].type === 'element' &&
      (node.children[0] as { tagName?: string }).tagName === 'img'
    ) {
      return <>{children}</>
    }
    return (
      <p className="text-gray-600 leading-relaxed mb-5 text-[15px] md:text-base">
        {children}
      </p>
    )
  },
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    const external = isExternalUrl(href)
    return (
      <a
        href={href}
        className="text-secondary hover:text-secondary-600 underline underline-offset-2 decoration-secondary/30 hover:decoration-secondary transition-colors"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-lg border-l-4 border-secondary bg-secondary/5 px-5 py-4 text-gray-600 italic [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-5 space-y-1.5 text-gray-600 text-[15px] md:text-base marker:text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-gray-600 text-[15px] md:text-base marker:text-secondary">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  img: ({ src, alt, title }: any) => {
    if (!src) return null
    const meta = parseImageMeta(title)
    const caption = meta.caption || alt || ''

    if (meta.float !== 'none') {
      const floatClass = meta.float === 'left'
        ? 'sm:float-left sm:mr-5 mb-4'
        : 'sm:float-right sm:ml-5 mb-4'
      return (
        <span className={`${floatClass} ${SIZE_CLASSES[meta.size]} block sm:inline-block`}>
          <span className="relative block w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={src}
              alt={alt || ''}
              fill
              className="object-cover"
              sizes={SIZE_ATTR[meta.size]}
            />
          </span>
          {caption && (
            <span className="block text-center text-xs text-gray-400 mt-2 italic">
              {caption}
            </span>
          )}
        </span>
      )
    }

    return (
      <span className="block my-6">
        <span className={`relative block ${SIZE_CLASSES[meta.size]} ${meta.size !== 'full' ? 'mx-auto' : ''} aspect-[4/3] rounded-xl overflow-hidden bg-gray-100`}>
          <Image
            src={src}
            alt={alt || ''}
            fill
            className="object-cover"
            sizes={SIZE_ATTR[meta.size]}
          />
        </span>
        {caption && (
          <span className="block text-center text-xs text-gray-400 mt-2 italic">
            {caption}
          </span>
        )}
      </span>
    )
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-100">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-gray-600">{children}</td>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-primary/5 border border-primary/10 px-5 py-4 text-sm font-mono text-primary leading-relaxed">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-primary">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-6 [&>code]:block">{children}</pre>
  ),
  hr: () => (
    <hr className="clear-both my-8 border-t border-gray-200" />
  ),
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="mx-auto max-w-[65ch] px-1 sm:px-0 after:content-[''] after:block after:clear-both">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
