import http from 'http'
import fs from 'fs'
import path from 'path'
import url from 'url'

const PORT = 3333
const vehiclesDir = path.resolve('public/vehicles')

// Serve static images from public/
function serveStatic(req, res) {
  const filePath = path.join(path.resolve('public'), decodeURIComponent(req.url))
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return }
  const ext = path.extname(filePath).toLowerCase()
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.html': 'text/html' }
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
}

// Get all brands/models/images data
function getData() {
  const brands = fs.readdirSync(vehiclesDir)
    .filter(f => fs.statSync(path.join(vehiclesDir, f)).isDirectory())
    .sort()

  const data = []
  for (const brand of brands) {
    const brandDir = path.join(vehiclesDir, brand)
    const models = fs.readdirSync(brandDir)
      .filter(f => fs.statSync(path.join(brandDir, f)).isDirectory())
      .sort()

    for (const model of models) {
      const modelDir = path.join(brandDir, model)
      const images = fs.readdirSync(modelDir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()
      if (images.length > 0) {
        data.push({ brand, model, images })
      }
    }
  }
  return { brands, data }
}

// Rename images with order prefix
function renameImages(brand, model, orderedImages) {
  const modelDir = path.join(vehiclesDir, brand, model)
  const results = []

  // Step 1: rename all to temp names to avoid collisions
  const tempMap = []
  for (let i = 0; i < orderedImages.length; i++) {
    const oldName = orderedImages[i]
    const oldPath = path.join(modelDir, oldName)
    if (!fs.existsSync(oldPath)) {
      results.push({ old: oldName, error: 'file not found' })
      continue
    }
    const tempName = `__temp_${i}_${oldName}`
    const tempPath = path.join(modelDir, tempName)
    fs.renameSync(oldPath, tempPath)
    tempMap.push({ idx: i, tempPath, tempName, origName: oldName })
  }

  // Step 2: rename from temp to final ordered names
  for (const { idx, tempPath, origName } of tempMap) {
    // Strip any existing order prefix (00-, 01-, etc.)
    const cleanName = origName.replace(/^\d{2}-/, '')
    const prefix = idx.toString().padStart(2, '0')
    const newName = `${prefix}-${cleanName}`
    const newPath = path.join(modelDir, newName)
    fs.renameSync(tempPath, newPath)
    results.push({ old: origName, new: newName })
  }

  return results
}

// Generate the HTML page
function getPage() {
  const { brands, data } = getData()

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tomobile 360 - Image Reorder Tool</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }

  .header { text-align: center; padding: 20px 0 24px; }
  .header h1 { font-size: 26px; color: #1a1a2e; margin-bottom: 6px; }
  .header p { color: #666; font-size: 13px; }
  .stats { display: flex; justify-content: center; gap: 20px; margin-top: 12px; }
  .stats span { background: #fff; padding: 6px 14px; border-radius: 8px; font-size: 12px; border: 1px solid #ddd; }

  .toolbar { position: sticky; top: 0; z-index: 100; background: #1a1a2e; border-radius: 12px; padding: 12px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .toolbar .left { display: flex; align-items: center; gap: 12px; }
  .toolbar .pending-count { color: #f59e0b; font-size: 14px; font-weight: 600; }
  .toolbar .saved-count { color: #22c55e; font-size: 14px; font-weight: 600; }
  .toolbar button { padding: 8px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-save { background: #22c55e; color: #fff; }
  .btn-save:hover { background: #16a34a; }
  .btn-save:disabled { background: #555; color: #888; cursor: not-allowed; }
  .btn-reset { background: #ef4444; color: #fff; margin-left: 8px; }
  .btn-reset:hover { background: #dc2626; }

  .instructions { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; max-width: 900px; margin-left: auto; margin-right: auto; }
  .instructions h3 { color: #92400e; margin-bottom: 6px; font-size: 14px; }
  .instructions p { color: #78350f; font-size: 12px; line-height: 1.6; }

  .toc { background: #fff; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; border: 1px solid #e5e5e5; }
  .toc h3 { margin-bottom: 8px; font-size: 13px; color: #333; }
  .toc-links { display: flex; flex-wrap: wrap; gap: 5px; }
  .toc-links a { font-size: 11px; padding: 3px 8px; background: #f3f4f6; border-radius: 6px; color: #333; text-decoration: none; }
  .toc-links a:hover { background: #d4a017; color: #fff; }

  .brand-section { margin-bottom: 36px; }
  .brand-title { font-size: 18px; color: #1a1a2e; padding: 8px 14px; background: #fff; border-radius: 10px; border-left: 4px solid #d4a017; margin-bottom: 14px; }
  .model-count { color: #999; font-weight: normal; font-size: 13px; }

  .model-card { background: #fff; border-radius: 12px; overflow: hidden; border: 2px solid #e5e5e5; margin-bottom: 16px; transition: border-color 0.3s; }
  .model-card.modified { border-color: #f59e0b; }
  .model-card.saved { border-color: #22c55e; }

  .model-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #fafafa; border-bottom: 1px solid #eee; }
  .model-header h3 { font-size: 14px; color: #1a1a2e; }
  .model-header .badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .badge-modified { background: #fef3c7; color: #92400e; }
  .badge-saved { background: #dcfce7; color: #166534; }

  .model-body { display: flex; gap: 0; }
  .thumb-preview { width: 280px; flex-shrink: 0; aspect-ratio: 16/10; overflow: hidden; background: #f0f0f0; border-right: 1px solid #eee; }
  .thumb-preview img { width: 100%; height: 100%; object-fit: cover; }

  .images-reorder { flex: 1; padding: 10px; min-height: 100px; }
  .images-reorder-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }

  .sortable-list { display: flex; flex-wrap: wrap; gap: 6px; min-height: 50px; }

  .drag-item { width: 80px; height: 55px; border-radius: 6px; overflow: hidden; cursor: grab; position: relative; border: 2px solid #e5e5e5; transition: all 0.2s; flex-shrink: 0; }
  .drag-item:active { cursor: grabbing; }
  .drag-item:hover { border-color: #d4a017; }
  .drag-item.dragging { opacity: 0.4; border-color: #3b82f6; }
  .drag-item.drag-over { border-color: #3b82f6; transform: scale(1.05); }
  .drag-item.first { border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.3); }
  .drag-item img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .drag-item .order-badge { position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.75); color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 0 0 4px 0; font-weight: 700; }
  .drag-item.first .order-badge { background: #22c55e; }
  .drag-item .filename { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; font-size: 7px; padding: 1px 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .toast { position: fixed; bottom: 30px; right: 30px; background: #1a1a2e; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; z-index: 200; display: none; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .toast.success { border-left: 4px solid #22c55e; }
  .toast.error { border-left: 4px solid #ef4444; }
</style>
</head>
<body>

<div class="header">
  <h1>Tomobile 360 — Image Reorder Tool</h1>
  <p>Drag and drop images to reorder them. The first image becomes the thumbnail.</p>
  <div class="stats">
    <span><strong>${brands.length}</strong> brands</span>
    <span><strong>${data.length}</strong> models</span>
  </div>
</div>

<div class="toolbar" id="toolbar">
  <div class="left">
    <span class="pending-count" id="pendingCount">0 pending changes</span>
    <span class="saved-count" id="savedCount"></span>
  </div>
  <div>
    <button class="btn-save" id="saveBtn" onclick="saveAll()" disabled>Save All Renames</button>
    <button class="btn-reset" onclick="resetAll()">Reset</button>
  </div>
</div>

<div class="instructions">
  <h3>How to use:</h3>
  <p>
    1. Drag images to reorder them — the <strong>first image</strong> (green border) becomes the thumbnail<br/>
    2. Modified models show an orange border. Reorder as many models as you need<br/>
    3. Click <strong>"Save All Renames"</strong> to rename all files on disk with order prefixes (00-, 01-, 02-, ...)<br/>
    4. After saving, run <code>node scripts/resync-images.mjs</code> to update the database
  </p>
</div>

<div class="toc">
  <h3>Jump to brand:</h3>
  <div class="toc-links">
    ${brands.map(b => `<a href="#brand-${b}">${b}</a>`).join(' ')}
  </div>
</div>

<div id="content">
${(() => {
  let html = ''
  let currentBrand = ''
  for (const item of data) {
    if (item.brand !== currentBrand) {
      if (currentBrand) html += '</div>' // close prev brand section
      currentBrand = item.brand
      const modelCount = data.filter(d => d.brand === item.brand).length
      html += `<div class="brand-section"><h2 class="brand-title" id="brand-${item.brand}">${item.brand.toUpperCase()} <span class="model-count">(${modelCount})</span></h2>`
    }

    const thumbSrc = `/vehicles/${item.brand}/${item.model}/${item.images[0]}`
    const imagesJson = JSON.stringify(item.images).replace(/"/g, '&quot;')

    let dragItems = ''
    for (let i = 0; i < item.images.length; i++) {
      const src = `/vehicles/${item.brand}/${item.model}/${item.images[i]}`
      dragItems += `<div class="drag-item${i === 0 ? ' first' : ''}" draggable="true" data-filename="${item.images[i]}">
        <img src="${src}" loading="lazy" />
        <span class="order-badge">${i}</span>
        <span class="filename">${item.images[i].replace(/.*?-(\d+)\.\w+$/, '$1')}</span>
      </div>`
    }

    html += `
    <div class="model-card" data-brand="${item.brand}" data-model="${item.model}" data-original='${imagesJson}'>
      <div class="model-header">
        <h3>${item.brand} / ${item.model} <small style="color:#999; font-weight:normal; font-size:11px;">(${item.images.length} imgs)</small></h3>
        <span class="badge" style="display:none;"></span>
      </div>
      <div class="model-body">
        <div class="thumb-preview">
          <img src="${thumbSrc}" />
        </div>
        <div class="images-reorder">
          <div class="images-reorder-label">Drag to reorder (first = thumbnail):</div>
          <div class="sortable-list">${dragItems}</div>
        </div>
      </div>
    </div>`
  }
  if (currentBrand) html += '</div>'
  return html
})()}
</div>

<div class="toast" id="toast"></div>

<script>
// Track pending changes: { "brand/model": ["img1.jpg", "img2.jpg", ...] }
const pendingChanges = {}
let savedCount = 0

// Drag and drop
let dragItem = null

document.addEventListener('dragstart', (e) => {
  if (!e.target.classList.contains('drag-item')) return
  dragItem = e.target
  dragItem.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
})

document.addEventListener('dragend', (e) => {
  if (!e.target.classList.contains('drag-item')) return
  e.target.classList.remove('dragging')
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  dragItem = null
})

document.addEventListener('dragover', (e) => {
  e.preventDefault()
  const target = e.target.closest('.drag-item')
  if (!target || target === dragItem) return
  if (target.parentElement !== dragItem.parentElement) return
  e.dataTransfer.dropEffect = 'move'
  target.classList.add('drag-over')
})

document.addEventListener('dragleave', (e) => {
  const target = e.target.closest('.drag-item')
  if (target) target.classList.remove('drag-over')
})

document.addEventListener('drop', (e) => {
  e.preventDefault()
  const target = e.target.closest('.drag-item')
  if (!target || target === dragItem) return
  if (target.parentElement !== dragItem.parentElement) return
  target.classList.remove('drag-over')

  const list = target.parentElement
  const items = [...list.children]
  const dragIdx = items.indexOf(dragItem)
  const targetIdx = items.indexOf(target)

  if (dragIdx < targetIdx) {
    list.insertBefore(dragItem, target.nextSibling)
  } else {
    list.insertBefore(dragItem, target)
  }

  updateCardState(list.closest('.model-card'))
})

function updateCardState(card) {
  const brand = card.dataset.brand
  const model = card.dataset.model
  const original = JSON.parse(card.dataset.original)
  const current = getCurrentOrder(card)
  const key = brand + '/' + model

  // Update order badges and first class
  const items = card.querySelectorAll('.drag-item')
  items.forEach((item, i) => {
    item.querySelector('.order-badge').textContent = i
    item.classList.toggle('first', i === 0)
  })

  // Update thumbnail preview
  if (items.length > 0) {
    const firstFilename = items[0].dataset.filename
    card.querySelector('.thumb-preview img').src = '/vehicles/' + brand + '/' + model + '/' + firstFilename
  }

  // Check if order changed
  const changed = JSON.stringify(current) !== JSON.stringify(original)
  const badge = card.querySelector('.badge')

  if (changed) {
    pendingChanges[key] = current
    card.classList.add('modified')
    card.classList.remove('saved')
    badge.textContent = 'Modified'
    badge.className = 'badge badge-modified'
    badge.style.display = ''
  } else {
    delete pendingChanges[key]
    card.classList.remove('modified')
    badge.style.display = 'none'
  }

  updateToolbar()
}

function getCurrentOrder(card) {
  return [...card.querySelectorAll('.drag-item')].map(el => el.dataset.filename)
}

function updateToolbar() {
  const count = Object.keys(pendingChanges).length
  document.getElementById('pendingCount').textContent = count + ' pending change' + (count !== 1 ? 's' : '')
  document.getElementById('saveBtn').disabled = count === 0
}

async function saveAll() {
  const btn = document.getElementById('saveBtn')
  btn.disabled = true
  btn.textContent = 'Saving...'

  const entries = Object.entries(pendingChanges)
  let success = 0
  let errors = 0

  for (const [key, images] of entries) {
    const [brand, model] = key.split('/')
    try {
      const res = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, images })
      })
      const data = await res.json()
      if (data.ok) {
        success++
        // Update card state
        const card = document.querySelector('[data-brand="' + brand + '"][data-model="' + model + '"]')
        if (card) {
          // Update original data and filenames to match new names
          const newImages = data.results.map(r => r.new || r.old)
          card.dataset.original = JSON.stringify(newImages)

          const items = card.querySelectorAll('.drag-item')
          items.forEach((item, i) => {
            if (data.results[i] && data.results[i].new) {
              item.dataset.filename = data.results[i].new
              // Update img src
              item.querySelector('img').src = '/vehicles/' + brand + '/' + model + '/' + data.results[i].new + '?t=' + Date.now()
            }
          })

          // Update thumb
          if (items.length > 0) {
            card.querySelector('.thumb-preview img').src = '/vehicles/' + brand + '/' + model + '/' + items[0].dataset.filename + '?t=' + Date.now()
          }

          card.classList.remove('modified')
          card.classList.add('saved')
          const badge = card.querySelector('.badge')
          badge.textContent = 'Saved'
          badge.className = 'badge badge-saved'
          badge.style.display = ''
        }
        delete pendingChanges[key]
      } else {
        errors++
      }
    } catch (e) {
      errors++
    }
  }

  savedCount += success
  document.getElementById('savedCount').textContent = savedCount + ' saved'
  btn.textContent = 'Save All Renames'
  updateToolbar()
  showToast(errors === 0
    ? success + ' model(s) renamed successfully!'
    : success + ' saved, ' + errors + ' failed',
    errors === 0 ? 'success' : 'error'
  )
}

function resetAll() {
  document.querySelectorAll('.model-card.modified').forEach(card => {
    const original = JSON.parse(card.dataset.original)
    const list = card.querySelector('.sortable-list')
    const items = [...list.querySelectorAll('.drag-item')]

    // Sort items back to original order
    for (const filename of original) {
      const item = items.find(el => el.dataset.filename === filename)
      if (item) list.appendChild(item)
    }

    updateCardState(card)
  })
}

function showToast(msg, type) {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.className = 'toast ' + type
  toast.style.display = 'block'
  setTimeout(() => { toast.style.display = 'none' }, 4000)
}
</script>
</body>
</html>`
}

// HTTP server
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)

  // API: rename images
  if (parsed.pathname === '/api/rename' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { brand, model, images } = JSON.parse(body)
        const results = renameImages(brand, model, images)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, results }))
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: e.message }))
      }
    })
    return
  }

  // Main page
  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(getPage())
    return
  }

  // Static files (images)
  if (parsed.pathname.startsWith('/vehicles/')) {
    serveStatic(req, res)
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`\n  Image Reorder Tool running at: http://localhost:${PORT}\n`)
  console.log(`  Open this URL in your browser to reorder images.`)
  console.log(`  Press Ctrl+C to stop the server.\n`)
})
