'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { useTransitionStore } from '@/store/transitionStore'
import { useLenis } from './SmoothScrollProvider'

export default function ConcertHero() {
  const router = useRouter()
  const { startLenis, stopLenis } = useLenis()
  const { returnHome, finishArriving } = useTransitionStore()

  const heroContainerRef = useRef<HTMLDivElement | null>(null)
  const heroContentRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const headingLettersRef = useRef<HTMLSpanElement[]>([])
  const leadRef = useRef<HTMLParagraphElement | null>(null)
  const ctasRef = useRef<HTMLDivElement | null>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const armedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const concertWord = 'Concert'

  // A6: Scroll reset to 0 BEFORE overlay dissolves (synchronous in useLayoutEffect)
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      stopLenis()
      window.scrollTo(0, 0)
    }
  }, [stopLenis])

  // Arriving animation on mount
  useEffect(() => {
    // Double-verify scrollY is 0 before revealing anything (A6)
    window.scrollTo(0, 0)

    useTransitionStore.getState().setState('arriving')
    const overlayEl = typeof document !== 'undefined' ? document.getElementById('portal-transition-overlay') : null

    const ctx = gsap.context(() => {
      // 1. Concert hero scale 1.25 -> 1 (900ms, ease-out-expo)
      if (heroContainerRef.current) {
        gsap.fromTo(
          heroContainerRef.current,
          { scale: 1.25 },
          {
            scale: 1.0,
            duration: 0.9,
            ease: 'expo.out',
          }
        )
      }

      // 2. Heading letters rise with 40ms stagger
      if (headingLettersRef.current.length > 0) {
        gsap.fromTo(
          headingLettersRef.current,
          {
            y: 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.04,
            duration: 0.8,
            ease: 'expo.out',
          }
        )
      }

      // 3. Lead & CTAs fade in
      if (leadRef.current && ctasRef.current) {
        gsap.fromTo(
          [leadRef.current, ctasRef.current],
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power2.out',
          }
        )
      }

      // 4. A6: Overlay dissolves only after scrollY === 0 is verified
      const dissolveOverlay = () => {
        if (overlayEl) {
          gsap.to(overlayEl, {
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out',
            onComplete: () => {
              overlayEl.style.visibility = 'hidden'
              finishArriving()
              startLenis()
              window.scrollTo(0, 0)

              // After arriving finished + 1200ms cooldown (armed = true for return)
              if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current)
              armedTimeoutRef.current = setTimeout(() => {
                useTransitionStore.getState().setArmed(true)
              }, 1200)
            },
          })
        } else {
          finishArriving()
          startLenis()
          if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current)
          armedTimeoutRef.current = setTimeout(() => {
            useTransitionStore.getState().setArmed(true)
          }, 1200)
        }
      }

      // Verify scroll position before triggering dissolve
      if (window.scrollY === 0) {
        dissolveOverlay()
      } else {
        window.scrollTo(0, 0)
        requestAnimationFrame(dissolveOverlay)
      }
    })

    return () => {
      if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // RETURN MECHANISM:
  // On Concert, only after arriving finished + 1200ms cooldown (armed = true),
  // if scrollY === 0 and accumulated wheel-up deltaY (or touch swipe down) exceeds 200: returnHome()
  useEffect(() => {
    let accumulatedDelta = 0
    let touchStartY = 0

    const triggerReturn = () => {
      stopLenis()
      const accepted = useTransitionStore.getState().returnHome(() => {
        const overlay = document.getElementById('portal-transition-overlay')
        if (overlay) {
          overlay.style.visibility = 'visible'
          overlay.style.opacity = '1'
        }
        router.push('/', { scroll: false })
      })
      return accepted
    }

    if (typeof window !== 'undefined') {
      ;(window as any).__transitionStore = useTransitionStore
      ;(window as any).__triggerReturn = triggerReturn
    }

    const handleWheel = (e: WheelEvent) => {
      const { state, armed } = useTransitionStore.getState()
      if (state !== 'idle' || !armed) return

      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (scrollY <= 5 && e.deltaY < 0) {
        accumulatedDelta += -e.deltaY
        if (accumulatedDelta >= 200) {
          accumulatedDelta = 0
          triggerReturn()
        }
      } else if (scrollY > 10) {
        accumulatedDelta = 0
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const { state, armed } = useTransitionStore.getState()
      if (state !== 'idle' || !armed) return

      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (scrollY <= 2) {
        const touchY = e.touches[0].clientY
        const diff = touchY - touchStartY
        if (diff > 120) {
          triggerReturn()
        }
      }
    }

    const handlePopState = () => {
      try {
        sessionStorage.setItem('portal:return', '1')
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [returnHome, router, stopLenis])

  const addToLetters = (el: HTMLSpanElement | null) => {
    if (el && !headingLettersRef.current.includes(el)) {
      headingLettersRef.current.push(el)
    }
  }

  return (
    <section
      ref={heroContainerRef}
      className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-ink-950 text-white select-none origin-center"
    >
      {/* Background Video with Instant Poster & Seamless Play */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/concert-poster.webp"
          onPlaying={() => setVideoPlaying(true)}
          className={`w-full h-full object-cover scale-105 filter brightness-100 transition-opacity duration-300 ${
            videoPlaying ? 'opacity-100' : 'opacity-95'
          }`}
          style={{
            transform: 'translateZ(0)',
          }}
        >
          <source media="(max-width: 768px)" src="/media/concert-480p.mp4" type="video/mp4" />
          <source src="/media/concert-720p.mp4" type="video/mp4" />
        </video>
        {/* Violet / Electric Blue Stage Lighting Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-violet/50 via-electric-blue/30 to-ink-950/80"
          aria-hidden="true"
        />
      </div>

      {/* Hero Content */}
      <div
        ref={heroContentRef}
        className="relative z-10 max-w-6xl mx-auto px-6 py-28 flex flex-col items-center text-center"
      >
        <span className="label-mono text-xs px-3.5 py-1.5 rounded-full bg-violet/20 border border-violet/40 text-violet tracking-widest mb-6 uppercase backdrop-blur-sm">
          CONCERT PRODUCTION // 01
        </span>

        {/* Heading with Staggered Rising Letters */}
        <h1 className="font-display font-extrabold text-white text-center display-xxl tracking-tight mb-6 flex items-center justify-center">
          {concertWord.split('').map((char, idx) => (
            <span
              key={`c-char-${idx}`}
              ref={addToLetters}
              className="inline-block"
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Lead Text */}
        <p
          ref={leadRef}
          className="body-lg text-white/85 max-w-2xl mb-10 leading-relaxed font-body"
        >
          Stadium sound, volumetric laser architecture, and uncompromising crowd-flow logistics.
        </p>

        {/* CTAs */}
        <div
          ref={ctasRef}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/chat" className="btn-primary">
            Plan with AI
          </Link>
          <Link href="#tech-specs" className="btn-secondary">
            Inspect Tech Specs
          </Link>
        </div>
      </div>
    </section>
  )
}
