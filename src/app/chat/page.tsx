'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import PortalHeading from '@/components/motion/PortalHeading'
import MiniPrinter from '@/components/chat/MiniPrinter'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface BlueprintRecord {
  id: string
  title: string
  city: string
  date: string
  meta: {
    eventType: string
    city: string
    date: string
    guests: string
    budget: string
    vibe: string
    status: string
  }
}

const PLAYFUL_LOADING_LINES = [
  '✦ Architectural line-array simulations active...',
  '✦ Sourcing palatial courtyards and botanical pergolas...',
  '✦ Calculating guest throughput and stage acoustics...',
  '✦ Balancing mixology and banquet budget formulas...',
  '✦ Checking local municipal curfew bylaws...',
  '✦ Synthesizing executive run-of-show blueprint...',
]

function normalizeBlueprintText(raw: string): string {
  return raw
    .replace(/<!--EVENT_META:[\s\S]*?-->/g, '')
    // 1. Separate blueprint title from metadata line if stuck
    .replace(/(✦\s*AI-DESIGNED EVENT BLUEPRINT:[^\n\*]+?)(?=\*\*)/gi, '$1\n\n')
    // 2. Separate metadata keys if stuck together
    .replace(/([^\n])\s*(\*\*(?:Location|Destination|Capacity|Vibe)\*\*:)/gi, '$1\n$2')
    // 3. Separate section headers (### 1., ### 2., etc.)
    .replace(/([^\n])\s*(###\s*\d+\.\s*[^\n\-•✦]+?)(?=\s*[-•]\s*\*\*|\s*###|\s*✦|$)/gi, '$1\n\n$2\n\n')
    .replace(/([^\n])\s*(###\s*)/g, '$1\n\n$2')
    // 4. Separate bullets (- **Key**: or • **Key**:)
    .replace(/([^\n])\s*([-•]\s*\*\*)/g, '$1\n$2')
    // 5. Separate run-of-show timestamps like **07:30 PM**
    .replace(/([^\n])\s*(\*\*\d{1,2}:\d{2}\s*(?:AM|PM)\*\*)/gi, '$1\n- $2')
    // 6. Separate budget items like (35%)**- **
    .replace(/\)\*\*\s*-\s*\*\*/g, ')**\n- **')
    // 7. Separate download / print confirmation prompt
    .replace(/([^\n])\s*(✦\s*\*\*Would you like)/gi, '$1\n\n$2')
    // 8. Collapse excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, pIdx) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={pIdx} className="text-white font-semibold">
          {p.slice(2, -2)}
        </strong>
      )
    }
    return p
  })
}

