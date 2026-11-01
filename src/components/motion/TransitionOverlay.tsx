'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { usePathname } from 'next/navigation'
import { useTransitionStore } from '@/store/transitionStore'

export default function TransitionOverlay() {
  const { state } = useTransitionStore()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const burstCoreRef = useRef<HTMLDivElement | null>(null)
  const pulseTweenRef = useRef<gsap.core.Tween | null>(null)

  // Guarantee overlay and burst are completely hidden whenever route changes
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0'
      overlayRef.current.style.visibility = 'hidden'
    }
    if (burstCoreRef.current) {
      burstCoreRef.current.style.opacity = '0'
      burstCoreRef.current.style.transform = 'scale(0.4)'
    }
    if (pulseTweenRef.current) {
      pulseTweenRef.current.kill()
      pulseTweenRef.current = null
    }
  }, [pathname])

  // Watchdog: If state stays in 'committing' > 800ms (e.g. slow network), pulse gently so screen is alive
  useEffect(() => {
    if (state === 'committing') {
      const timer = setTimeout(() => {
        if (useTransitionStore.getState().state === 'committing' && burstCoreRef.current) {
          pulseTweenRef.current = gsap.to(burstCoreRef.current, {
            scale: 1.15,
            opacity: 0.85,
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        }
      }, 800)

      return () => {
        clearTimeout(timer)
        if (pulseTweenRef.current) {
          pulseTweenRef.current.kill()
          pulseTweenRef.current = null
        }
      }
    } else {
      if (pulseTweenRef.current) {
        pulseTweenRef.current.kill()
        pulseTweenRef.current = null
      }
    }
  }, [state])

  return (
    <div
      id="portal-transition-overlay"
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        opacity: 0,
        visibility: 'hidden',
        willChange: 'opacity',
      }}
      aria-hidden="true"
    >
      {/* 1. Underlying Dark Cover (#0B0A10) */}
      <div className="absolute inset-0 bg-[#0B0A10]" />

      {/* 2. Static Radial Light Burst */}
      <div
        id="portal-transition-burst"
        ref={burstCoreRef}
        className="absolute inset-0 origin-center"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #0B0A10 0%, #7B4DFF 42%, #2FA8FF 72%, #0B0A10 100%)',
          willChange: 'opacity, transform',
        }}
      />
    </div>
  )
}
