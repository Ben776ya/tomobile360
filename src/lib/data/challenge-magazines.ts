export type ChallengeMagazineIssue = {
  /** Stable identifier — also used as URL slug for /magazine/[id] in the future. */
  id: string
  /** Issue number (e.g. 247) — displayed as "N°247". */
  issueNumber: number
  /** Human-readable cover date in French, ALL CAPS (e.g. "MAI 2026"). */
  issueDate: string
  /** Headline dossier title (1 line). */
  dossierTitle: string
  /** Short sub-headline that complements the dossier title. */
  dossierSubtitle: string
  /** Public path to the cover image (SVG or JPG). */
  coverUrl: string
  /** Public path to the magazine PDF — currently a mock placeholder. */
  pdfUrl: string
  /** Short uppercase chips shown next to the dossier (e.g. "DOSSIER", "EXCLUSIF"). */
  tags: string[]
  /** Flag the issue currently featured as the hero on the homepage. Exactly one should be true. */
  isLatest?: boolean
}

export const CHALLENGE_MAGAZINES: ChallengeMagazineIssue[] = [
  {
    id: 'challenge-247',
    issueNumber: 247,
    issueDate: 'MAI 2026',
    dossierTitle: 'Mobilité électrique au Maroc',
    dossierSubtitle: 'Le calendrier, les marques, le réseau',
    coverUrl: '/magazines/covers/challenge-247.svg',
    pdfUrl: '/magazines/pdfs/challenge-247.pdf',
    tags: ['DOSSIER', 'EXCLUSIF', 'ACTU'],
    isLatest: true,
  },
  {
    id: 'challenge-246',
    issueNumber: 246,
    issueDate: 'AVRIL 2026',
    dossierTitle: "L'avenir du moteur thermique",
    dossierSubtitle: 'À partir du 1er juillet : ce qui change',
    coverUrl: '/magazines/covers/challenge-246.svg',
    pdfUrl: '/magazines/pdfs/challenge-246.pdf',
    tags: ['ACTU', 'NATIONAL'],
  },
  {
    id: 'challenge-245',
    issueNumber: 245,
    issueDate: 'MARS 2026',
    dossierTitle: 'Sécurité routière, le grand chantier',
    dossierSubtitle: 'En partenariat avec la NARSA',
    coverUrl: '/magazines/covers/challenge-245.svg',
    pdfUrl: '/magazines/pdfs/challenge-245.pdf',
    tags: ['EXCLUSIF', 'SÉCURITÉ'],
  },
]

/**
 * Returns the issue flagged `isLatest`. Falls back to the first issue
 * if the flag is missing on the dataset (defensive — should never happen).
 */
export function getLatestIssue(): ChallengeMagazineIssue {
  return CHALLENGE_MAGAZINES.find((m) => m.isLatest) ?? CHALLENGE_MAGAZINES[0]
}
