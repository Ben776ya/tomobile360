import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'

interface SpecSectionProps {
  title: string
  icon: LucideIcon
  /** "text-x bg-x border-x" triplet, same convention as the category configs. */
  color: string
  /** Number of rows inside — shown as a pill so the user knows what unfolds. */
  count: number
  children: React.ReactNode
}

/**
 * One collapsible rubric of the Fiche Technique.
 *
 * Native <details>/<summary> so it works as a server component with zero JS
 * (same primitive the /neuf mobile filter uses). Closed by default; the
 * chevron rotates and the "Afficher / Masquer" hint flips via `group-open:`
 * so it is unmistakably a dropdown. ExpandAllButton toggles these by id.
 */
export function SpecSection({ title, icon: Icon, color, count, children }: SpecSectionProps) {
  const [textColor, bgColor, borderColor] = color.split(' ')

  return (
    <details className="group border border-border rounded-xl overflow-hidden bg-white">
      <summary
        // `${borderColor}` is a literal class in the category configs, so
        // Tailwind still generates it; only `group-open:border-b` toggles it.
        className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden ${bgColor} ${borderColor} border-b-0 group-open:border-b transition-colors hover:brightness-[0.98]`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgColor}`}>
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        <h4 className={`flex-1 min-w-0 text-base font-bold ${textColor}`}>{title}</h4>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 text-xs font-medium text-gray-500 shrink-0">
          {count} {count > 1 ? 'éléments' : 'élément'}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-gray-500 shrink-0">
          <span className="group-open:hidden">Afficher</span>
          <span className="hidden group-open:inline">Masquer</span>
          <ChevronDown
            aria-hidden="true"
            className="h-5 w-5 transition-transform duration-300 group-open:rotate-180"
          />
        </span>
      </summary>
      {/* display:none → block restarts the animation, so this replays on every open. */}
      <div className="divide-y divide-border animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">{children}</div>
    </details>
  )
}
