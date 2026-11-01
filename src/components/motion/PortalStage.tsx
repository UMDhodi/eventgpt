'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from './SmoothScrollProvider'
import { useTransitionStore } from '@/store/transitionStore'
import {
  P_FULL_GLYPH_PATH,
  P_GLYPH_METRICS,
} from './pGlyphPaths'

export default function PortalStage() {
  const router = useRouter()
  const { stopLenis, startLenis } = useLenis()
  const { commit, finishReturning } = useTransitionStore()

  // DOM Refs
  const pinContainerRef = useRef<HTMLDivElement | null>(null)
  const perspectiveContainerRef = useRef<HTMLDivElement | null>(null)
  const headingGroupRef = useRef<HTMLDivElement | null>(null)
  const homeVideoRef = useRef<HTMLVideoElement | null>(null)
  const homeOverlayRef = useRef<HTMLDivElement | null>(null)
  const helperPillRef = useRef<HTMLButtonElement | null>(null)
  const homeLeadRef = useRef<HTMLParagraphElement | null>(null)
  const homeCtasRef = useRef<HTMLDivElement | null>(null)
  const pWrapperRef = useRef<HTMLSpanElement | null>(null)
  const pSvgRef = useRef<SVGSVGElement | null>(null)

  // Animation Controls
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const hasCommittedRef = useRef(false)
  const concertPreloadStartedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  // Preload route and concert video
  useEffect(() => {
    router.prefetch('/music-concert')

    if (typeof window !== 'undefined') {
      const warmRoute = () => {
        fetch('/music-concert', { priority: 'low' } as any).catch(() => {})
      }
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(warmRoute)
      } else {
        setTimeout(warmRoute, 800)
      }
    }
  }, [router])

  const preloadConcertVideo = useCallback(() => {
    if (concertPreloadStartedRef.current) return
    concertPreloadStartedRef.current = true

    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'video'
      link.href = '/media/concert-720p.mp4'
      document.head.appendChild(link)

      const imgLink = document.createElement('link')
      imgLink.rel = 'preload'
      imgLink.as = 'image'
      imgLink.href = '/media/concert-poster.webp'
      document.head.appendChild(imgLink)
    }
  }, [])

  // Measure counter center and compute optical scale factor S
  const measureCounter = useCallback(() => {
    if (!pWrapperRef.current || !headingGroupRef.current) {
      return { originX: '50%', originY: '50%', S: 45 }
    }

    const pRect = pWrapperRef.current.getBoundingClientRect()
    const headingRect = headingGroupRef.current.getBoundingClientRect()

    // Counter center coordinates
    const cx = pRect.left + pRect.width * (P_GLYPH_METRICS.counter.centerPercentX / 100)
    const cy = pRect.top + pRect.height * (P_GLYPH_METRICS.counter.centerPercentY / 100)

    const originX = cx - headingRect.left
    const originY = cy - headingRect.top

    const counterW = Math.max(pRect.width * (P_GLYPH_METRICS.counter.width / P_GLYPH_METRICS.width), 20)
    const counterH = Math.max(pRect.height * (P_GLYPH_METRICS.counter.height / P_GLYPH_METRICS.height), 12)

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900

    const S = Math.max(vw / counterW, vh / counterH) * 1.3

    return { originX: `${originX}px`, originY: `${originY}px`, S }
  }, [])

  // Programmatic dive on click on "p" or helper pill
  const handleTriggerPortal = useCallback(() => {
    const curState = useTransitionStore.getState().state
    if (curState !== 'idle' && curState !== 'diving') return
    if (hasCommittedRef.current || !timelineRef.current) return

    stopLenis()
    preloadConcertVideo()
    useTransitionStore.getState().setState('diving')

    const overlay = document.getElementById('portal-transition-overlay')
    const burst = document.getElementById('portal-transition-burst')

    gsap.to(timelineRef.current, {
      progress: 1,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = timelineRef.current?.progress() ?? 0
        if (overlay && burst) {
          if (p >= 0.70) {
            const b = Math.min(Math.max((p - 0.70) / (0.95 - 0.70), 0), 1)
            overlay.style.visibility = 'visible'
            overlay.style.opacity = String(b)
            burst.style.transform = `scale(${0.4 + b * 1.2})`
            burst.style.opacity = String(b)
          } else {
            overlay.style.opacity = '0'
            overlay.style.visibility = 'hidden'
          }
        }
      },
      onComplete: () => {
        if (!hasCommittedRef.current) {
          hasCommittedRef.current = true
          commit(() => {
            router.push('/music-concert', { scroll: false })
          })
        }
      },
    })
  }, [stopLenis, preloadConcertVideo, commit, router])

  useEffect(() => {
    setIsReady(true)
  }, [])

  // Build the scrubbed timeline with gsap.context
  useEffect(() => {
    if (!isReady) return

    gsap.registerPlugin(ScrollTrigger)

    const isReturn =
      typeof window !== 'undefined' && sessionStorage.getItem('portal:return') === '1'

    const ctx = gsap.context(() => {
      if (
        !pinContainerRef.current ||
        !perspectiveContainerRef.current ||
        !headingGroupRef.current
      ) {
        return
      }

      const { originX, originY, S } = measureCounter()

      // Set transform origin centered on 'p' counter
      gsap.set(headingGroupRef.current, {
        transformOrigin: `${originX} ${originY}`,
        willChange: 'transform',
      })

      // Master Timeline (0 to 1)
      const tl = gsap.timeline({
        paused: true,
      })

      timelineRef.current = tl

      // ─── 0.00 to 0.70: Scale whole heading group 1 -> S ───
      // All letters stay 100% white and visible the whole time (NO fade-out)
      tl.fromTo(
        headingGroupRef.current,
        { scale: 1 },
        {
          scale: S,
          ease: 'power3.in',
          duration: 0.70,
        },
        0
      )

      // 0.00 to 0.50: Perspective tilt rotateX 6deg and rotateY -6deg easing back to 0 (3D feel)
      tl.fromTo(
        perspectiveContainerRef.current,
        { rotateX: 6, rotateY: -6 },
        {
          rotateX: 0,
          rotateY: 0,
          ease: 'power2.out',
          duration: 0.50,
        },
        0
      )

      // 0.00 to 0.15: Nav, pill and CTAs fade out (autoAlpha handles opacity + visibility safely without callbacks)
      const fadeTargets = [helperPillRef.current, homeLeadRef.current, homeCtasRef.current].filter(Boolean)
      if (fadeTargets.length > 0) {
        tl.to(
          fadeTargets,
          {
            autoAlpha: 0,
            y: -20,
            ease: 'power2.out',
            duration: 0.15,
          },
          0
        )
      }

      // Home video scale 1 -> 1.25 and overlay darkens
      if (homeVideoRef.current) {
        tl.fromTo(
          homeVideoRef.current,
          { scale: 1.0 },
          {
            scale: 1.25,
            ease: 'power2.inOut',
            duration: 0.70,
          },
          0
        )
      }

      if (homeOverlayRef.current) {
        tl.fromTo(
          homeOverlayRef.current,
          { opacity: 0.45 },
          {
            opacity: 0.85,
            ease: 'power2.inOut',
            duration: 0.70,
          },
          0
        )
      }

      // Return path from Concert
      if (isReturn) {
        tl.progress(1)
        const overlay = document.getElementById('portal-transition-overlay')
        if (overlay) {
          overlay.style.visibility = 'visible'
          overlay.style.opacity = '1'
        }
        useTransitionStore.getState().setState('returning')

        if (overlay) {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              overlay.style.visibility = 'hidden'
            },
          })
        }

        gsap.to(tl, {
          progress: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            hasCommittedRef.current = false
            sessionStorage.removeItem('portal:return')
            finishReturning()
            startLenis()
            ScrollTrigger.refresh()
          },
        })
      }

      // ─── Pinned Scrubbed ScrollTrigger ───
      const st = ScrollTrigger.create({
        trigger: pinContainerRef.current,
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          const curState = useTransitionStore.getState().state

          if (curState === 'committing' || curState === 'arriving' || curState === 'returning') {
            return
          }

          if (p > 0.10) {
            preloadConcertVideo()
          }

          // Scrub the timeline directly
          tl.progress(p)

          // Direct DOM updates for overlay burst - ZERO React state re-render churn!
          const overlay = document.getElementById('portal-transition-overlay')
          const burst = document.getElementById('portal-transition-burst')
          if (overlay && burst) {
            if (p >= 0.70) {
              const b = Math.min(Math.max((p - 0.70) / (0.95 - 0.70), 0), 1)
              overlay.style.visibility = 'visible'
              overlay.style.opacity = String(b)
              burst.style.transform = `scale(${0.4 + b * 1.2})`
              burst.style.opacity = String(b)
            } else {
              overlay.style.opacity = '0'
              overlay.style.visibility = 'hidden'
            }
          }

          // At p >= 0.98: screen is 100% opaque, commit route push
          if (p >= 0.98 && !hasCommittedRef.current) {
            hasCommittedRef.current = true
            stopLenis()
            commit(() => {
              router.push('/music-concert', { scroll: false })
            })
          }
        },
      })

      const handleResize = () => {
        const { originX: ox, originY: oy } = measureCounter()
        if (headingGroupRef.current) {
          gsap.set(headingGroupRef.current, {
            transformOrigin: `${ox} ${oy}`,
          })
        }
        ScrollTrigger.refresh()
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, pinContainerRef)

    return () => {
      ctx.revert()
    }
  }, [isReady, measureCounter, commit, finishReturning, preloadConcertVideo, router, startLenis, stopLenis])

  return (
    <div
      ref={pinContainerRef}
      className="relative w-full h-screen overflow-hidden bg-ink-950 text-white select-none"
    >
      {/* ══════════════════════════════════════════════════════════════════
          LAYER B: Home Video Background + Dark Overlay
          ══════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={homeVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/home-poster.webp"
          className="w-full h-full object-cover scale-105 filter brightness-95"
          style={{
            transform: 'translateZ(0)',
          }}
        >
          <source media="(max-width: 768px)" src="/media/home-480p.mp4" type="video/mp4" />
          <source src="/media/home-720p.mp4" type="video/mp4" />
        </video>
        {/* Dark Gradient Overlay */}
        <div
          ref={homeOverlayRef}
          className="absolute inset-0 bg-gradient-to-b from-ink-950/55 via-ink-950/25 to-ink-950/75 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          LAYER C: Perspective Container with 3D Depth Parallax
          ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={perspectiveContainerRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          ref={headingGroupRef}
          className="flex flex-col items-center justify-center text-center font-display font-extrabold text-white display-xxl select-none tracking-tight pointer-events-auto"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Line 1: "Event" (translateZ ~ -120px for 3D depth) */}
          <div
            className="leading-[0.9] flex items-center justify-center"
            style={{ transform: 'translateZ(-120px)' }}
          >
            {'Event'.split('').map((char, idx) => (
              <span key={`e-line1-${idx}`} className="inline-block text-white">
                {char}
              </span>
            ))}
          </div>

          {/* Line 2: "Gpt" */}
          <div className="leading-[0.9] flex items-center justify-center">
            {/* 'G' (translateZ ~ -60px) */}
            <span
              className="inline-block text-white"
              style={{ transform: 'translateZ(-60px)' }}
            >
              G
            </span>

            {/* 'p' Portal Trigger (translateZ 0px) */}
            <span
              ref={pWrapperRef}
              onClick={handleTriggerPortal}
              className="p-portal-wrapper relative inline-block cursor-pointer group"
              style={{
                width: 'calc(983 / 1000 * 1em)',
                height: 'calc(704 / 1000 * 1em)',
                marginLeft: 'calc(45 / 1000 * 1em)',
                marginRight: 'calc(35 / 1000 * 1em)',
                verticalAlign: 'calc(-200 / 1000 * 1em)',
                transform: 'translateZ(0px)',
              }}
              role="button"
              tabIndex={0}
              aria-label="Dive through the letter p into Concert portal"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleTriggerPortal()
              }}
            >
              {/* Syne ExtraBold 'p' with counter cut out via fillRule="evenodd" */}
              <svg
                ref={pSvgRef}
                viewBox={P_GLYPH_METRICS.viewBox}
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
              >
                <path
                  d={P_FULL_GLYPH_PATH}
                  fill="#FFFFFF"
                  fillRule="evenodd"
                />
              </svg>
            </span>

            {/* 't' (translateZ ~ -80px) */}
            <span
              className="inline-block text-white"
              style={{ transform: 'translateZ(-80px)' }}
            >
              t
            </span>
          </div>
        </div>

        {/* Helper Pill beneath heading */}
        <button
          ref={helperPillRef}
          onClick={handleTriggerPortal}
          className="mt-8 flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-mono font-medium tracking-wider uppercase border border-white/20 bg-ink-900/70 backdrop-blur-md text-ivory-50/90 hover:border-violet hover:text-white hover:shadow-[0_0_24px_rgba(123,77,255,0.35)] transition-all pointer-events-auto cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-violet animate-pulse" />
          <span>SCROLL OR CLICK &quot;P&quot; TO ENTER CONCERT PORTAL</span>
          <span className="text-violet font-bold">→</span>
        </button>

        {/* Lead text */}
        <p
          ref={homeLeadRef}
          className="body-lg text-white/85 max-w-2xl mt-6 mb-8 text-center leading-relaxed font-body pointer-events-auto"
        >
          Concerts, weddings and parties, planned with AI.
        </p>

        {/* CTAs */}
        <div
          ref={homeCtasRef}
          className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto"
        >
          <Link href="/chat" className="btn-primary">
            Plan with AI
          </Link>
          <Link href="/music-concert" className="btn-secondary">
            Explore venues
          </Link>
        </div>
      </div>
    </div>
  )
}
