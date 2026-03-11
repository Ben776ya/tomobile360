'use client'

import { Fragment } from 'react'

interface LinkifyTextProps {
  text: string
  className?: string
  linkClassName?: string
}

/**
 * Component that detects URLs in text and converts them to clickable links
 */
export function LinkifyText({
  text,
  className = '',
  linkClassName = 'text-accent hover:text-secondary hover:underline transition-colors duration-300',
}: LinkifyTextProps) {
  if (!text) return null

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g

  // Split text by URLs and create array of text and links
  const parts = text.split(urlRegex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (urlRegex.test(part)) {
          // Reset regex lastIndex for next test
          urlRegex.lastIndex = 0
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        // Reset regex lastIndex
        urlRegex.lastIndex = 0
        return <Fragment key={index}>{part}</Fragment>
      })}
    </span>
  )
}
