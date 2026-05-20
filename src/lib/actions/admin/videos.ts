'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAdmin } from '@/lib/auth/check-admin'
import { validateAction, UpdateVideoSchema } from '@/lib/validations'
import type { UpdateVideoInput } from '@/lib/validations'

export async function createVideo(data: {
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  duration?: string
  category: string
  is_published: boolean
}) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      title: data.title,
      description: data.description,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url || null,
      category: data.category.toLowerCase(),
      is_published: data.is_published,
      duration: data.duration || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath('/admin/content')
  return { success: true, videoId: video.id }
}

export async function updateVideo(id: string, data: UpdateVideoInput) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const validated = validateAction(UpdateVideoSchema, data)
  if (!validated.success) return { error: validated.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('videos')
    .update(validated.data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath(`/videos/${id}`)
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteVideo(id: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return { error: adminCheck.error }

  const supabase = await createClient()

  const { error } = await supabase.from('videos').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/videos')
  revalidatePath('/admin/content')
  return { success: true }
}
