// Convert every PNG under a directory tree to a WebP sibling at quality 82.
// Usage: node scripts/convert-png-to-webp.mjs <dir> [<dir> ...]
//
// - Skips a PNG if its WebP sibling already exists.
// - Logs source / output sizes side by side.
// - Does NOT delete the source PNGs. Delete them in a separate, deliberate
//   commit after DB references are updated.
//
// Audit reference: WAVE 2.6 of .planning/2026-05-20 audit plan.

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import sharp from 'sharp'

const QUALITY = 82
const targets = process.argv.slice(2)

if (targets.length === 0) {
  console.error('Usage: node scripts/convert-png-to-webp.mjs <dir> [<dir> ...]')
  process.exit(1)
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...walk(full))
    } else if (extname(full).toLowerCase() === '.png') {
      out.push(full)
    }
  }
  return out
}

const fmtBytes = (n) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${(n / 1024).toFixed(0)} KB`

let totalBefore = 0
let totalAfter = 0
let converted = 0
let skipped = 0

for (const dir of targets) {
  const pngs = walk(dir)
  console.log(`\n[${dir}] ${pngs.length} PNG file(s)`)
  for (const png of pngs) {
    const webp = png.replace(/\.png$/i, '.webp')
    const beforeBytes = statSync(png).size
    if (existsSync(webp)) {
      console.log(`  skip ${png} (webp exists)`)
      skipped++
      continue
    }
    await sharp(png).webp({ quality: QUALITY }).toFile(webp)
    const afterBytes = statSync(webp).size
    totalBefore += beforeBytes
    totalAfter += afterBytes
    converted++
    console.log(
      `  conv ${png}  ${fmtBytes(beforeBytes)} -> ${fmtBytes(afterBytes)}  (${Math.round(
        (1 - afterBytes / beforeBytes) * 100,
      )}% smaller)`,
    )
  }
}

console.log(
  `\nDONE — converted ${converted}, skipped ${skipped}. Total: ${fmtBytes(
    totalBefore,
  )} -> ${fmtBytes(totalAfter)} (saved ${fmtBytes(totalBefore - totalAfter)}, ${
    totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0
  }%).`,
)
