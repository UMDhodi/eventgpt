'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlanRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/chat')
  }, [router])

  return (
    <div className="w-full min-h-screen bg-ink-950 flex flex-col items-center justify-center text-white font-mono gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-mint border-t-transparent animate-spin" />
      <span className="text-xs text-mint tracking-wider uppercase">
        Connecting to EventGpt Chat Intelligence...
      </span>
    </div>
  )
}
