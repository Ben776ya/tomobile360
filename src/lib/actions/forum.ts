'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateAction, ForumTopicSchema, ForumReplySchema } from '@/lib/validations'

export async function deleteTopic(topicId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Check if user is author or admin
  const { data: topic } = await supabase
    .from('forum_topics')
    .select('author_id')
    .eq('id', topicId)
    .single()

  if (!topic) {
    return { error: 'Sujet introuvable' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (topic.author_id !== user.id && !profile?.is_admin) {
    return { error: 'Vous n\'avez pas la permission de supprimer ce sujet' }
  }

  // Delete all posts in the topic first
  await supabase.from('forum_posts').delete().eq('topic_id', topicId)

  // Delete the topic
  const { error } = await supabase
    .from('forum_topics')
    .delete()
    .eq('id', topicId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Check if user is author or admin
  const { data: post } = await supabase
    .from('forum_posts')
    .select('author_id, topic_id')
    .eq('id', postId)
    .single()

  if (!post) {
    return { error: 'Message introuvable' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (post.author_id !== user.id && !profile?.is_admin) {
    return { error: 'Vous n\'avez pas la permission de supprimer ce message' }
  }

  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/forum/topic/${post.topic_id}`)
  return { success: true }
}

export async function updateTopic(topicId: string, data: { title: string; content: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Check if user is author
  const { data: topic } = await supabase
    .from('forum_topics')
    .select('author_id')
    .eq('id', topicId)
    .single()

  if (!topic || topic.author_id !== user.id) {
    return { error: 'Vous n\'avez pas la permission de modifier ce sujet' }
  }

  const { error } = await supabase
    .from('forum_topics')
    .update({
      title: data.title,
      content: data.content,
    })
    .eq('id', topicId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/forum/topic/${topicId}`)
  return { success: true }
}

export async function updatePost(postId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez être connecté' }
  }

  // Check if user is author
  const { data: post } = await supabase
    .from('forum_posts')
    .select('author_id, topic_id')
    .eq('id', postId)
    .single()

  if (!post || post.author_id !== user.id) {
    return { error: 'Vous n\'avez pas la permission de modifier ce message' }
  }

  const { error } = await supabase
    .from('forum_posts')
    .update({ content })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/forum/topic/${post.topic_id}`)
  return { success: true }
}

export async function createTopic(data: { category_id: string; title: string; content: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez etre connecte pour creer un sujet' }
  }

  const validated = validateAction(ForumTopicSchema, data)
  if (!validated.success) return { error: validated.error, fieldErrors: validated.fieldErrors }

  const { data: topic, error } = await supabase
    .from('forum_topics')
    .insert({
      category_id: validated.data.category_id,
      author_id: user.id,
      title: validated.data.title,
      content: validated.data.content,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/forum')
  return { success: true, topicId: topic.id }
}

export async function createReply(data: { topic_id: string; content: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Vous devez etre connecte pour repondre' }
  }

  const validated = validateAction(ForumReplySchema, data)
  if (!validated.success) return { error: validated.error, fieldErrors: validated.fieldErrors }

  const { error } = await supabase
    .from('forum_posts')
    .insert({
      topic_id: validated.data.topic_id,
      author_id: user.id,
      content: validated.data.content,
    })

  if (error) return { error: error.message }

  revalidatePath(`/forum/topic/${validated.data.topic_id}`)
  return { success: true }
}
