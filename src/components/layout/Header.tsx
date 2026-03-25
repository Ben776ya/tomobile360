'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, User, LogIn, LogOut, Settings, Heart, FileText, Search, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'
import { FloatingSocialBubble } from '@/components/shared/FloatingSocialBubble'
import { cn } from '@/lib/utils'

interface ArticleResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  featured_image: string | null
}

interface VideoResult {
  id: string
  title: string
  thumbnail_url: string | null
  category: string | null
  duration: string | null
}


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hidden, setHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ArticleResult[]>([])
  const [videoResults, setVideoResults] = useState<VideoResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const lastScrollY = useRef(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
        setVideoResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setVideoResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      const [{ data: articles }, { data: videos }] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, slug, excerpt, category, featured_image')
          .eq('is_published', true)
          .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
          .limit(3),
        supabase
          .from('videos')
          .select('id, title, thumbnail_url, category, duration')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(3),
      ])
      setSearchResults(articles || [])
      setVideoResults(videos || [])
      setSearchLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, supabase])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 10) {
        setHidden(false)
      } else {
        if (currentScrollY > lastScrollY.current + 5) {
          // scrolling down — hide
          setHidden(true)
        } else if (currentScrollY < lastScrollY.current - 5) {
          // scrolling up — show
          setHidden(false)
        }
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/neuf', label: 'NEUF' },
    { href: '/occasion', label: 'OCCAZ' },
    { href: '/services', label: 'SERVICES' },
    { href: '/actu', label: 'ACTU' },
    { href: '/videos', label: 'ESSAIS AUTO' },
    { href: '/contact', label: 'CONTACT' },
  ]

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300',
        hidden && '-translate-y-full'
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_tomobil360.png"
              alt="Tomobile 360"
              width={200}
              height={56}
              priority
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation + Search grouped together */}
          <div className="hidden lg:flex items-center gap-4">
            <nav className="flex items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1 text-sm font-bold tracking-wide transition-all duration-200
                      ${isActive
                        ? 'text-[#006EFE] font-semibold'
                        : 'text-gray-600 hover:text-[#006EFE]'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

          {/* Search Field — right after nav */}
          <div ref={searchRef} className="relative">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 focus-within:border-[#006EFE] focus-within:ring-1 focus-within:ring-[#006EFE]/20 transition-all duration-200">
              <Search className="h-4 w-4 text-gray-500 ml-3 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }
                  if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/actu?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }
                }}
                placeholder="Rechercher articles, vidéos..."
                className="w-44 px-2 py-1.5 text-sm bg-transparent text-gray-800 placeholder-gray-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setVideoResults([]); setSearchOpen(false) }} className="mr-2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Results Dropdown */}
            {searchOpen && (searchResults.length > 0 || videoResults.length > 0 || searchLoading) && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
                {searchLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">Recherche...</div>
                ) : (
                  <>
                    {searchResults.length > 0 && (
                      <>
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Articles</span>
                        </div>
                        {searchResults.map(article => (
                          <Link
                            key={article.id}
                            href={`/actu/${article.slug}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            {article.featured_image && (
                              <Image src={article.featured_image} alt={article.title} width={40} height={40} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              {article.category && (
                                <span className="text-[10px] font-semibold text-[#006EFE] uppercase tracking-wide">{article.category}</span>
                              )}
                              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">{article.title}</p>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                    {videoResults.length > 0 && (
                      <>
                        <div className={`px-4 pt-3 pb-1 ${searchResults.length > 0 ? 'border-t border-gray-100' : ''}`}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vidéos</span>
                        </div>
                        {videoResults.map(video => (
                          <Link
                            key={video.id}
                            href="/videos"
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            {video.thumbnail_url ? (
                              <div className="relative w-10 h-10 flex-shrink-0">
                                <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover rounded-lg" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <PlayCircle className="h-4 w-4 text-white drop-shadow" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <PlayCircle className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              {video.category && (
                                <span className="text-[10px] font-semibold text-[#006EFE] uppercase tracking-wide">{video.category}</span>
                              )}
                              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">{video.title}</p>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                    <div className="border-t border-gray-100 flex">
                      <Link
                        href={`/actu?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                        className="flex-1 px-3 py-2.5 text-xs font-semibold text-[#006EFE] hover:bg-blue-50 text-center transition-colors"
                      >
                        Articles →
                      </Link>
                      <span className="w-px bg-gray-100" />
                      <Link
                        href="/videos"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                        className="flex-1 px-3 py-2.5 text-xs font-semibold text-[#006EFE] hover:bg-blue-50 text-center transition-colors"
                      >
                        Vidéos →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* No results */}
            {searchOpen && searchQuery.trim().length > 1 && !searchLoading && searchResults.length === 0 && videoResults.length === 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 z-50 animate-fade-in">
                <p className="text-sm text-gray-400 text-center">Aucun résultat trouvé</p>
              </div>
            )}
          </div>
          </div>{/* end nav+search group */}

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-full hover:bg-gray-50 transition-all duration-300"
                >
                  <User className="h-5 w-5 text-[#006EFE]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-md rounded-xl shadow-lg py-2 z-20 border border-gray-200/50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <p className="text-sm font-medium text-gray-900">Mon Compte</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/compte"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-white/60 hover:text-[#006EFE] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Tableau de bord</span>
                      </Link>
                      <Link
                        href="/compte/mes-annonces"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-white/60 hover:text-[#006EFE] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Mes annonces</span>
                      </Link>
                      <Link
                        href="/compte/favoris"
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-white/60 hover:text-[#006EFE] transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>Mes favoris</span>
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => logout()}
                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                <User className="h-5 w-5 text-[#006EFE]" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#006EFE]" />
            ) : (
              <Menu className="h-6 w-6 text-[#006EFE]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-200 animate-slide-in bg-white rounded-b-2xl">
            {/* Mobile Search */}
            <div className="px-4 pb-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/actu?q=${encodeURIComponent(searchQuery.trim())}`); setMobileMenuOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }
                  }}
                  placeholder="Rechercher articles, vidéos..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-[#006EFE]/40"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {(searchResults.length > 0 || videoResults.length > 0) && (
                <div className="mt-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                  {searchResults.map(article => (
                    <Link
                      key={article.id}
                      href={`/actu/${article.slug}`}
                      onClick={() => { setMobileMenuOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-800 border-b border-gray-50 last:border-0"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#006EFE] flex-shrink-0" />
                      <span className="line-clamp-1">{article.title}</span>
                    </Link>
                  ))}
                  {videoResults.map(video => (
                    <Link
                      key={video.id}
                      href="/videos"
                      onClick={() => { setMobileMenuOpen(false); setSearchQuery(''); setSearchResults([]); setVideoResults([]) }}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-800 border-b border-gray-50 last:border-0"
                    >
                      <PlayCircle className="h-3.5 w-3.5 text-[#006EFE] flex-shrink-0" />
                      <span className="line-clamp-1">{video.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-3 text-sm font-bold transition-all duration-300
                      border-l-[3px]
                      ${isActive
                        ? 'text-[#006EFE] border-[#006EFE] bg-blue-50/50'
                        : 'text-gray-700 border-transparent hover:text-[#006EFE] hover:border-[#006EFE]/30'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div className="pt-3 mt-2 border-t border-gray-200 space-y-1 px-2">
                {user ? (
                  <>
                    <Link
                      href="/compte"
                      className="flex items-center space-x-3 px-3 py-3 text-sm font-medium text-[#006EFE] hover:bg-blue-50/50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Mon Compte</span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center space-x-3 px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 w-full text-left rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center space-x-3 px-3 py-3 text-sm font-medium text-[#006EFE] hover:bg-blue-50/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>

    <FloatingSocialBubble />
    </>
  )
}
