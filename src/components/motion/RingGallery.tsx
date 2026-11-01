'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { solveAngles, CardPlacement, solveCenterStep } from '@/lib/projectedRing'

export interface RingGalleryItem {
  id: string
  title: string
  subtitle: string
  category: string
  image: string
  stats?: string
}

interface RingGalleryProps {
  items: RingGalleryItem[]
  heading?: string
  title?: string
  subheading?: string
}

export default function RingGallery({
  items,
  heading = 'CURATED VENUE SHOWCASE',
  title = 'Portraits of Mastercrafted Nights',
  subheading = 'Drag, scroll or use arrow keys to rotate the 3D gallery',
}: RingGalleryProps) {
  const count = items.length

  // Dimensions based on viewport (B2: 1440 desktop R=900, c=200, f=1000, cardW=300; 390 mobile R=420, cardW=150)
  const [params, setParams] = useState({
    R: 900,
    c: 200,
    f: 1000,
    cardW: 300,
    gap: 32,
  })

  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  rotationRef.current = rotation

  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isInView, setIsInView] = useState(true)

  // Drag interaction with inertia (B5)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartXRef = useRef(0)
  const dragStartRotRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)

  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // Viewport resize listener
  useEffect(() => {
    const updateParams = () => {
      const w = window.innerWidth
      if (w < 640) {
        // Mobile (390px spec)
        setParams({ R: 420, c: 200, f: 1000, cardW: 150, gap: 16 })
      } else if (w < 1024) {
        // Tablet
        setParams({ R: 680, c: 200, f: 1000, cardW: 230, gap: 24 })
      } else {
        // Desktop (1440px / 1920px spec)
        setParams({ R: 900, c: 200, f: 1000, cardW: 300, gap: 32 })
      }
    }

    updateParams()
    window.addEventListener('resize', updateParams)
    return () => window.removeEventListener('resize', updateParams)
  }, [])

  // IntersectionObserver to pause auto-rotate when out of view (B5)
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { rootMargin: '100px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Idle auto-rotate 0.02 rad/s paused on hover, drag, or out of view (B5)
  useEffect(() => {
    if (isHovered || isDragging || !isInView) return

    let lastTimestamp = performance.now()
    const autoRotateLoop = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000
      lastTimestamp = now

      // 0.02 rad/s
      setRotation((prev) => prev - 0.02 * deltaSec)
      animFrameRef.current = requestAnimationFrame(autoRotateLoop)
    }

    animFrameRef.current = requestAnimationFrame(autoRotateLoop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isHovered, isDragging, isInView])

  // Inertia decay on pointer up
  const applyInertia = useCallback(() => {
    let vel = velocityRef.current
    if (Math.abs(vel) < 0.0001) return

    let lastT = performance.now()
    const inertiaStep = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now

      // Exponential decay
      vel *= Math.exp(-4 * dt)
      setRotation((prev) => prev + vel * dt)

      if (Math.abs(vel) > 0.0005) {
        animFrameRef.current = requestAnimationFrame(inertiaStep)
      }
    }
    animFrameRef.current = requestAnimationFrame(inertiaStep)
  }, [])

  // Pointer Drag Handlers (B5)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    dragStartRotRef.current = rotationRef.current
    lastXRef.current = e.clientX
    lastTimeRef.current = performance.now()
    velocityRef.current = 0

    if (stageRef.current) {
      stageRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const now = performance.now()
    const dx = e.clientX - lastXRef.current
    const dt = Math.max((now - lastTimeRef.current) / 1000, 0.008)

    // Sensitivity: convert screen pixels to angle in radians
    const radPerPx = (0.5 * Math.PI) / (params.R * 1.5)
    const instantVelocity = (dx * radPerPx) / dt
    velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6

    lastXRef.current = e.clientX
    lastTimeRef.current = now

    const totalDx = e.clientX - dragStartXRef.current
    setRotation(dragStartRotRef.current + totalDx * radPerPx)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    if (stageRef.current) {
      try {
        stageRef.current.releasePointerCapture(e.pointerId)
      } catch (err) {
        // ignore
      }
    }
    applyInertia()
  }

  // Wheel Handler: passive, only rotates when over stage; prevents scroll only if horizontal delta dominates (B5)
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault()
      const radPerPx = 0.002
      setRotation((prev) => prev - e.deltaX * radPerPx)
    } else if (e.shiftKey) {
      e.preventDefault()
      const radPerPx = 0.002
      setRotation((prev) => prev - e.deltaY * radPerPx)
    }
  }

  // Keyboard Navigation: Arrow Left/Right (B5)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = solveCenterStep(params.cardW, params.gap, params.R, params.c, params.f)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setRotation((prev) => prev - step)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setRotation((prev) => prev + step)
    }
  }

  // Click card to center it (B5)
  const handleCardClick = (cardTheta: number, cardIdx: number) => {
    setActiveCardIndex(cardIdx)
    // Smoothly rotate by -cardTheta to bring it to center (theta = 0)
    const startRot = rotationRef.current
    const targetRot = startRot - cardTheta
    const duration = 500
    const startT = performance.now()

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    const tweenStep = (now: number) => {
      const p = Math.min((now - startT) / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - p, 3)
      setRotation(startRot + (targetRot - startRot) * ease)

      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(tweenStep)
      }
    }

    animFrameRef.current = requestAnimationFrame(tweenStep)
  }

  // Solve exact card positions for the current rotation frame (B3)
  const cardPlacements = solveAngles(
    count,
    params.R,
    params.c,
    params.f,
    params.cardW,
    params.gap,
    rotation
  )

  const cardH = Math.round(params.cardW * (4 / 3))

  return (
    <section
      ref={sectionRef}
      className="relative z-10 isolate w-full overflow-hidden select-none bg-ink-950 text-ivory-50 pt-28 pb-24"
      style={{
        scrollMarginTop: '104px', // B1: scroll-margin-top >= navbar height + 24px
      }}
      aria-label="3D Ring Gallery"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <p className="label-mono text-accent mb-3 tracking-widest uppercase">{heading}</p>
        <h2 className="h2 mb-4 text-white drop-shadow">{title}</h2>
        <p className="body-default text-muted max-w-xl mx-auto">{subheading}</p>
      </div>

      {/* Stage: B1 Perspective on the stage (perspective: 1000px, perspective-origin: 50% 50%) */}
      <div
        ref={stageRef}
        role="listbox"
        aria-activedescendant={`card-item-${activeCardIndex}`}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing outline-none"
        style={{
          height: 'clamp(520px, 70vh, 760px)', // B1 clamp
          perspective: `${params.f}px`,
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Ring Wrapper: B1 transform-style: preserve-3d */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {items.map((item, idx) => {
            const placement: CardPlacement | undefined = cardPlacements[idx]
            if (!placement || !placement.visible) {
              return null
            }

            const { x, z, rotateY, opacity, zIndex, theta } = placement

            return (
              <div
                key={item.id}
                id={`card-item-${idx}`}
                role="option"
                aria-selected={idx === activeCardIndex}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick(theta, idx)
                }}
                className="absolute rounded-[20px] overflow-hidden border border-white/[0.12] bg-ink-900 shadow-2xl transition-colors duration-200 hover:border-accent group cursor-pointer pointer-events-auto"
                style={{
                  // B1 Origin at stage centre
                  left: '50%',
                  top: '50%',
                  width: `${params.cardW}px`,
                  aspectRatio: '3/4',
                  marginLeft: `${-params.cardW / 2}px`,
                  marginTop: `${-cardH / 2}px`,
                  // B1 3D transform & preserve-3d
                  transform: `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${rotateY.toFixed(2)}deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  willChange: 'transform', // B4: only set will-change: transform
                  zIndex,
                  opacity, // B4: edge cards 1.0, middle 0.9, never below 0.7
                }}
              >
                {/* Media Image */}
                <div className="relative w-full h-full bg-ink-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy" // B4
                    decoding="async" // B4
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />

                  {/* B4: Caption in bottom gradient bar with font-size 14-16px; does not shrink with depth */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-1 text-left bg-gradient-to-t from-ink-950/95 via-ink-950/70 to-transparent">
                    <span className="label-mono text-accent text-[11px] font-semibold tracking-wider uppercase">
                      {item.category}
                    </span>
                    <h4 className="font-display font-bold text-[15px] sm:text-[16px] text-white leading-tight group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-ivory-50/75 line-clamp-2 mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>
                    {item.stats && (
                      <span className="label-mono text-ivory-50/60 text-[11px] mt-1 pt-1.5 border-t border-white/10">
                        {item.stats}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            const step = solveCenterStep(params.cardW, params.gap, params.R, params.c, params.f)
            setRotation((p) => p + step)
          }}
          className="p-3 rounded-full border border-ink-700 bg-ink-900/80 hover:border-accent text-ivory-50 transition-colors"
          aria-label="Previous card in ring gallery"
        >
          ←
        </button>
        <span className="label-mono text-muted text-xs">
          Interactive 3D Ring · {count} Curated Venues
        </span>
        <button
          onClick={() => {
            const step = solveCenterStep(params.cardW, params.gap, params.R, params.c, params.f)
            setRotation((p) => p - step)
          }}
          className="p-3 rounded-full border border-ink-700 bg-ink-900/80 hover:border-accent text-ivory-50 transition-colors"
          aria-label="Next card in ring gallery"
        >
          →
        </button>
      </div>
    </section>
  )
}
