#!/usr/bin/env node
/**
 * One-shot upload of the 6 Challenge Auto magazine PDFs + 6 extracted cover JPGs
 * to the Supabase `magazines` storage bucket.
 *
 * Reads source PDFs from `<repo-root>/magazines/` and pre-rendered cover JPGs
 * from `<repo-root>/magazines/.upload-staging/covers/`. Both paths are outside
 * the tomobile360 Next.js project root.
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Idempotent: uses upsert: true so re-running overwrites existing objects.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// scripts/ -> tomobile360/ -> tomobil-test/  (repo workspace root)
const REPO_ROOT = resolve(__dirname, '..', '..')
const MAGAZINE_DIR = resolve(REPO_ROOT, 'magazines')
const COVER_STAGING_DIR = resolve(MAGAZINE_DIR, '.upload-staging', 'covers')

loadEnv({ path: resolve(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const ISSUES = [
  { publication: 'challenge-auto', number: 644, pdf: 'Challenge AUTO 644.pdf', coverFilename: 'challenge-auto-644.jpg' },
  { publication: 'challenge-auto', number: 1, pdf: 'CHALLENGE AUTO N°1.pdf', coverFilename: 'challenge-auto-1.jpg' },
  { publication: 'challenge-auto', number: 2, pdf: 'ChallengeAUTO N°2.pdf', coverFilename: 'challenge-auto-2.jpg' },
  { publication: 'challenge-auto', number: 3, pdf: 'PDF CHALLENGE AUTO N°3.pdf', coverFilename: 'challenge-auto-3.jpg' },
  { publication: 'challenge-auto', number: 4, pdf: 'PDF CHALLENGE AUTO N° 4.pdf', coverFilename: 'challenge-auto-4.jpg' },
  { publication: 'challenge-auto', number: 5, pdf: 'CHALLENGE AUTO N°5.pdf', coverFilename: 'challenge-auto-5.jpg' },
  { publication: 'vh-speciale-automobile', number: 87, pdf: 'VH N°87.pdf', coverFilename: 'vh-speciale-automobile-87.jpg' },
]

async function uploadOne(localPath, bucketPath, contentType) {
  const buffer = readFileSync(localPath)
  const { error } = await supabase.storage
    .from('magazines')
    .upload(bucketPath, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    })
  if (error) throw new Error(`Upload failed for ${bucketPath}: ${error.message}`)
  const { data } = supabase.storage.from('magazines').getPublicUrl(bucketPath)
  return data.publicUrl
}

async function main() {
  console.log(`Uploading ${ISSUES.length} magazines to Supabase Storage bucket "magazines"...`)
  for (const issue of ISSUES) {
    const pdfLocal = resolve(MAGAZINE_DIR, issue.pdf)
    const coverLocal = resolve(COVER_STAGING_DIR, issue.coverFilename)
    const pdfBucketPath = `pdfs/${issue.publication}-${issue.number}.pdf`
    const coverBucketPath = `covers/${issue.publication}-${issue.number}.jpg`

    console.log(`\n[${issue.publication} N°${issue.number}] uploading PDF (${issue.pdf})`)
    const pdfUrl = await uploadOne(pdfLocal, pdfBucketPath, 'application/pdf')
    console.log(`  -> ${pdfUrl}`)

    console.log(`[${issue.publication} N°${issue.number}] uploading cover`)
    const coverUrl = await uploadOne(coverLocal, coverBucketPath, 'image/jpeg')
    console.log(`  -> ${coverUrl}`)
  }
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
