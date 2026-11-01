'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransitionStore } from '@/store/transitionStore'

export default function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const state = useTransitionStore((s) => s.state)

  // Prioritize active route strictly; support preview theme ONLY on parent landing routes
  const currentTheme = (() => {
    if (pathname === '/birthday-party') return 'birthday'
    if (pathname === '/wedding') return 'wedding'
    if (pathname === '/music-concert' && activeTheme === 'wedding') return 'wedding'
    if (pathname === '/wedding' && activeTheme === 'birthday') return 'birthday'
    return null
  })()

  const isLightWedding = currentTheme === 'wedding'
  const isBirthday = currentTheme === 'birthday'
  const isAiTheme = pathname === '/chat'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen to dynamic banner theme switches (e.g. WeddingBanner or BirthdayBanner active)
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-nav-theme')
      setActiveTheme(theme)
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-nav-theme'] })
    return () => observer.disconnect()
  }, [])

  // Synchronize route and clean up data-nav-theme on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
    if (pathname === '/birthday-party') {
      document.documentElement.setAttribute('data-nav-theme', 'birthday')
      setActiveTheme('birthday')
    } else if (pathname === '/wedding') {
      document.documentElement.setAttribute('data-nav-theme', 'wedding')
      setActiveTheme('wedding')
    } else {
      document.documentElement.removeAttribute('data-nav-theme')
      setActiveTheme(null)
    }
  }, [pathname])

  const links = [
    { label: 'Concerts', href: '/music-concert' },
    { label: 'Weddings', href: '/wedding' },
    { label: 'Birthdays', href: '/birthday-party' },
    { label: 'Chat', href: '/chat' },
  ]

  // Nav text color rule:
  const getTextColor = (isActive: boolean) => {
    if (isLightWedding) {
      return isActive ? 'text-[#C4623A] font-bold' : 'text-[#1C1A17] hover:text-[#C4623A]'
    }
    if (isBirthday) {
      return isActive
        ? 'text-[#FFC83D] font-bold drop-shadow-[0_0_10px_rgba(255,200,61,0.5)]'
        : 'text-ivory-50/80 hover:text-[#FFC83D]'
    }
    if (isAiTheme) {
      return isActive
        ? 'text-[#6EE7C8] font-bold drop-shadow-[0_0_10px_rgba(110,231,200,0.5)]'
        : 'text-ivory-50/80 hover:text-[#6EE7C8]'
    }
    return isActive ? 'text-accent font-bold' : 'text-ivory-50/80 hover:text-white'
  }

  // Active link resolution taking banner preview into account ONLY on landing routes
  const resolveActiveHref = () => {
    if (pathname === '/music-concert' && activeTheme === 'wedding') return '/wedding'
    if (pathname === '/wedding' && activeTheme === 'birthday') return '/birthday-party'
    return pathname
  }

  const currentActiveHref = resolveActiveHref()

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
          state === 'diving' || state === 'committing' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${
          isLightWedding
            ? 'bg-[#F6F0E6]/95 backdrop-blur-xl border-b border-[#1C1A17]/10 shadow-sm'
            : isBirthday
              ? 'bg-[#0A090D]/90 backdrop-blur-2xl border-b border-[#FFC83D]/25 shadow-[0_4px_30px_rgba(255,200,61,0.12)]'
              : isAiTheme
                ? 'bg-[#0B0A10]/90 backdrop-blur-2xl border-b border-[#6EE7C8]/20 shadow-[0_4px_30px_rgba(110,231,200,0.1)]'
                : isScrolled
                  ? 'bg-ink-950/70 backdrop-blur-2xl border-b border-ink-700/60 shadow-lg'
                  : 'bg-transparent border-b border-transparent'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo (left) */}
          <Link href="/" prefetch={true} className="flex items-center gap-2 group">
            <span
              className={`h-8 w-8 rounded-full flex items-center justify-center font-display font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform ${
                isBirthday
                  ? 'bg-[#FFC83D] text-[#0A090D] shadow-[0_0_16px_rgba(255,200,61,0.5)]'
                  : isAiTheme
                    ? 'bg-[#6EE7C8] text-[#0A090D] shadow-[0_0_16px_rgba(110,231,200,0.5)]'
                    : 'bg-accent text-ink-950'
              }`}
            >
              ✦
            </span>
            <span
              className={`font-display font-extrabold text-xl tracking-tight transition-colors ${
                isLightWedding ? 'text-[#1C1A17]' : 'text-white'
              }`}
            >
              EventGpt
            </span>
          </Link>

          {/* Links (centre) */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {links.map((link) => {
              const isActive = currentActiveHref === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`text-sm font-body tracking-wide transition-all relative py-1 ${getTextColor(isActive)}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all ${
                        isLightWedding
                          ? 'bg-[#C4623A]'
                          : isBirthday
                            ? 'bg-[#FFC83D] shadow-[0_0_8px_#FFC83D]'
                            : isAiTheme
                              ? 'bg-[#6EE7C8] shadow-[0_0_8px_#6EE7C8]'
                              : 'bg-accent shadow-[0_0_8px_rgba(232,184,74,0.6)]'
                      }`}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Primary CTA (far right) */}
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              prefetch={true}
              className={`hidden sm:inline-flex items-center justify-center h-11 px-6 rounded-full font-body font-bold text-sm tracking-wide shadow-md transition-all hover:scale-105 ${
                isBirthday
                  ? 'bg-[#FFC83D] text-[#0A090D] shadow-[0_0_24px_rgba(255,200,61,0.4)] hover:brightness-110'
                  : isLightWedding
                    ? 'bg-[#1C1A17] text-[#F6F0E6] hover:bg-black/90'
                    : isAiTheme
                      ? 'bg-[#6EE7C8] text-[#0A090D] shadow-[0_0_20px_rgba(110,231,200,0.4)] hover:brightness-110'
                      : 'bg-accent text-ink-950 hover:brightness-105'
              }`}
            >
              Plan with AI
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl md:hidden hover:bg-black/5 transition-colors ${
                isLightWedding ? 'text-[#1C1A17]' : 'text-white'
              }`}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-ink-950/98 backdrop-blur-3xl p-8 flex flex-col justify-between md:hidden">
          <div className="pt-20 flex flex-col gap-6">
            <p className="label-mono text-accent text-xs">EVENTGPT VENUE PORTALS</p>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display font-bold text-3xl text-ivory-50 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/chat"
              className="w-full h-14 rounded-full bg-accent text-ink-950 font-bold flex items-center justify-center text-base"
            >
              Plan with AI
            </Link>
            <p className="caption text-center text-muted">
              Live in 38 Cities · AI Planning Assistant v1.0
            </p>
          </div>
        </div>
      )}
    </>
  )
}
