'use client'

import { useState } from 'react'
import { Share2, Link as LinkIcon, Check, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface VideoShareButtonProps {
  videoId: string
  title: string
}

export function VideoShareButton({ videoId, title }: VideoShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const getFullUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/videos/${videoId}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard write failed silently
    }
  }

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getFullUrl())
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getFullUrl())
    const text = encodeURIComponent(title)
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getFullUrl())
    const text = encodeURIComponent(`${title} - ${getFullUrl()}`)
    window.open(
      `https://wa.me/?text=${text}`,
      '_blank'
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-secondary/20 hover:border-secondary hover:text-secondary transition-all duration-300"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-green-600">Lien copié!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copier le lien
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-[#25D366]" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
