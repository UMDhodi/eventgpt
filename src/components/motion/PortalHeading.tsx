'use client'

import React from 'react'

interface PortalHeadingProps {
  word: string
  target?: string
  nextHref?: string
  nextTheme?: string
  nextLabel?: string
  className?: string
  onZoomStart?: () => void
}

/**
 * PortalHeading for secondary pages.
 * Per specification: Other pages' portal transitions are DISABLED (not rendered)
 * until explicitly requested, preventing accidental cascade navigation and scroll jumps.
 */
export default function PortalHeading({
  word,
  className = '',
}: PortalHeadingProps) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <h1
        className={`font-display font-extrabold text-white tracking-tight select-none ${className}`}
      >
        {word}
      </h1>
    </div>
  )
}
