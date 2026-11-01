'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface QuoteItem {
  id: string
  quote: string
  name: string
  role: string
  eventType: string
  avatar: string
  rating?: number
}

interface QuoteDeckProps {
  quotes: QuoteItem[]
  heading?: string
  subheading?: string
}

export default function QuoteDeck({
  quotes,
  heading = 'THE PRODUCER DISPATCHES',
  subheading = 'Real words from hosts, couples, and creative directors',
}: QuoteDeckProps) {
  const [active, setActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const count = quotes.length
  const dragStartXRef = useRef(0)

  // Autoplay every 5s, loop
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % count)
    }, 5000)
    return () => clearInterval(timer)
  }, [count, isHovered])

  const handleNext = () => setActive((prev) => (prev + 1) % count)
  const handlePrev = () => setActive((prev) => (prev - 1 + count) % count)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'ArrowLeft') handlePrev()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartXRef.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const delta = e.clientX - dragStartXRef.current
    if (delta > 60) handlePrev()
    else if (delta < -60) handleNext()
  }

  return (
    <section
      className="relative z-10 isolate w-full py-24 overflow-hidden bg-ink-950 text-ivory-50 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Testimonial Quote Deck"
    >
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <p className="label-mono text-accent mb-3">{heading}</p>
        <h2 className="h2 mb-4">Quietly Unforgettable Experiences</h2>
        <p className="body-default text-muted max-w-lg mx-auto">{subheading}</p>
      </div>

      {/* Fanned Cards Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative h-[360px] max-w-4xl mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {quotes.map((item, i) => {
          const k = i - active
          const absK = Math.abs(k)

          // Mathematical model from handbook 6.2:
          // translateX = k * 0.28 * cardWidth
          // rotateZ = k * 6deg
          // scale = 1 - 0.12 * |k|
          // opacity = 1 - 0.25 * |k|
          // zIndex = 100 - |k|
          const cardWidth = 420
          const translateX = k * 0.28 * cardWidth
          const rotateZ = k * 6
          const scale = Math.max(1 - 0.12 * absK, 0.65)
          const opacity = Math.max(1 - 0.25 * absK, 0)
          const zIndex = 20 - absK

          if (absK > 2) return null // Only show active and near neighbors

          const isActive = k === 0

          return (
            <motion.div
              key={item.id}
              onClick={() => setActive(i)}
              className="absolute w-[360px] sm:w-[420px] p-8 rounded-3xl border border-ink-700 bg-ink-900 shadow-2xl transition-colors cursor-pointer"
              style={{
                zIndex,
                boxShadow: isActive
                  ? '0 24px 60px -10px rgba(0,0,0,0.8), 0 0 60px rgba(var(--accent-rgb), 0.2)'
                  : '0 12px 30px rgba(0,0,0,0.5)',
                borderColor: isActive ? 'var(--accent)' : '#2A2636',
              }}
              animate={{
                x: translateX,
                rotateZ: rotateZ,
                scale: scale,
                opacity: opacity,
                filter: absK > 0 ? 'blur(1.5px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              role="article"
              aria-live={isActive ? 'polite' : 'off'}
            >
              {/* Star Rating & Event Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="label-mono text-accent text-xs px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                  {item.eventType}
                </span>
                <span className="text-amber-400 text-sm tracking-widest">★★★★★</span>
              </div>

              {/* Quote text */}
              <blockquote className="serif-italic text-lg sm:text-xl text-ivory-50/95 leading-relaxed mb-6">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-ink-700/60">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-accent/40"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">
                    {item.name}
                  </h4>
                  <p className="caption text-muted text-xs">{item.role}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom Deck Controls */}
      <div className="flex items-center justify-center gap-6 mt-12">
        <button
          onClick={handlePrev}
          className="h-11 w-11 rounded-full border border-ink-700 bg-ink-900 flex items-center justify-center text-ivory-50 hover:border-accent hover:text-accent transition-colors focus-visible:outline-accent"
          aria-label="Previous quote"
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          {quotes.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => setActive(dotIndex)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === active ? 'w-6 bg-accent' : 'w-2 bg-ink-700'
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="h-11 w-11 rounded-full border border-ink-700 bg-ink-900 flex items-center justify-center text-ivory-50 hover:border-accent hover:text-accent transition-colors focus-visible:outline-accent"
          aria-label="Next quote"
        >
          →
        </button>
      </div>
    </section>
  )
}

