'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function WeddingBanner() {
  const router = useRouter()
  const pinSectionRef = useRef<HTMLDivElement | null>(null)
  const stretchCardRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const heroContentRef = useRef<HTMLDivElement | null>(null)
  const subtitleRef = useRef<HTMLParagraphElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const leadRef = useRef<HTMLParagraphElement | null>(null)
  const ctasRef = useRef<HTMLDivElement | null>(null)
  const scrollCueRef = useRef<HTMLDivElement | null>(null)

  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const isNavigatingRef = useRef(false)

  // Prefetch and warm the /wedding route on mount for zero freeze
  useEffect(() => {
    router.prefetch('/wedding')
    if (typeof window !== 'undefined') {
      const warm = () => fetch('/wedding', { priority: 'low' } as any).catch(() => {})
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(warm)
      } else {
        setTimeout(warm, 400)
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-nav-theme')
      }
    }
  }, [router])

  useEffect(() => {
    if (!pinSectionRef.current || !stretchCardRef.current || !titleRef.current) return

    const ctx = gsap.context(() => {
      // Scrubbed timeline: Pinned stage where the wedding hero card stretches to full-screen
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            // Synchronize navbar theme immediately as banner expands (Point 2)
            if (typeof document !== 'undefined') {
              if (p >= 0.08) {
                document.documentElement.setAttribute('data-nav-theme', 'wedding')
              } else {
                document.documentElement.removeAttribute('data-nav-theme')
              }
            }

            // When stretched to full viewport, seamlessly route to /wedding with zero freeze
            if (p >= 0.94 && !isNavigatingRef.current) {
              isNavigatingRef.current = true
              router.push('/wedding', { scroll: false })
            } else if (p < 0.85) {
              isNavigatingRef.current = false
            }
          },
        },
      })

      // 1. Stretch the wedding container card to 100vw x 100vh with border radius flattening to 0
      tl.fromTo(
        stretchCardRef.current,
        {
          width: '90%',
          maxWidth: '1240px',
          height: '520px',
          borderRadius: '2.5rem',
          boxShadow: '0 30px 80px -20px rgba(160, 140, 115, 0.35)',
        },
        {
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          borderRadius: '0rem',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          ease: 'power2.out',
          duration: 0.85,
        },
        0
      )

      // 2. Video softly scales and maintains full-bleed presence
      if (videoRef.current) {
        tl.fromTo(
          videoRef.current,
          { scale: 1.02 },
          { scale: 1.1, ease: 'power2.inOut', duration: 1 },
          0
        )
      }

      // 3. White cream shader deepens to full wedding atmosphere
      if (overlayRef.current) {
        tl.fromTo(
          overlayRef.current,
          { opacity: 0.75 },
          { opacity: 0.9, ease: 'none', duration: 1 },
          0
        )
      }

      // 4. THE BLACK TITLE DOES NOT DISAPPEAR: It smoothly scales & centers into the Wedding Hero Page Title
      tl.fromTo(
        titleRef.current,
        {
          scale: 0.85,
          y: 0,
        },
        {
          scale: 1.15,
          y: -12,
          ease: 'power2.out',
          duration: 1,
        },
        0
      )

      // 5. Editorial Subtitle ("Your day, quietly unforgettable.") settles in
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 0, opacity: 0.8 },
          { y: -16, opacity: 1, ease: 'power2.out', duration: 1 },
          0
        )
      }

      // 6. Lead text and CTAs spread out into full-screen hero proportions
      if (leadRef.current) {
        tl.fromTo(
          leadRef.current,
          { y: 0 },
          { y: 12, ease: 'power2.out', duration: 1 },
          0
        )
      }

      if (ctasRef.current) {
        tl.fromTo(
          ctasRef.current,
          { y: 0 },
          { y: 18, ease: 'power2.out', duration: 1 },
          0
        )
      }

      if (scrollCueRef.current) {
        tl.to(scrollCueRef.current, { opacity: 0, duration: 0.3 }, 0.6)
      }
    }, pinSectionRef)

    return () => ctx.revert()
  }, [router])

  return (
    <section
      ref={pinSectionRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-ink-950 select-none"
      aria-label="Direct Wedding Hero Portal"
    >
      {/* Ambient background glow */}
      <div
        className="absolute w-[900px] h-[500px] rounded-full bg-gradient-to-r from-[#F6F0E6]/20 via-[#8FA98A]/15 to-[#E8D5C4]/20 blur-3xl pointer-events-none -top-20"
        aria-hidden="true"
      />

      {/* The Direct Wedding Hero Container: Stretches from Card to 100vw x 100vh */}
      <div
        ref={stretchCardRef}
        className="relative mx-auto overflow-hidden border border-[#E3DACB]/80 flex items-center justify-center origin-center cursor-pointer transition-shadow"
        onClick={() => router.push('/wedding')}
        style={{
          width: '90%',
          maxWidth: '1240px',
          height: '520px',
          borderRadius: '2.5rem',
          backgroundColor: '#F6F0E6',
        }}
      >
        {/* Background Wedding Video (wedding.mp4) with floral arch and aisle */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              isVideoLoaded ? 'opacity-85' : 'opacity-60'
            }`}
          >
            <source src="/media/wedding.mp4" type="video/mp4" />
          </video>
        </div>

        {/* White Cream Shader Glass Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 pointer-events-none hero-video-overlay-light"
          aria-hidden="true"
        />

        {/* Direct Wedding Hero Content: Black color font with editorial styling */}
        <div
          ref={heroContentRef}
          className="relative z-20 max-w-5xl mx-auto px-6 sm:px-12 py-16 text-center flex flex-col items-center justify-center text-[#1C1A17]"
        >
          {/* Editorial Subtitle */}
          <p
            ref={subtitleRef}
            className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#3D3630] mb-3 tracking-wide"
          >
            Your day, quietly unforgettable.
          </p>

          {/* Wedding Hero Title: Deep Black color font that expands into the Wedding Hero Title */}
          <h1
            ref={titleRef}
            className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#111111] tracking-tight leading-[0.9] mb-6 origin-center select-none"
          >
            Wedding
          </h1>

          {/* Lead Text */}
          <p
            ref={leadRef}
            className="body-lg text-[#3D3630] max-w-2xl mx-auto mb-8 font-body leading-relaxed font-medium"
          >
            Curated botanical architecture, palace acoustics, and seamless multi-day coordination.
          </p>

          {/* CTAs */}
          <div
            ref={ctasRef}
            className="flex flex-wrap items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/wedding"
              className="px-8 py-4 rounded-full bg-[#8FA98A] text-white font-body font-bold text-sm tracking-wide hover:brightness-105 shadow-md transition-all flex items-center gap-2 group"
            >
              <span>Curate Wedding Plan</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <Link
              href="/wedding#timeline"
              className="px-7 py-4 rounded-full border border-[#1C1A17]/30 bg-[#F6F0E6]/80 backdrop-blur-md text-[#1C1A17] font-body font-semibold text-sm hover:bg-white/70 transition-all"
            >
              Explore Ceremonies
            </Link>
          </div>
        </div>

        {/* Scroll To Enter Indicator */}
        <div
          ref={scrollCueRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none"
        >
          <span className="label-mono text-[10px] text-[#554C44] tracking-widest uppercase font-semibold">
            SCROLL TO ENTER WEDDING ESTATE
          </span>
          <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#1C1A17] to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
