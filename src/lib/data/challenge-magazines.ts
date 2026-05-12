export type ChallengeMagazineIssue = {
  /** Stable identifier — also used as URL slug for /magazine/[id] in the future. */
  id: string
  /** Issue number (e.g. 5) — displayed as "N°5". */
  issueNumber: number
  /** Human-readable cover date in French (e.g. "Avril / Mai 2026"). */
  issueDate: string
  /** Headline dossier title (1 line). */
  dossierTitle: string
  /** Short sub-headline that complements the dossier title. */
  dossierSubtitle: string
  /** Public path to the cover image (rendered first page of the PDF). */
  coverUrl: string
  /** Public path to the magazine PDF. */
  pdfUrl: string
  /** Short uppercase chips associated with the issue (rubrics from the masthead). */
  tags: string[]
  /** Flag the issue currently featured as the hero on the homepage. Exactly one should be true. */
  isLatest?: boolean
}

export const CHALLENGE_MAGAZINES: ChallengeMagazineIssue[] = [
  {
    id: 'challenge-auto-5',
    issueNumber: 5,
    issueDate: 'Avril / Mai 2026',
    dossierTitle: 'Ces nouveautés qui vont marquer 2026',
    dossierSubtitle: 'Hybrides & électriques : bien choisir sa motorisation',
    coverUrl: '/magazines/covers/challenge-auto-5.jpg',
    pdfUrl: '/magazines/pdfs/challenge-auto-5.pdf',
    tags: ['ACTU', 'TENDANCES', 'ESSAIS'],
    isLatest: true,
  },
]

/**
 * Returns the issue flagged `isLatest`. Falls back to the first issue
 * if the flag is missing on the dataset (defensive — should never happen).
 */
export function getLatestIssue(): ChallengeMagazineIssue {
  return CHALLENGE_MAGAZINES.find((m) => m.isLatest) ?? CHALLENGE_MAGAZINES[0]
}
