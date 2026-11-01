'use client'

import React, { useState, useEffect } from 'react'

export interface PlanData {
  eventType: string
  city: string
  date?: string
  guests: string
  budget: string
  vibe: string
  status?: string
}

interface MiniPrinterProps {
  plan: PlanData
  isPrinting?: boolean
  onTogglePrint?: (printing: boolean) => void
}

export function calculateBudgetSplits(budgetStr: string) {
  let totalRupees = 500000
  const lakhMatch = budgetStr?.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i)
  const crMatch = budgetStr?.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i)
  const numClean = budgetStr?.replace(/[^\d.]/g, '')

  if (lakhMatch) {
    totalRupees = parseFloat(lakhMatch[1]) * 100000
  } else if (crMatch) {
    totalRupees = parseFloat(crMatch[1]) * 10000000
  } else if (numClean && parseFloat(numClean) > 1000) {
    totalRupees = parseFloat(numClean)
  }

  const formatInr = (val: number) =>
    '₹' + Math.round(val).toLocaleString('en-IN')

  return {
    rawTotal: totalRupees,
    total: formatInr(totalRupees),
    venue: formatInr(totalRupees * 0.35),
    catering: formatInr(totalRupees * 0.35),
    production: formatInr(totalRupees * 0.18),
    logistics: formatInr(totalRupees * 0.12),
  }
}

// Subtle mechanical thermal printer sound simulation using pure Web Audio API
function playPrinterSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // 8 stepped stepper-motor micro pulses over 1.8s
    for (let i = 0; i < 8; i++) {
      const clickTime = now + i * 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320 + (i % 2) * 110, clickTime)
      osc.frequency.exponentialRampToValueAtTime(60, clickTime + 0.05)

      gain.gain.setValueAtTime(0.04, clickTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(clickTime)
      osc.stop(clickTime + 0.055)
    }
  } catch {}
}

