'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'
import { useTransitionStore } from '@/store/transitionStore'

interface LenisContextType {
  lenis: Lenis | null
  stopLenis: () => void
  startLenis: () => void
  scrollTo: (target: number | string | HTMLElement, options?: { immediate?: boolean; offset?: number; duration?: number; force?: boolean }) => void
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  stopLenis: () => {},
  startLenis: () => {},
  scrollTo: () => {},
})

export function useLenis() {
  return useContext(LenisContext)
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()
  const state = useTransitionStore((s) => s.state)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Manual scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.9,
      duration: 1.2,
      smoothWheel: true,
    })

    lenisRef.current = lenis
    setLenisInstance(lenis)
    if (typeof window !== 'undefined') {
      ;(window as any).__lenis = lenis
    }

    // LENIS + GSAP SYNC (Required)
    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh()
      })
    }

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
      lenisRef.current = null
      setLenisInstance(null)
    }
  }, [])

  // Automatically lock Lenis during committing / arriving / returning, start when idle
  useEffect(() => {
    if (!lenisRef.current) return
    if (state === 'committing' || state === 'arriving' || state === 'returning') {
      lenisRef.current.stop()
    } else if (state === 'idle') {
      lenisRef.current.start()
    }
  }, [state])

  // On every route change: ensure Lenis is started, reset to top, unlock state, then ScrollTrigger.refresh()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
      if (lenisRef.current) {
        lenisRef.current.start()
        lenisRef.current.scrollTo(0, { immediate: true, force: true })
      }
      // Ensure any lingering transition locking states are unlocked on route change
      const curState = useTransitionStore.getState().state
      if (curState !== 'idle') {
        useTransitionStore.getState().setState('idle')
      }
      // Give DOM time to settle before refreshing ScrollTriggers
      const timer = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const stopLenis = useCallback(() => {
    lenisRef.current?.stop()
  }, [])

  const startLenis = useCallback(() => {
    lenisRef.current?.start()
  }, [])

  const scrollTo = useCallback((
    target: number | string | HTMLElement,
    options?: { immediate?: boolean; offset?: number; duration?: number; force?: boolean }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options)
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: options?.immediate ? 'instant' : 'smooth' })
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      lenis: lenisInstance,
      stopLenis,
      startLenis,
      scrollTo,
    }),
    [lenisInstance, stopLenis, startLenis, scrollTo]
  )

  return (
    <LenisContext.Provider value={value}>
      {children}
    </LenisContext.Provider>
  )
}
