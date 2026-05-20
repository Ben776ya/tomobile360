import { NextRequest, NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/auth/check-admin'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const auth = await checkAdminApi()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { supabase } = auth

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo)' },
        { status: 400 },
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `blog/${timestamp}-${random}.${ext}`

    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE — remove image from storage
export async function DELETE(request: NextRequest) {
  const auth = await checkAdminApi()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { supabase } = auth

  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    // Extract the storage path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/blog-images/blog/<filename>
    const marker = '/blog-images/'
    const idx = url.indexOf(marker)
    if (idx === -1) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
    }
    const filePath = url.slice(idx + marker.length)

    const { error } = await supabase.storage
      .from('blog-images')
      .remove([filePath])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
