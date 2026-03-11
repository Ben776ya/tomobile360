import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-') // dedupe dashes
    .replace(/^-|-$/g, '') // trim dashes
    .substring(0, 200) // limit length
}

// Find matching image file for an article title
function findImage(title, imagesDir) {
  const files = fs.readdirSync(imagesDir)
  // Try exact match first (with different extensions)
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    const exact = title + ext
    if (files.includes(exact)) return exact
  }
  // Try case-insensitive partial match
  const titleLower = title.toLowerCase()
  for (const f of files) {
    const nameNoExt = f.replace(/\.(jpg|jpeg|png|webp)$/i, '')
    if (nameNoExt.toLowerCase() === titleLower) return f
  }
  return null
}

// Map tags to a category
function deriveCategory(tags, title) {
  const allText = (tags || []).join(' ').toLowerCase() + ' ' + title.toLowerCase()
  if (allText.includes('maroc') || allText.includes('morocco') || allText.includes('casablanca') || allText.includes('rabat')) return 'Morocco'
  if (allText.includes('essai') || allText.includes('test') || allText.includes('review')) return 'Review'
  if (allText.includes('marché') || allText.includes('vente') || allText.includes('chiffre') || allText.includes('classement')) return 'Market'
  if (allText.includes('international') || allText.includes('mondial') || allText.includes('europe')) return 'International'
  return 'News'
}

async function importArticles() {
  const articlesDir = path.resolve('challenge_articles')
  const imagesDir = path.resolve('public/articles')

  // 1. Delete existing articles
  console.log('Deleting existing articles...')
  const { error: delError } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Delete:', delError ? delError.message : 'OK')

  // 2. Read all article JSON files
  const jsonFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'))
  console.log(`Found ${jsonFiles.length} article files`)

  const articles = []
  const seenSlugs = new Set()

  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(articlesDir, file), 'utf-8'))
      const title = data.title || file.replace('.json', '')
      let slug = slugify(title)

      // Ensure unique slug
      if (seenSlugs.has(slug)) {
        slug = slug + '-' + Math.random().toString(36).substring(2, 6)
      }
      seenSlugs.add(slug)

      // Find image
      const titleBase = file.replace('.json', '')
      const imageFile = findImage(titleBase, imagesDir)
      const featuredImage = imageFile ? `/articles/${imageFile}` : null

      // Parse date
      let publishedAt = null
      if (data.date) {
        try {
          publishedAt = new Date(data.date).toISOString()
        } catch (e) {
          // Skip invalid dates
        }
      }

      // External URL
      const externalUrl = data.url || data.og_url || null

      // Excerpt
      const excerpt = data.og_description || data.meta_description || (data.content_text ? data.content_text.substring(0, 300) : '') || ''

      // Category
      const category = deriveCategory(data.tags, title)

      // Tags (clean up, take first 10)
      const tags = (data.tags || [])
        .map(t => t.replace(/^#/, '').trim())
        .filter(t => t.length > 0)
        .slice(0, 10)

      // Author
      const author = data.author || data.twitter_data1 || 'Challenge.ma'

      articles.push({
        title: title,
        slug: slug,
        content: externalUrl || '', // Store external URL in content field
        excerpt: excerpt.substring(0, 500),
        featured_image: featuredImage,
        category: category,
        tags: tags.length > 0 ? tags : null,
        is_published: true,
        published_at: publishedAt || new Date().toISOString(),
        views: 0,
      })
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`)
    }
  }

  // Sort by date (newest first) for verification
  articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  console.log(`Prepared ${articles.length} articles`)
  console.log(`Date range: ${articles[articles.length - 1]?.published_at} to ${articles[0]?.published_at}`)

  // 3. Insert in batches of 50
  let inserted = 0
  let errors = 0
  for (let i = 0; i < articles.length; i += 50) {
    const batch = articles.slice(i, i + 50)
    const { data, error } = await supabase
      .from('articles')
      .insert(batch)
      .select('id')

    if (error) {
      console.error(`Batch ${i}-${i + 50} error:`, error.message)
      // Try one by one
      for (const article of batch) {
        const { error: singleError } = await supabase
          .from('articles')
          .insert(article)
        if (singleError) {
          console.error(`  SKIP "${article.title.substring(0, 50)}": ${singleError.message}`)
          errors++
        } else {
          inserted++
        }
      }
    } else {
      inserted += data.length
      console.log(`Batch ${i}-${i + batch.length}: ${data.length} inserted`)
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Errors: ${errors}`)

  // Verify
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
  console.log(`Total published articles in DB: ${count}`)

  // Check articles with images
  const { data: withImages } = await supabase
    .from('articles')
    .select('id, featured_image')
    .not('featured_image', 'is', null)
  console.log(`Articles with images: ${withImages?.length || 0}`)

  // Show date distribution
  const { data: sample } = await supabase
    .from('articles')
    .select('title, published_at')
    .order('published_at', { ascending: false })
    .limit(3)
  console.log('\nMost recent articles:')
  sample?.forEach(a => console.log(`  ${a.published_at}: ${a.title.substring(0, 60)}`))
}

importArticles().catch(console.error)
