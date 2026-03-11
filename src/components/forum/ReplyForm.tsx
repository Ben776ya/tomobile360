'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

interface ReplyFormProps {
  topicId: string
}

export function ReplyForm({ topicId }: ReplyFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('Veuillez entrer votre réponse')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('Vous devez être connecté pour répondre')
        return
      }

      const { error } = await supabase.from('forum_posts').insert({
        topic_id: topicId,
        author_id: user.id,
        content: content.trim(),
      })

      if (error) throw error

      setContent('')
      alert('Votre réponse a été publiée avec succès!')
      router.refresh()
    } catch {
      alert('Erreur lors de la publication de votre réponse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-accent" />
        </div>
        <h3 className="text-lg font-bold">Votre réponse</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre réponse ici..."
          rows={6}
          className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Publication...' : 'Publier la réponse'}
          </Button>
        </div>
      </form>
    </div>
  )
}
