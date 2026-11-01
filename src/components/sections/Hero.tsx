'use client'

import React from 'react'
import Link from 'next/link'
import PortalHeading from '@/components/motion/PortalHeading'

interface HeroProps {
  videoSrc: string
  word: string
  targetLetter: string
  nextHref: string
  nextTheme: string
  nextLabel?: string
  leadText: string
  primaryCtaText?: string
  primaryCtaHref?: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  centerAlign?: boolean
  editorialSubtitle?: string
  isLightWedding?: boolean
}

export default function Hero({
  videoSrc,
  word,
  targetLetter,
  nextHref,
  nextTheme,
  nextLabel,
  leadText,
  primaryCtaText = 'Plan with AI',
  primaryCtaHref = '/chat',
  secondaryCtaText = 'Explore venues',
  secondaryCtaHref = '/music-concert',
  centerAlign = true,
  editorialSubtitle,
  isLightWedding = false,
}: HeroProps) {
  return (
    <section
      className={`relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden ${
        isLightWedding ? 'bg-[#F6F0E6] text-[#1C1A17]' : 'bg-ink-950 text-white'
      }`}
    >
      {/* Background Looping Video with 45% Ink Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover scale-105 filter brightness-95"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div
          className={`absolute inset-0 ${
            isLightWedding ? 'hero-video-overlay-light' : 'hero-video-overlay'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Content Container */}
      <div
        className={`relative z-10 max-w-6xl mx-auto px-6 py-28 flex flex-col ${
          centerAlign ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        {/* Optional Editorial Subtitle (Handbook 7.3 for Wedding) */}
        {editorialSubtitle && (
          <p
            className={`serif-italic text-2xl sm:text-3xl mb-4 tracking-wide ${
              isLightWedding ? 'text-[#3D3630]' : 'text-ivory-50/90'
            }`}
          >
            {editorialSubtitle}
          </p>
        )}

        {/* Signature Feature 1: Letter-Portal Zoom */}
        <div className="mb-6 w-full flex justify-center">
          <PortalHeading
            word={word}
            target={targetLetter}
            nextHref={nextHref}
            nextTheme={nextTheme}
            nextLabel={nextLabel}
            className={`display-xxl ${isLightWedding ? '!text-[#111111]' : 'text-white'}`}
          />
        </div>

        {/* Lead Text */}
        <p
          className={`body-lg max-w-2xl mb-10 leading-relaxed font-body ${
            isLightWedding ? 'text-[#3D3630]' : 'text-white/85'
          }`}
        >
          {leadText}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryCtaHref}
            className={
              isLightWedding
                ? 'px-8 py-4 rounded-full bg-[#8FA98A] text-white font-body font-bold text-sm tracking-wide hover:brightness-105 shadow-md transition-all'
                : 'btn-primary'
            }
          >
            {primaryCtaText}
          </Link>
          <Link
            href={secondaryCtaHref}
            className={
              isLightWedding
                ? 'px-7 py-4 rounded-full border border-[#1C1A17]/30 bg-[#F6F0E6]/80 backdrop-blur-md text-[#1C1A17] font-body font-semibold text-sm hover:bg-white/70 transition-all'
                : 'btn-secondary'
            }
          >
            {secondaryCtaText}
          </Link>
        </div>
      </div>

      {/* Animated Scroll Cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-80"
        aria-hidden="true"
      >
        <span className="label-mono text-[10px] text-ivory-50/70 tracking-widest uppercase">
          SCROLL TO DIVE
        </span>
        <div className="w-[1.5px] h-8 bg-gradient-to-b from-white via-accent to-transparent animate-pulse" />
      </div>
    </section>
  )
}

