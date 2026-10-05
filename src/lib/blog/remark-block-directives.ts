/**
 * remark plugin enabling only the *block* forms of the generic directives
 * syntax — `::leaf[label]{attrs}` and `:::container … :::` at the start of a
 * line. Unlike `remark-directive`, the inline `:name` form is not registered:
 * article prose is full of "6:49.337", "10h30:", "Note:…", and inline
 * directives would swallow part of that text (even inside image alt text).
 */

import type { Processor } from 'unified'
import { directive } from 'micromark-extension-directive'
import { directiveFromMarkdown } from 'mdast-util-directive'

export function remarkBlockDirectives(this: Processor) {
  const data = this.data()
  const { flow } = directive()
  ;(data.micromarkExtensions ??= []).push({ flow })
  ;(data.fromMarkdownExtensions ??= []).push(directiveFromMarkdown())
}
