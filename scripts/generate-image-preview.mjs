import fs from 'fs'
import path from 'path'

const vehiclesDir = path.resolve('public/vehicles')

function generatePreview() {
  const brands = fs.readdirSync(vehiclesDir)
    .filter(f => fs.statSync(path.join(vehiclesDir, f)).isDirectory())
    .sort()

  let totalModels = 0
  let brandSections = ''

  for (const brand of brands) {
    const brandDir = path.join(vehiclesDir, brand)
    const models = fs.readdirSync(brandDir)
      .filter(f => fs.statSync(path.join(brandDir, f)).isDirectory())
      .sort()

    if (models.length === 0) continue

    let modelCards = ''

    for (const model of models) {
      const modelDir = path.join(brandDir, model)
      const images = fs.readdirSync(modelDir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()

      if (images.length === 0) continue

      totalModels++
      const thumbSrc = `/vehicles/${brand}/${model}/${images[0]}`
      const folderPath = `public/vehicles/${brand}/${model}/`

      // Build image strip
      let stripHtml = ''
      for (let i = 0; i < images.length; i++) {
        const imgSrc = `/vehicles/${brand}/${model}/${images[i]}`
        const isCurrent = i === 0
        stripHtml += `<div class="strip-img${isCurrent ? ' current' : ''}" onclick="selectThumb(this, '${brand}', '${model}', '${images[i]}')">
          <img src="${imgSrc}" alt="${images[i]}" loading="lazy" />
          <span class="img-num">${images[i].replace(/.*-(\d+)\.\w+$/, '$1')}</span>
        </div>`
      }

      modelCards += `
      <div class="model-card" id="${brand}-${model}">
        <div class="thumb-container">
          <img class="thumb" src="${thumbSrc}" alt="${brand} ${model}" loading="lazy" />
        </div>
        <div class="model-info">
          <h3>${brand} / ${model}</h3>
          <p class="folder-path">${folderPath}</p>
          <p class="img-count">${images.length} images · Thumbnail: <code>${images[0]}</code></p>
        </div>
        <div class="strip">${stripHtml}</div>
      </div>`
    }

    brandSections += `
    <div class="brand-section">
      <h2 class="brand-title" id="brand-${brand}">${brand.toUpperCase()} <span class="model-count">(${models.length})</span></h2>
      <div class="models-grid">${modelCards}</div>
    </div>`
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tomobile 360 - Image Thumbnail Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }

  .header { text-align: center; padding: 20px 0 30px; }
  .header h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 8px; }
  .header p { color: #666; font-size: 14px; }
  .stats { display: flex; justify-content: center; gap: 30px; margin-top: 15px; }
  .stats span { background: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; border: 1px solid #ddd; }

  .instructions { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px 20px; margin-bottom: 30px; max-width: 900px; margin-left: auto; margin-right: auto; }
  .instructions h3 { color: #92400e; margin-bottom: 8px; font-size: 15px; }
  .instructions p { color: #78350f; font-size: 13px; line-height: 1.6; }
  .instructions code { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

  .brand-section { margin-bottom: 40px; }
  .brand-title { font-size: 20px; color: #1a1a2e; padding: 10px 16px; background: #fff; border-radius: 10px; border-left: 4px solid #d4a017; margin-bottom: 16px; }
  .model-count { color: #999; font-weight: normal; font-size: 14px; }

  .models-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }

  .model-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5; transition: box-shadow 0.2s; }
  .model-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .model-card.done { border-color: #22c55e; background: #f0fdf4; }

  .thumb-container { aspect-ratio: 16/10; overflow: hidden; background: #f0f0f0; }
  .thumb { width: 100%; height: 100%; object-fit: cover; }

  .model-info { padding: 10px 14px 6px; }
  .model-info h3 { font-size: 14px; color: #1a1a2e; }
  .folder-path { font-size: 11px; color: #999; font-family: monospace; margin-top: 2px; }
  .img-count { font-size: 11px; color: #666; margin-top: 2px; }
  .img-count code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 10px; }

  .strip { display: flex; gap: 4px; padding: 8px 10px 10px; overflow-x: auto; }
  .strip::-webkit-scrollbar { height: 6px; }
  .strip::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

  .strip-img { flex-shrink: 0; width: 60px; height: 40px; border-radius: 4px; overflow: hidden; cursor: pointer; position: relative; border: 2px solid transparent; transition: border-color 0.2s; }
  .strip-img:hover { border-color: #d4a017; }
  .strip-img.current { border-color: #22c55e; }
  .strip-img.selected { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.3); }
  .strip-img img { width: 100%; height: 100%; object-fit: cover; }
  .img-num { position: absolute; bottom: 0; right: 0; background: rgba(0,0,0,0.7); color: #fff; font-size: 8px; padding: 1px 3px; border-radius: 2px 0 0 0; }

  .toc { background: #fff; border-radius: 12px; padding: 16px 20px; margin-bottom: 30px; border: 1px solid #e5e5e5; }
  .toc h3 { margin-bottom: 10px; font-size: 14px; color: #333; }
  .toc-links { display: flex; flex-wrap: wrap; gap: 6px; }
  .toc-links a { font-size: 12px; padding: 4px 10px; background: #f3f4f6; border-radius: 6px; color: #333; text-decoration: none; }
  .toc-links a:hover { background: #d4a017; color: #fff; }
</style>
</head>
<body>
<div class="header">
  <h1>Tomobile 360 — Thumbnail Preview</h1>
  <p>Review all vehicle thumbnails. The green-bordered image in each strip is the current thumbnail (first alphabetically).</p>
  <div class="stats">
    <span><strong>${brands.length}</strong> brands</span>
    <span><strong>${totalModels}</strong> models</span>
  </div>
</div>

<div class="instructions">
  <h3>How to fix a bad thumbnail:</h3>
  <p>
    1. Find the model card below where the thumbnail is wrong (shows interior/dashboard/trunk instead of full exterior)<br/>
    2. Open the folder shown under the image (e.g., <code>public/vehicles/audi/a3-berline/</code>)<br/>
    3. Rename the best exterior image by adding <code>00-</code> prefix (e.g., <code>AUDI-A3-07.jpg</code> → <code>00-AUDI-A3-07.jpg</code>)<br/>
    4. After renaming all needed images, run: <code>node scripts/resync-images.mjs</code>
  </p>
</div>

<div class="toc">
  <h3>Jump to brand:</h3>
  <div class="toc-links">
    ${brands.map(b => `<a href="#brand-${b}">${b}</a>`).join('\n    ')}
  </div>
</div>

${brandSections}

<script>
function selectThumb(el, brand, model, filename) {
  // Visual feedback only - highlight the clicked image
  const card = el.closest('.model-card')
  card.querySelectorAll('.strip-img').forEach(s => s.classList.remove('selected'))
  el.classList.add('selected')

  // Update the main thumbnail preview
  const thumb = card.querySelector('.thumb')
  thumb.src = '/vehicles/' + brand + '/' + model + '/' + filename

  // Update the filename display
  const codeEl = card.querySelector('.img-count code')
  if (codeEl) codeEl.textContent = filename
}
</script>
</body>
</html>`

  const outPath = path.resolve('public/image-preview.html')
  fs.writeFileSync(outPath, html)
  console.log(`Generated preview: ${outPath}`)
  console.log(`${brands.length} brands, ${totalModels} models`)
}

generatePreview()