export default function MiniPrinter({
  plan,
  isPrinting: controlledPrinting,
  onTogglePrint,
}: MiniPrinterProps) {
  const [internalPrinting, setInternalPrinting] = useState(false)
  const [statusText, setStatusText] = useState<'offline' | 'printing...' | 'ready'>('offline')
  const [timestamp, setTimestamp] = useState('09:41')

  const isPrinting = controlledPrinting !== undefined ? controlledPrinting : internalPrinting

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])

  // Sync external print trigger from chat
  useEffect(() => {
    if (controlledPrinting) {
      setStatusText('printing...')
      playPrinterSound()
      const timer = setTimeout(() => {
        setStatusText('ready')
      }, 2100)
      return () => clearTimeout(timer)
    } else {
      setStatusText('offline')
    }
  }, [controlledPrinting])

  const handleToggle = () => {
    if (isPrinting) {
      setInternalPrinting(false)
      setStatusText('offline')
      onTogglePrint?.(false)
    } else {
      setInternalPrinting(true)
      setStatusText('printing...')
      playPrinterSound()
      onTogglePrint?.(true)
      setTimeout(() => {
        setStatusText('ready')
      }, 2100)
    }
  }

  const budgetSplits = calculateBudgetSplits(plan.budget)

  const handleDownloadBlueprint = () => {
    const textContent = `================================================
EVENTGPT EXECUTIVE BLUEPRINT & RECEIPT
================================================
Generated: ${new Date().toLocaleString()}

EVENT SPECIFICATIONS:
- Event Profile:    ${plan.eventType || 'Bespoke Celebration'}
- Destination:      ${plan.city || 'New Delhi NCR'}
- Attendees:        ${plan.guests || '100 Guests'}
- Aesthetic Vibe:   ${plan.vibe || 'Curated Editorial Luxury'}
- Target Budget:    ${budgetSplits.total}

ITEMIZED BUDGET ALLOCATION:
1. Venue & Private Hire (35%):          ${budgetSplits.venue}
2. Gastronomy & Hospitality (35%):     ${budgetSplits.catering}
3. Audio, Lighting & Rig (18%):        ${budgetSplits.production}
4. Logistics & Concierge (12%):        ${budgetSplits.logistics}
------------------------------------------------
TOTAL TARGET ESTIMATE:                  ${budgetSplits.total}
================================================
Produced by EventGpt Executive Intelligence
================================================`

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EventGpt-Blueprint-${(plan.city || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full flex flex-col items-center">
      <style jsx>{`
        @keyframes printerJitter {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          20% {
            transform: translateY(-0.8px) rotate(-0.3deg);
          }
          40% {
            transform: translateY(0.6px) rotate(0.2deg);
          }
          60% {
            transform: translateY(-0.5px) rotate(-0.2deg);
          }
          80% {
            transform: translateY(0.4px) rotate(0.1deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        @keyframes laserGlow {
          0% {
            box-shadow: 0 0 4px #39ff14, inset 0 0 2px #39ff14;
          }
          50% {
            box-shadow: 0 0 12px #39ff14, inset 0 0 6px #39ff14;
          }
          100% {
            box-shadow: 0 0 4px #39ff14, inset 0 0 2px #39ff14;
          }
        }

        @keyframes stepperThermalFeed {
          0% {
            max-height: 0px;
            transform: translateY(-60px);
            opacity: 0;
          }
          12% {
            max-height: 60px;
            transform: translateY(-45px);
            opacity: 1;
          }
          25% {
            max-height: 110px;
            transform: translateY(-32px);
          }
          40% {
            max-height: 180px;
            transform: translateY(-18px);
          }
          58% {
            max-height: 260px;
            transform: translateY(-10px);
          }
          75% {
            max-height: 350px;
            transform: translateY(-4px);
          }
          90% {
            max-height: 420px;
            transform: translateY(-1px);
          }
          100% {
            max-height: 480px;
            transform: translateY(0px);
            opacity: 1;
          }
        }

        .printer-active-jitter {
          animation: printerJitter 0.12s infinite ease-in-out;
        }

        .printer-laser-active {
          animation: laserGlow 0.4s infinite alternate ease-in-out;
        }

        .paper-thermal-feed {
          animation: stepperThermalFeed 2s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
        }
      `}</style>

      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-ink-700/60">
        <span className="label-mono text-mint text-xs">HARDWARE PRINTER</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ink-950 border border-ink-700 text-[10px] font-mono text-mint">
          <span className={`w-1.5 h-1.5 rounded-full ${isPrinting ? 'bg-mint animate-pulse' : 'bg-muted'}`} />
          {statusText.toUpperCase()}
        </span>
      </div>

      {/* Printer Container */}
      <div className="relative w-full max-w-[310px] flex flex-col items-center select-none font-mono">
        {/* Top Printer Hardware Cap */}
        <div
          className={`relative w-full h-[72px] bg-gradient-to-b from-[#2a2a2a] to-[#1c1c1c] border border-[#333333] rounded-xl shadow-2xl z-20 flex items-center justify-between px-4 box-border ${
            statusText === 'printing...' ? 'printer-active-jitter' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-[#999]">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isPrinting
                  ? 'bg-[#39ff14] shadow-[0_0_12px_#39ff14] animate-pulse'
                  : 'bg-[#444]'
              }`}
            />
            <span className="font-mono text-[11px] tracking-wide text-[#ccc]">
              {statusText}
            </span>
          </div>

          <span className="text-[10px] font-mono text-mint/80 uppercase tracking-widest border border-mint/20 px-2 py-0.5 rounded-md bg-mint/5">
            EventGpt 4.0
          </span>

          {/* Paper slot cut-out with thermal printhead glow */}
          <div
            className={`absolute bottom-0 left-[5%] w-[90%] h-[4px] rounded-t-sm transition-all duration-300 ${
              statusText === 'printing...'
                ? 'bg-[#39ff14] printer-laser-active'
                : 'bg-[#0b0b0b]'
            }`}
          />
        </div>

        {/* Animated Receipt Paper with Real Stepper Thermal Motion */}
        <div
          className={`relative w-[88%] bg-[#f4f3ef] text-[#111111] box-border px-3.5 pt-4 pb-6 text-xs font-semibold z-10 overflow-hidden shadow-2xl ${
            isPrinting
              ? 'opacity-100 max-h-[480px] translate-y-0 paper-thermal-feed'
              : 'opacity-0 max-h-0 -translate-y-16'
          }`}
          style={{
            clipPath:
              'polygon(0% 0%, 100% 0%, 100% calc(100% - 10px), 95% 100%, 90% calc(100% - 10px), 85% 100%, 80% calc(100% - 10px), 75% 100%, 70% calc(100% - 10px), 65% 100%, 60% calc(100% - 10px), 55% 100%, 50% calc(100% - 10px), 45% 100%, 40% calc(100% - 10px), 35% 100%, 30% calc(100% - 10px), 25% 100%, 20% calc(100% - 10px), 15% 100%, 10% calc(100% - 10px), 5% 100%, 0% calc(100% - 10px))',
          }}
        >
          <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono tracking-wider">
            <span>EVENTGPT · BLUEPRINT</span>
            <span>{timestamp}</span>
          </div>

          <div className="border-b border-dashed border-gray-400 my-2" />

          <div className="flex justify-between text-[11px] my-1">
            <span className="text-gray-600">Event</span>
            <span className="font-bold truncate max-w-[150px]">{plan.eventType || 'Bespoke Celebration'}</span>
          </div>

          <div className="flex justify-between text-[11px] my-1">
            <span className="text-gray-600">Destination</span>
            <span className="font-bold truncate max-w-[150px]">{plan.city || 'New Delhi NCR'}</span>
          </div>

          <div className="flex justify-between text-[11px] my-1">
            <span className="text-gray-600">Capacity</span>
            <span className="font-bold">{plan.guests || '100 Guests'}</span>
          </div>

          <div className="border-b border-dashed border-gray-400 my-2" />

          <div className="flex justify-between text-[10px] my-1">
            <span className="text-gray-600">Venue & Hire (35%)</span>
            <span className="font-mono">{budgetSplits.venue}</span>
          </div>

          <div className="flex justify-between text-[10px] my-1">
            <span className="text-gray-600">Gastronomy (35%)</span>
            <span className="font-mono">{budgetSplits.catering}</span>
          </div>

          <div className="flex justify-between text-[10px] my-1">
            <span className="text-gray-600">Acoustic Rig (18%)</span>
            <span className="font-mono">{budgetSplits.production}</span>
          </div>

          <div className="flex justify-between text-[10px] my-1">
            <span className="text-gray-600">Logistics (12%)</span>
            <span className="font-mono">{budgetSplits.logistics}</span>
          </div>

          <div className="border-b-2 border-dashed border-gray-500 my-2" />

          <div className="flex justify-between text-xs font-bold text-[#d32f2f] pt-0.5">
            <span>TOTAL ESTIMATE</span>
            <span className="font-mono text-[13px]">{budgetSplits.total}</span>
          </div>

          <div className="mt-2 text-center text-[9px] text-gray-500 font-mono tracking-widest uppercase">
            ✦ PRODUCED BY EVENTGPT ✦
          </div>
        </div>
      </div>

      {/* Printer Controls - Clean: Only Execute Print & Download Blueprint */}
      <div className="w-full mt-4 flex flex-col gap-2.5">
        <button
          onClick={handleToggle}
          className="w-full h-11 rounded-2xl bg-white text-black hover:bg-gray-200 font-mono font-bold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>🖨️</span>
          <span>{isPrinting ? 'Clear & Reset' : 'Execute Print'}</span>
        </button>

        <button
          onClick={handleDownloadBlueprint}
          className="w-full h-10 px-4 rounded-xl bg-mint text-ink-950 font-bold font-mono text-xs tracking-wide hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md shadow-mint/15 cursor-pointer active:scale-95"
          title="Download formatted text blueprint specification"
        >
          <span>⬇</span>
          <span>Download Blueprint</span>
        </button>
      </div>
    </div>
  )
}