function renderFormattedMessageContent(raw: string, isUser: boolean) {
  if (isUser) {
    return <p className="whitespace-pre-line font-medium">{raw}</p>
  }

  const clean = normalizeBlueprintText(raw)
  const lines = clean.split('\n')

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1" />

        // Section header like ### 1. 🏛️ Spatial Concept & Atmosphere
        if (trimmed.startsWith('###')) {
          const headerText = trimmed.replace(/^###\s*/, '')
          return (
            <h4
              key={idx}
              className="font-display font-bold text-mint text-sm sm:text-base tracking-wide pt-3 pb-1 border-b border-mint/20 flex items-center gap-2"
            >
              {headerText}
            </h4>
          )
        }

        // Title line like ✦ AI-DESIGNED EVENT BLUEPRINT: ...
        if (trimmed.startsWith('✦ AI-DESIGNED EVENT BLUEPRINT:')) {
          return (
            <div
              key={idx}
              className="font-display font-extrabold text-mint text-base sm:text-lg tracking-tight pb-1 border-b border-mint/20 flex items-center gap-2"
            >
              <span>✦</span>
              <span className="text-white">{trimmed.replace(/^✦\s*/, '')}</span>
            </div>
          )
        }

        // Download/Print prompt at end
        if (trimmed.startsWith('✦ **Would you like') || trimmed.includes('Would you like to print or download')) {
          return (
            <div
              key={idx}
              className="mt-3 p-3.5 rounded-2xl bg-mint/10 border border-mint/30 text-mint text-xs sm:text-sm leading-relaxed flex items-start gap-2.5"
            >
              <span className="text-base leading-none mt-0.5">✦</span>
              <div>{renderInlineBold(trimmed.replace(/^✦\s*/, ''))}</div>
            </div>
          )
        }

        // Generic ✦ callout
        if (trimmed.startsWith('✦')) {
          return (
            <div key={idx} className="font-display font-bold text-white text-sm sm:text-base pb-1">
              {trimmed}
            </div>
          )
        }

        // Metadata line like **Location**: ... · **Capacity**: ... · **Vibe**: ...
        if (trimmed.startsWith('**Location**:') || (trimmed.includes('**Capacity**:') && trimmed.includes('**Vibe**:'))) {
          return (
            <div
              key={idx}
              className="my-2 p-2.5 rounded-xl bg-ink-900/90 border border-ink-700/60 text-xs sm:text-[13px] text-ivory-50/90 font-mono flex flex-wrap gap-x-3 gap-y-1 items-center"
            >
              {renderInlineBold(trimmed)}
            </div>
          )
        }

        // Bullet point like - **Layout**: ... or - **06:30 PM** — ...
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const contentAfterBullet = trimmed.replace(/^[-•]\s*/, '')
          const match = contentAfterBullet.match(/^\*\*([^*]+)\*\*:(.*)$/)
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5 text-xs sm:text-sm text-ivory-50/90">
                <span className="text-mint font-bold mt-1 text-xs">•</span>
                <p>
                  <strong className="text-white font-semibold">{match[1]}:</strong>
                  <span className="text-ivory-50/80">{match[2]}</span>
                </p>
              </div>
            )
          }

          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5 text-xs sm:text-sm text-ivory-50/90">
              <span className="text-mint font-bold mt-1 text-xs">•</span>
              <p>{renderInlineBold(contentAfterBullet)}</p>
            </div>
          )
        }

        // General line with inline bold
        return (
          <p key={idx} className="text-ivory-50/90 text-xs sm:text-sm">
            {renderInlineBold(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content:
        '✦ **Welcome to EventGpt Executive Intelligence.**\n\nI am your lead event producer and architect. Tell me about your celebration — city, estimated guest count, target budget, or aesthetic vibe — and I will design a complete, unbundled event blueprint for you.',
      timestamp: '10:00 AM',
    },
  ])

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingLineIndex, setLoadingLineIndex] = useState(0)

  // Real saved blueprints vault (No mock data!)
  const [savedBlueprints, setSavedBlueprints] = useState<BlueprintRecord[]>([])
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>('current')
  const [isPrinterActive, setIsPrinterActive] = useState(false)

  // Fold-out toolbar state (Handbook M8)
  const [isToolbarOpen, setIsToolbarOpen] = useState(false)
  const [toolbarParams, setToolbarParams] = useState({
    city: 'Select City',
    budget: 'Flexible',
    guests: '150 Attendees',
    vibe: 'Editorial Luxury',
  })

  // Live "Plan so far" dynamic board (Handbook 7.5.4) — starts clean without mock data
  const [planSoFar, setPlanSoFar] = useState({
    eventType: 'Awaiting Your Prompt',
    city: 'Specify in Chat',
    date: 'Upcoming Season 2026',
    guests: 'Custom Attendees',
    budget: 'Adaptive Budget',
    vibe: 'Editorial Luxury',
    status: 'READY TO DESIGN',
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Rotate loading lines every 1.4s while loading (Handbook M6)
  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setLoadingLineIndex((prev) => (prev + 1) % PLAYFUL_LOADING_LINES.length)
    }, 1400)
    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleNewBlueprint = () => {
    setActiveBlueprintId('current')
    setPlanSoFar({
      eventType: 'Awaiting Your Prompt',
      city: 'Specify in Chat',
      date: 'Upcoming Season 2026',
      guests: 'Custom Attendees',
      budget: 'Adaptive Budget',
      vibe: 'Editorial Luxury',
      status: 'READY TO DESIGN',
    })
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          '✦ **Fresh Event Blueprint Session Initiated.**\n\nWhat are you envisioning next? Name any city in India, venue preference, or scale, and we will architect your run-of-show.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleLoadBlueprint = (bp: BlueprintRecord) => {
    setActiveBlueprintId(bp.id)
    setPlanSoFar(bp.meta)
    setToolbarParams({
      city: bp.meta.city,
      budget: bp.meta.budget,
      guests: bp.meta.guests,
      vibe: bp.meta.vibe,
    })
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✦ Loaded blueprint for **${bp.title}** in **${bp.city}** (${bp.meta.guests}, Target: ${bp.meta.budget}). What details shall we refine?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input
    if (!textToSend.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Check if user is confirming download/print after discussion
    const tTrim = textToSend.trim().toLowerCase()
    const isAffirmative =
      tTrim === 'yes' ||
      tTrim === 'yeah' ||
      tTrim === 'yep' ||
      tTrim === 'sure' ||
      tTrim === 'yes please' ||
      tTrim === 'please' ||
      tTrim === 'download' ||
      tTrim === 'print' ||
      tTrim === 'yes, print blueprint' ||
      tTrim === 'download receipt' ||
      tTrim.startsWith('yes') ||
      tTrim.includes('print blueprint') ||
      tTrim.includes('download receipt')

    if (isAffirmative && (planSoFar.city !== 'Specify in Chat' || messages.length > 1)) {
      setIsPrinterActive(true)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✦ **Dispensing official EventGpt Blueprint specification!**\n\nYour hardware receipt is now printing on the interactive console to your right.\n\n- **Event Profile**: ${planSoFar.eventType || 'Bespoke Celebration'}\n- **Destination**: ${planSoFar.city || 'New Delhi NCR'}\n- **Capacity**: ${planSoFar.guests || '100 Guests'}\n- **Target Budget**: ${planSoFar.budget || '₹5 Lakhs'}\n\nYou can click **Download** to save the formatted specification file or **Full Page** to print directly!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsLoading(false)
      return
    }

    // Pre-extract potential city/event hints from prompt
    const tLower = textToSend.toLowerCase()
    let initialCity = planSoFar.city
    if (tLower.includes('udaipur')) initialCity = 'Udaipur, Rajasthan'
    else if (tLower.includes('mumbai') || tLower.includes('bombay')) initialCity = 'Mumbai, Maharashtra'
    else if (tLower.includes('delhi')) initialCity = 'New Delhi NCR'
    else if (tLower.includes('goa')) initialCity = 'Goa Coastal'
    else if (tLower.includes('bangalore') || tLower.includes('bengaluru')) initialCity = 'Bengaluru, Karnataka'
    else if (tLower.includes('jaipur')) initialCity = 'Jaipur, Rajasthan'

    let initialEventType = planSoFar.eventType
    if (tLower.includes('sangeet')) initialEventType = 'Royal Sangeet Gala'
    else if (tLower.includes('wedding') || tLower.includes('mandap')) initialEventType = 'Heritage Wedding'
    else if (tLower.includes('concert') || tLower.includes('sound rig')) initialEventType = 'Stadium Concert Tour'
    else if (tLower.includes('birthday')) initialEventType = 'Milestone Celebration'
    else if (tLower.includes('gathering') || tLower.includes('dinner') || tLower.includes('cocktail') || tLower.includes('small gathering')) {
      initialEventType = 'Bespoke Celebration'
    }

    let initialGuests = planSoFar.guests
    const guestMatch = textToSend.match(/(\d+)\s*(?:people|guests?|attendees?|pax|persons?)/i)
    if (guestMatch) {
      initialGuests = `${guestMatch[1]} Guests`
    }

    let initialBudget = planSoFar.budget
    const lakhMatch = textToSend.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i)
    const crMatch = textToSend.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i)
    if (lakhMatch) {
      initialBudget = `₹${lakhMatch[1]} Lakhs`
    } else if (crMatch) {
      initialBudget = `₹${crMatch[1]} Crores`
    }

    const updatedContext = {
      ...planSoFar,
      city: initialCity,
      eventType: initialEventType,
      guests: initialGuests,
      budget: initialBudget,
    }
    setPlanSoFar(updatedContext)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          eventContext: updatedContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat API returned error')
      }

      // Live real-time token streaming
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const assistantId = (Date.now() + 1).toString()
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      let accumulated = ''
      let hasAddedMessage = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          if (chunk) {
            accumulated += chunk
            if (!hasAddedMessage) {
              hasAddedMessage = true
              setIsLoading(false)
              setMessages((prev) => [
                ...prev,
                {
                  id: assistantId,
                  role: 'assistant',
                  content: accumulated,
                  timestamp: assistantTime,
                },
              ])
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
              )
            }
          }
        }
      }

      // Extract AI-designed plan metadata from response to update the live side board
      const metaMatch = accumulated.match(/<!--EVENT_META:([\s\S]*?)-->/)
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1].trim())
          const newPlan = {
            eventType: meta.eventType || updatedContext.eventType,
            city: meta.city || updatedContext.city,
            date: 'Upcoming Season 2026',
            guests: meta.guests || updatedContext.guests,
            budget: meta.budget || updatedContext.budget,
            vibe: meta.vibe || toolbarParams.vibe,
            status: '✦ ARCHITECTED BY AI',
          }
          setPlanSoFar(newPlan)
          setToolbarParams({
            city: newPlan.city,
            budget: newPlan.budget,
            guests: newPlan.guests,
            vibe: newPlan.vibe,
          })

          setSavedBlueprints((prev) => {
            const exists = prev.some((p) => p.title === newPlan.eventType && p.city === newPlan.city)
            if (exists) return prev
            return [
              {
                id: Date.now().toString(),
                title: newPlan.eventType,
                city: newPlan.city,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                meta: newPlan,
              },
              ...prev,
            ]
          })
        } catch { }
      }

      if (!accumulated) {
        const fallbackMsg: Message = {
          id: assistantId,
          role: 'assistant',
          content: '✦ Blueprint updated. What specific acoustic or culinary details shall we refine next?',
          timestamp: assistantTime,
        }
        setMessages((prev) => [...prev, fallbackMsg])
      }
    } catch {
      // Dynamic fallback plan matching exact 4-section architecture
      const cleanCity = updatedContext.city && updatedContext.city !== 'Specify in Chat' ? updatedContext.city : 'New Delhi NCR'
      const cleanGuests = updatedContext.guests && updatedContext.guests !== 'Custom Attendees' ? updatedContext.guests : '100 Guests'
      const cleanBudget = updatedContext.budget && updatedContext.budget !== 'Adaptive Budget' ? updatedContext.budget : '₹5 Lakhs'
      const cleanTitle = updatedContext.eventType && updatedContext.eventType !== 'Awaiting Your Prompt'
        ? updatedContext.eventType.toUpperCase()
        : 'BESPOKE CELEBRATION'

      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✦ AI-DESIGNED EVENT BLUEPRINT: ${cleanTitle}
**Location**: ${cleanCity} · **Capacity**: ${cleanGuests} · **Vibe**: Curated Editorial Luxury

### 1. 🏛️ Spatial Concept & Atmosphere
- **Layout**: Intimate multi-zone venue arrangement uniting a cocktail welcome lounge, acoustic showcase stage, and banquet dining rotunda.
- **Aesthetic**: Low-profile warm architectural lighting (2700K), bespoke linens, and minimalist botanical arches.

### 2. 🔊 Acoustic & Lighting Design
- **Sound**: Ultra-compact d&b audiotechnik column speakers providing crisp conversational sound distribution without visual clutter.
- **Atmosphere**: Pin-spot dining illumination, organic candle pergolas, and subtle ambient uplighting.

### 3. ⏱️ Run-of-Show Milestones
- **06:30 PM** — Welcome mixology & passed botanical amuse-bouche.
- **08:00 PM** — Keynote reveal / toast with champagne tower.
- **09:00 PM** — 4-course seated chef degustation feast.
- **10:30 PM** — Vinyl DJ lounge set with craft digestifs.

### 4. 💰 Target Budget Allocation
- **Venue & Private Hire (35%)**
- **Gastronomy & Sommelier Service (35%)**
- **Acoustic Sound & Lighting Architecture (18%)**
- **Hospitality Concierge & Logistics (12%)**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestionChips = [
    'Yes, print blueprint',
    'Download receipt',
    'Small gathering of 100 people in Delhi with ₹5 Lakhs budget',
    'Plan a 150-guest sangeet in Udaipur',
    'Concert sound rig for 2,000 in Mumbai',
  ]

  const handleCategoryClick = (cat: string) => {
    if (cat === 'WEDDINGS') handleSendMessage('Design a luxury 200-guest heritage palace wedding in Udaipur with mandap acoustics')
    else if (cat === 'CONCERTS') handleSendMessage('Design a 2,500-capacity outdoor concert rig in Bangalore with delay towers')
    else if (cat === 'BIRTHDAYS') handleSendMessage('Design an exclusive 50-guest rooftop milestone birthday with craft mixology in Mumbai')
    else if (cat === 'CORPORATE') handleSendMessage('Design a 400-guest tech keynote gala in Delhi with 4K LED staging')
  }

  return (
    <div data-theme="ai" className="w-full bg-ink-950 text-ivory-50 min-h-screen flex flex-col">
      {/* 1. Compact Hero (60vh) with looping blurred video background, heading 'Ask EventGpt' */}
      <section className="relative w-full h-[52vh] flex items-center justify-center overflow-hidden bg-ink-950 border-b border-ink-700">
        <video
          src="/media/home.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover filter blur-md brightness-50 scale-105 transform-gpu translate-z-0 will-change-transform"
        >
          <source src="/media/home.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 hero-video-overlay" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="mb-4">
            <PortalHeading
              word="Ask EventGpt"
              target="A"
              nextHref="/music-concert"
              nextTheme="concert"
              nextLabel="Concert Production"
              className="display-xl"
            />
          </div>
          <p className="body-default text-ivory-50/80 max-w-lg mx-auto font-body">
            Direct conversational hotline with our executive event producer intelligence.
          </p>
        </div>
      </section>

      {/* 2. Full-Height Chat Workspace (3 columns on desktop) */}
      <section className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Past Chats & Event Type Filters */}
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          onWheel={(e) => e.stopPropagation()}
          className="hidden lg:flex lg:col-span-3 flex-col gap-6 p-6 rounded-3xl border border-ink-700 bg-ink-900/90 backdrop-blur-xl overscroll-contain"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div>
            <span className="label-mono text-mint text-xs">DISPATCH CHANNELS</span>
            <h3 className="font-display font-bold text-lg text-white mt-1">Active Projects</h3>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleNewBlueprint}
              className={`p-3 rounded-2xl text-left text-sm font-body font-semibold flex items-center justify-between transition-colors ${activeBlueprintId === 'current'
                  ? 'bg-mint/15 border border-mint/40 text-mint'
                  : 'border border-ink-700 hover:border-mint/30 text-muted hover:text-white'
                }`}
            >
              <span>✦ Current Session</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mint/10 text-mint">
                LIVE
              </span>
            </button>

            {savedBlueprints.length > 0 ? (
              savedBlueprints.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => handleLoadBlueprint(bp)}
                  className={`p-3 rounded-2xl border text-left text-sm font-body flex items-center justify-between transition-colors ${activeBlueprintId === bp.id
                      ? 'border-mint/50 bg-mint/10 text-white'
                      : 'border-ink-700 hover:border-ink-700/80 text-muted hover:text-white'
                    }`}
                >
                  <span className="truncate max-w-[150px]">{bp.title}</span>
                  <span className="text-xs font-mono text-muted">{bp.date}</span>
                </button>
              ))
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-ink-700/70 text-center">
                <p className="text-xs text-muted">No saved plans yet.</p>
                <p className="text-[11px] text-muted/60 mt-1">
                  Ask the AI below to architect your first event blueprint.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-ink-700/60">
            <span className="label-mono text-muted text-xs mb-3 block">EVENT TYPE FILTERS</span>
            <div className="flex flex-wrap gap-2">
              {['WEDDINGS', 'CONCERTS', 'BIRTHDAYS', 'CORPORATE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="label-mono text-[11px] px-2.5 py-1 rounded-full bg-ink-950 border border-ink-700 text-ivory-50 hover:border-mint hover:text-mint transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Centre Column: Message Stream + Suggestion Chips + Composer with Fold-out Toolbar */}
        <div className="col-span-1 lg:col-span-6 flex flex-col h-[700px] rounded-3xl border border-ink-700 bg-ink-900/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 px-6 border-b border-ink-700 flex items-center justify-between bg-ink-950/40">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
              <span className="font-display font-bold text-sm text-white">EventGpt Co-Producer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NVIDIA NIM · minimax-m3.1-flash
              </span>
              <span className="label-mono text-xs text-mint hidden sm:inline">ENGINE ONLINE</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-6 space-y-5 overscroll-contain"
            style={{ overscrollBehavior: 'contain' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'rounded-tr-sm bg-mint text-ink-950 font-medium'
                      : 'rounded-tl-sm bg-ink-950 border border-ink-700 text-ivory-50 font-body'
                    }`}
                >
                  {renderFormattedMessageContent(msg.content, msg.role === 'user')}
                </div>
                <span className="caption text-muted text-[10px] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Playful Loading Lines while AI is typing (Handbook M6) */}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-3xl rounded-tl-sm bg-ink-950 border border-mint/40 max-w-md animate-pulse">
                <span className="w-4 h-4 rounded-full border-2 border-mint border-t-transparent animate-spin" />
                <span className="label-mono text-mint text-xs">
                  {PLAYFUL_LOADING_LINES[loadingLineIndex]}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-ink-700/40">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="label-mono text-[11px] px-3 py-1.5 rounded-full bg-ink-950 border border-ink-700 text-ivory-50/80 hover:border-mint hover:text-mint whitespace-nowrap transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Bottom Composer with Fold-out Toolbar (Handbook M8) */}
          <div className="p-4 bg-ink-950/70 border-t border-ink-700">
            {/* Fold-out parameters drawer */}
            {isToolbarOpen && (
              <div className="mb-3 p-4 rounded-2xl bg-ink-900 border border-ink-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">CITY</label>
                  <input
                    type="text"
                    value={toolbarParams.city}
                    onChange={(e) => setToolbarParams({ ...toolbarParams, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-ink-950 border border-ink-700 text-ivory-50 text-xs"
                  />
                </div>
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">BUDGET</label>
                  <input
                    type="text"
                    value={toolbarParams.budget}
                    onChange={(e) => setToolbarParams({ ...toolbarParams, budget: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-ink-950 border border-ink-700 text-ivory-50 text-xs"
                  />
                </div>
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">GUESTS</label>
                  <input
                    type="text"
                    value={toolbarParams.guests}
                    onChange={(e) => setToolbarParams({ ...toolbarParams, guests: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-ink-950 border border-ink-700 text-ivory-50 text-xs"
                  />
                </div>
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">VIBE</label>
                  <input
                    type="text"
                    value={toolbarParams.vibe}
                    onChange={(e) => setToolbarParams({ ...toolbarParams, vibe: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-ink-950 border border-ink-700 text-ivory-50 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Fold-out toggle button */}
              <button
                onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                className={`p-2.5 rounded-2xl border text-xs font-mono transition-colors ${isToolbarOpen
                    ? 'bg-mint text-ink-950 border-mint font-bold'
                    : 'bg-ink-900 border-ink-700 text-muted hover:text-white'
                  }`}
                title="Fold-out Parameter Toolbar (M8)"
                aria-label="Toggle parameter toolbar"
              >
                ⚙ {isToolbarOpen ? 'Hide Controls' : 'Specs'}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about run-of-shows, sound rigging, or botanical decor..."
                className="flex-1 px-4 py-3 rounded-2xl bg-ink-900 border border-ink-700 text-sm text-ivory-50 placeholder:text-muted focus:outline-none focus:border-mint transition-colors"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="h-11 px-6 rounded-2xl bg-mint text-ink-950 font-bold text-sm tracking-wide hover:brightness-105 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Rail: Interactive Mini Printer & Blueprint Receptacle */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 p-5 rounded-3xl border border-ink-700 bg-ink-900/90 backdrop-blur-xl shadow-2xl">
          <MiniPrinter
            plan={planSoFar}
            isPrinting={isPrinterActive}
            onTogglePrint={(printing) => setIsPrinterActive(printing)}
          />
        </div>
      </section>
    </div>
  )
}

