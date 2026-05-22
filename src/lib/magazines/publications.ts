import type { PublicationSlug } from '@/lib/types'

export type Publication = {
  slug: PublicationSlug
  /** Human-readable name used in headings and JSON-LD. */
  displayName: string
  /** Short italic descriptor used inline in body copy. */
  shortName: string
  /** Tagline shown under the section heading. */
  tagline: string
  /** SEO meta description for this publication's section. */
  seoDescription: string
  /** Keyword phrases included in JSON-LD `keywords` field. */
  seoKeywords: string[]
  /** Brand accent color (hex) used for kicker text + CTA. */
  accentColor: string
}

export const PUBLICATIONS: Record<PublicationSlug, Publication> = {
  'challenge-auto': {
    slug: 'challenge-auto',
    displayName: 'Challenge Auto',
    shortName: 'Challenge Auto',
    tagline: 'Le magazine de référence du marché automobile marocain — dossiers, essais, nouveautés.',
    seoDescription:
      "Tous les numéros du magazine Challenge Auto en accès libre — actualités automobiles, essais voitures, dossiers du marché marocain et tendances.",
    seoKeywords: [
      'magazine automobile Maroc',
      'Challenge Auto',
      'revue automobile marocaine',
      'actualité automobile Maroc',
      'essais voiture Maroc',
      'marché automobile marocain',
      'PDF magazine auto',
    ],
    accentColor: '#DC2626',
  },
  'vh-speciale-automobile': {
    slug: 'vh-speciale-automobile',
    displayName: 'VH Spéciale Automobile',
    shortName: 'VH Spéciale Automobile',
    tagline: "Le hors-série automobile de VH — guide d'achat, nouveautés et grands dossiers du secteur.",
    seoDescription:
      "Tous les numéros de VH Spéciale Automobile — hors-série automobile marocain en téléchargement PDF : guide d'achat, nouveautés et grands dossiers du marché.",
    seoKeywords: [
      'VH Spéciale Automobile',
      'hors-série automobile Maroc',
      'guide achat voiture Maroc',
      'magazine VH automobile',
      'salon automobile Maroc',
      'PDF magazine VH',
      'revue automobile marocaine',
    ],
    accentColor: '#0B5394',
  },
}

export const PUBLICATION_ORDER: PublicationSlug[] = [
  'challenge-auto',
  'vh-speciale-automobile',
]
