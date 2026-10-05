/**
 * Client-side image upload for the article editor. Posts to the existing
 * /api/admin/blog/upload-image route (staff-only, same limits enforced
 * server-side) and returns public Supabase Storage URLs.
 */

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp'

export interface UploadProgress {
  done: number
  total: number
}

export interface UploadResult {
  /** Uploaded URLs, in the order of the accepted input files. */
  urls: string[]
  /** French, user-facing messages for rejected or failed files. */
  errors: string[]
}

export type UploadImages = (
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
) => Promise<UploadResult>

export function isImageFile(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)
}

/** Split files into uploadable ones and user-facing rejection messages. */
export function partitionImageFiles(files: File[]): { valid: File[]; errors: string[] } {
  const valid: File[] = []
  const errors: string[] = []
  for (const file of files) {
    if (!isImageFile(file)) errors.push(`« ${file.name} » : format non supporté (JPG, PNG ou WebP).`)
    else if (file.size > MAX_IMAGE_BYTES) errors.push(`« ${file.name} » : fichier trop volumineux (5 Mo max).`)
    else valid.push(file)
  }
  return { valid, errors }
}

export async function uploadBlogImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/admin/blog/upload-image', { method: 'POST', body: formData })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || 'Échec du téléversement')
  }
  const { url } = await res.json()
  if (typeof url !== 'string' || !url) throw new Error('Réponse du serveur invalide')
  return url
}

/** Upload several images (3 at a time), preserving input order in the result. */
export const uploadBlogImages: UploadImages = async (files, onProgress) => {
  const { valid, errors } = partitionImageFiles(files)
  const results: Array<string | null> = new Array(valid.length).fill(null)
  let done = 0
  onProgress?.({ done, total: valid.length })

  let next = 0
  const worker = async () => {
    while (next < valid.length) {
      const index = next++
      const file = valid[index]
      try {
        results[index] = await uploadBlogImage(file)
      } catch (err) {
        errors.push(`« ${file.name} » : ${err instanceof Error ? err.message : 'erreur inconnue'}`)
      }
      done += 1
      onProgress?.({ done, total: valid.length })
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, valid.length) }, worker))

  return { urls: results.filter((u): u is string => !!u), errors }
}
