'use client'

import { create } from 'zustand'

export type TransitionState = 'idle' | 'diving' | 'committing' | 'arriving' | 'returning'

interface Point {
  x: number
  y: number
}

interface TransitionStore {
  state: TransitionState
  counterCenter: Point
  burstProgress: number // 0 to 1
  armed: boolean // Armed for return on Concert page after cooldown

  // State actions
  setState: (state: TransitionState) => void
  setCounterCenter: (center: Point) => void
  setBurstProgress: (progress: number) => void
  setArmed: (armed: boolean) => void

  // Navigation actions (ONLY places allowed to navigate)
  commit: (navigate: () => void) => boolean
  returnHome: (navigate: () => void) => boolean
  finishArriving: () => void
  finishReturning: () => void
}

export const useTransitionStore = create<TransitionStore>((set, get) => ({
  state: 'idle',
  counterCenter: { x: 720, y: 450 }, // SSR-safe default; updated client-side by PortalStage
  burstProgress: 0,
  armed: false,

  setState: (state) => set({ state }),
  setCounterCenter: (counterCenter) => set({ counterCenter }),
  setBurstProgress: (burstProgress) => set({ burstProgress }),
  setArmed: (armed) => set({ armed }),

  commit: (navigate) => {
    const { state } = get()
    // Guard: Only idle or diving may transition to committing, once
    if (state !== 'idle' && state !== 'diving') {
      return false
    }

    set({ state: 'committing', burstProgress: 1, armed: false })
    navigate()
    return true
  },

  returnHome: (navigate) => {
    const { state, armed } = get()
    // Guard: Only armed idle state on Concert page may return
    if (state !== 'idle' || !armed) {
      return false
    }

    set({ state: 'returning', burstProgress: 1, armed: false })
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('portal:return', '1')
      } catch (e) {
        // ignore storage errors
      }
    }
    navigate()
    return true
  },

  finishArriving: () => {
    set({ state: 'idle', burstProgress: 0 })
  },

  finishReturning: () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('portal:return')
      } catch (e) {
        // ignore
      }
    }
    set({ state: 'idle', burstProgress: 0, armed: false })
  },
}))

