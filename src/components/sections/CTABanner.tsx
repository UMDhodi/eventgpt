'use client'

import React from 'react'
import Link from 'next/link'

interface CTABannerProps {
  heading?: string
  subheading?: string
  ctaText?: string
  ctaHref?: string
  accentLabel?: string
}

export default function CTABanner({
  heading = 'Stage Your Next Masterpiece',
  subheading = 'Connect with EventGpt to orchestrate sound, botanical decor, and predictive run-of-shows in minutes.',
  ctaText = 'Chat with AI Producer',
  ctaHref = '/chat',
  accentLabel = 'LIMITED 2026/2027 PRODUCTION CALENDAR',
}: CTABannerProps) {
  return (
    <section className="relative w-full h-[640px] flex items-center justify-center overflow-hidden select-none">
      {/* Background with page glow gradient drift */}
      <div
        className="absolute inset-0 z-0 opacity-85 transition-all duration-700"
        style={{
          background: 'var(--glow)',
        }}
        aria-hidden="true"
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-3xl" aria-hidden="true" />

      {/* Floating Ambient Mesh */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent-2/20 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        <span className="label-mono text-accent text-xs px-3.5 py-1.5 rounded-full bg-ink-900/80 border border-ink-700 mb-6 backdrop-blur-md">
          {accentLabel}
        </span>

        <h2 className="h1 text-white mb-6 tracking-tight max-w-3xl">
          {heading}
        </h2>

        <p className="body-lg text-ivory-50/80 max-w-xl mb-10 leading-relaxed font-body">
          {subheading}
        </p>

        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center h-16 px-10 rounded-full bg-white text-ink-950 font-display font-extrabold text-lg tracking-wide shadow-2xl hover:scale-105 hover:bg-ivory-50 hover:shadow-accent-glow transition-all"
        >
          {ctaText} →
        </Link>
      </div>
    </section>
  )
}

