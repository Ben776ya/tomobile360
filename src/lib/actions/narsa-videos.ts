'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NarsaVideo } from '@/lib/types'

// Check if user is admin
async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié', user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: 'Accès non autorisé', user: null }
  }

  return { user }
}

// Fetch ALL narsa videos (admin use)
export async function getNarsaVideos(): Promise<{
  data: NarsaVideo[]
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('narsa_videos')
    .select(
      'id, title, description, video_url, thumbnail_url, duration, order_position, is_published, created_at, updated_at'
    )
    .order('order_position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data as NarsaVideo[], error: null }
}

// Fetch published narsa videos only (public use)
export async function getPublishedNarsaVideos(): Promise<{
  data: NarsaVideo[]
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('narsa_videos')
    .select(
      'id, title, description, video_url, thumbnail_url, duration, order_position, is_published, created_at, updated_at'
    )
    .eq('is_published', true)
    .order('order_position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data as NarsaVideo[], error: null }
}

// Upload video file + create DB record
export async function uploadNarsaVideo(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { success: false, error: adminCheck.error }

  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const duration = formData.get('duration') as string | null
  const orderPositionRaw = formData.get('order_position') as string | null
  const videoFile = formData.get('video_file') as File | null
  const thumbnailFile = formData.get('thumbnail_file') as File | null

  if (!title || !title.trim()) {
    return { success: false, error: 'Le titre est requis' }
  }

  if (!videoFile || videoFile.size === 0) {
    return { success: false, error: 'Le fichier vidéo est requis' }
  }

  const orderPosition = orderPositionRaw ? parseInt(orderPositionRaw, 10) : 0
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
  const timestamp = Date.now()

  const supabase = await createClient()

  // Upload video file
  const videoExt = videoFile.name.split('.').pop() || 'mp4'
  const videoPath = `videos/${timestamp}-${sanitizedTitle}.${videoExt}`

  const { error: videoUploadError } = await supabase.storage
    .from('narsa-videos')
    .upload(videoPath, videoFile)

  if (videoUploadError) {
    return { success: false, error: `Erreur upload vidéo: ${videoUploadError.message}` }
  }

  const {
    data: { publicUrl: videoPublicUrl },
  } = supabase.storage.from('narsa-videos').getPublicUrl(videoPath)

  // Upload thumbnail if provided
  let thumbnailPublicUrl: string | null = null
  let thumbnailPath: string | null = null

  if (thumbnailFile && thumbnailFile.size > 0) {
    const thumbExt = thumbnailFile.name.split('.').pop() || 'jpg'
    thumbnailPath = `thumbnails/${timestamp}-${sanitizedTitle}.${thumbExt}`

    const { error: thumbUploadError } = await supabase.storage
      .from('narsa-videos')
      .upload(thumbnailPath, thumbnailFile)

    if (thumbUploadError) {
      // Clean up the uploaded video since thumbnail failed
      await supabase.storage.from('narsa-videos').remove([videoPath])
      return {
        success: false,
        error: `Erreur upload miniature: ${thumbUploadError.message}`,
      }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('narsa-videos').getPublicUrl(thumbnailPath)
    thumbnailPublicUrl = publicUrl
  }

  // Insert into DB
  const { error: insertError } = await supabase.from('narsa_videos').insert({
    title: title.trim(),
    description: description?.trim() || null,
    video_url: videoPublicUrl,
    thumbnail_url: thumbnailPublicUrl,
    duration: duration?.trim() || null,
    order_position: isNaN(orderPosition) ? 0 : orderPosition,
    is_published: false,
  })

  if (insertError) {
    // Clean up uploaded files on DB insert failure
    const filesToRemove = [videoPath]
    if (thumbnailPath) filesToRemove.push(thumbnailPath)
    await supabase.storage.from('narsa-videos').remove(filesToRemove)
    return { success: false, error: `Erreur insertion: ${insertError.message}` }
  }

  revalidatePath('/services/securite-routiere')
  revalidatePath('/admin/narsa-videos')
  return { success: true }
}

// Delete video + storage files
export async function deleteNarsaVideo(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { success: false, error: adminCheck.error }

  const supabase = await createClient()

  // Fetch the video record to get URLs
  const { data: video, error: fetchError } = await supabase
    .from('narsa_videos')
    .select(
      'id, video_url, thumbnail_url'
    )
    .eq('id', id)
    .single()

  if (fetchError || !video) {
    return { success: false, error: 'Vidéo introuvable' }
  }

  // Extract storage paths from public URLs
  const filesToRemove: string[] = []

  if (video.video_url) {
    const videoPath = extractStoragePath(video.video_url, 'narsa-videos')
    if (videoPath) filesToRemove.push(videoPath)
  }

  if (video.thumbnail_url) {
    const thumbPath = extractStoragePath(video.thumbnail_url, 'narsa-videos')
    if (thumbPath) filesToRemove.push(thumbPath)
  }

  // Remove files from storage
  if (filesToRemove.length > 0) {
    await supabase.storage.from('narsa-videos').remove(filesToRemove)
  }

  // Delete DB record
  const { error: deleteError } = await supabase
    .from('narsa_videos')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { success: false, error: `Erreur suppression: ${deleteError.message}` }
  }

  revalidatePath('/services/securite-routiere')
  revalidatePath('/admin/narsa-videos')
  return { success: true }
}

// Toggle publish state
export async function toggleNarsaVideoPublished(
  id: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { success: false, error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('narsa_videos')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/services/securite-routiere')
  revalidatePath('/admin/narsa-videos')
  return { success: true }
}

// Helper: extract storage path from a Supabase public URL
// Public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
function extractStoragePath(
  publicUrl: string,
  bucket: string
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(publicUrl.substring(index + marker.length))
}
