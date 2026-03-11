'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface VideoLikeButtonProps {
  videoId: string
  initialLikes?: number
}

export function VideoLikeButton({ videoId, initialLikes = 0 }: VideoLikeButtonProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const checkAuthAndLikeStatus = useCallback(async () => {
    const supabase = createClient()

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)

    if (user) {
      // Check if user has already liked this video
      const { data: existingLike } = await supabase
        .from('video_likes')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single()

      setIsLiked(!!existingLike)
    }

    // Get current likes count
    const { data: video } = await supabase
      .from('videos')
      .select('likes')
      .eq('id', videoId)
      .single()

    if (video) {
      setLikesCount(video.likes || 0)
    }
  }, [videoId])

  useEffect(() => {
    checkAuthAndLikeStatus()
  }, [checkAuthAndLikeStatus])

  const handleLike = async () => {
    const supabase = createClient()

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    setIsLoading(true)

    try {
      if (isLiked) {
        // Unlike: Remove from video_likes and decrement count
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id)

        await supabase
          .from('videos')
          .update({ likes: Math.max(0, likesCount - 1) })
          .eq('id', videoId)

        setIsLiked(false)
        setLikesCount((prev) => Math.max(0, prev - 1))
      } else {
        // Like: Add to video_likes and increment count
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: user.id })

        await supabase
          .from('videos')
          .update({ likes: likesCount + 1 })
          .eq('id', videoId)

        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch {
      // like toggle failed silently
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLike}
      disabled={isLoading}
      className={`relative transition-all duration-300 ${
        isLiked
          ? 'bg-accent/10 border-accent text-accent hover:bg-accent/20'
          : 'hover:bg-secondary/20 hover:border-secondary hover:text-secondary'
      }`}
      title={isLoggedIn ? (isLiked ? 'Retirer le like' : 'Aimer cette vidéo') : 'Connectez-vous pour aimer'}
    >
      <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      {likesCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {likesCount > 99 ? '99+' : likesCount}
        </span>
      )}
    </Button>
  )
}
