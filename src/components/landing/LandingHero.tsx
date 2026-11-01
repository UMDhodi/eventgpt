'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Archetypes inspired by Scrolltide Templates (Valmora, Ondine, Selene, Zephyr) ──
interface EventArchetype {
  id: string
  name: string
  subtitle: string
  category: 'wedding' | 'birthday' | 'community'
  tier: 'PREMIUM' | 'FEATURED' | 'FREE TEMPLATE' | 'POPULAR'
  tierColor: 'foam' | 'gold' | 'emerald' | 'rose'
  tagline: string
  description: string
  palette: string[]
  budget: string
  guests: string
  timelineMilestones: string[]
  geminiPrompt: string
  geminiResponse: string
}

const TEMPLATES: EventArchetype[] = [
  {
    id: 'valmora',
    name: 'VALMORA',
    subtitle: 'Grand Estate & Vineyard Wedding',
    category: 'wedding',
    tier: 'PREMIUM',
    tierColor: 'foam',
    tagline: 'SCROLL-DRIVEN CEREMONY ARCHITECTURE',
    description: 'An architectural matrimonial journey where floral pergolas, string quartet cues, and a dynamic champagne tower assemble as you scroll down the page.',
    palette: ['#07080a', '#f3f5f8', '#8bf3e6', '#e05c7a', '#fcbb00'],
    budget: '$52,000',
    guests: '160 Attendees',
    timelineMilestones: [
      'T-6 Months: Lock historic vineyard & cellar estate',
      'T-3 Months: Bespoke floral arch & acoustic quartet rehearsals',
      'T-2 Weeks: Finalize botanical seating calligraphy',
      'Day-of: Golden hour vow exchange & twilight reception',
    ],
    geminiPrompt: '“Generate a luxury vineyard wedding run-of-show with acoustic quartet transitions and sunset photo orchestration for 160 guests with a $52,000 budget.”',
    geminiResponse: '✦ 3:30 PM: Guest arrival to chilled elderflower spritz · 4:00 PM: Processional with acoustic fingerstyle arrangement of Clair de Lune · 5:45 PM: Golden hour vineyard portrait window (20 min) · 6:30 PM: 4-course farm-to-table dinner pairing.',
  },
  {
    id: 'ondine',
    name: 'ONDINE',
    subtitle: 'Intimate Botanical Birthday Dinner',
    category: 'birthday',
    tier: 'FEATURED',
    tierColor: 'gold',
    tagline: 'BIOMETRIC CANDLELIGHT DINING',
    description: 'Word-by-word pinned menu reveals, curated biodynamic wine pairings, and an ambient candlelight transition timeline customized to attendee dietary tastes.',
    palette: ['#0b0d10', '#ffd7a8', '#fcbb00', '#00bb7f', '#ffffff'],
    budget: '$8,500',
    guests: '32 Guests',
    timelineMilestones: [
      'T-4 Weeks: Reserve private greenhouse solarium table',
      'T-2 Weeks: Curate personalized 5-course degustation menu',
      'T-3 Days: Source seasonal organic edible wildflowers & favors',
      'Day-of: Candlelit dinner reveal with custom vinyl jazz playlist',
    ],
    geminiPrompt: '“Curate an intimate 30th birthday greenhouse dinner for 32 guests, featuring zero-proof botanical pairings and a multi-tiered dessert bar.”',
    geminiResponse: '✦ Course 1: Charred heirloom leeks with hazelnut praline · Course 2: Handmade smoked ricotta agnolotti · Zero-proof pairing: Chilled roasted dandelion botanical elixir · Custom salted caramel hazelnut gateau.',
  },
  {
    id: 'selene',
    name: 'SELENE',
    subtitle: 'Annual Civic Harvest & Arts Gala',
    category: 'community',
    tier: 'FREE TEMPLATE',
    tierColor: 'emerald',
    tagline: '6-TIER CROWD TRAJECTORY MAP',
    description: 'A municipal community festival engine with live perimeter flow logistics, noise ordinance compliance timers, and an automated artisan booth registration pipeline.',
    palette: ['#07080a', '#00d294', '#46b7ff', '#f3f5f8', '#27272a'],
    budget: '$28,000',
    guests: '850+ Attendees',
    timelineMilestones: [
      'T-8 Months: Secure city street closure & municipal health permits',
      'T-3 Months: Onboard 40 local culinary & craft artisan vendors',
      'T-2 Weeks: Volunteer staging & safety response walkthrough',
      'Day-of: 10:00 AM gates open with dual acoustic stages',
    ],
    geminiPrompt: '“Draft a crowd-flow logistics checklist and food truck layout for an 800-person public festival in a civic plaza with a $28,000 budget.”',
    geminiResponse: '✦ Establish 16ft emergency central thoroughfare · Position power generator 60ft downwind of culinary tents · Stagger main acoustic stage set times every 45 min to prevent entrance choke points.',
  },
  {
    id: 'zephyr',
    name: 'ZEPHYR',
    subtitle: 'Midsummer Rooftop Cocktail Soirée',
    category: 'birthday',
    tier: 'POPULAR',
    tierColor: 'rose',
    tagline: 'AUDIO-VISUAL SUNSET SYNTHESIS',
    description: 'Live vinyl DJ setlist integration, interactive craft mixology menu designer, and an ambient golden-hour lighting progression schedule for high-altitude celebrations.',
    palette: ['#0b0d10', '#ff6568', '#a685ff', '#8bf3e6', '#ffffff'],
    budget: '$11,200',
    guests: '65 Attendees',
    timelineMilestones: [
      'T-5 Weeks: Lock panoramic penthouse rooftop overlooking skyline',
      'T-3 Weeks: Book underground vinyl soul/house DJ and audio rig',
      'T-1 Week: Batch test smoked rosemary syrup and custom ice blocks',
      'Day-of: 7:00 PM sunset ambient session transitioning to dance floor',
    ],
    geminiPrompt: '“Develop a craft cocktail menu and hourly lighting schedule for a 65-person rooftop evening celebration in late July.”',
    geminiResponse: '✦ 7:00 PM (Golden Amber): Welcome Highball with yuzu & sparkling sake · 8:15 PM (Deep Indigo): Mezcal Paloma with charred chili rim · 9:30 PM (Strobe & Glow): Midnight Espresso Martini shots with sea salt foam.',
  },
]

const TICKER_ITEMS = [
  'VALMORA · ESTATE WEDDINGS',
  'ONDINE · BOTANICAL FEASTS',
  'SELENE · CIVIC FESTIVALS',
  'ZEPHYR · ROOFTOP SOIREE',
  'GEMINI 2.0 REASONING',
  'DYNAMIC BUDGET REBALANCING',
  'ZERO-WASTE COMPLIANCE',
  'INTERACTIVE RSVP DOCK',
]

interface LandingHeroProps {
  onGetStarted: () => void
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'wedding' | 'birthday' | 'community'>('all')
  const [activeSpecimen, setActiveSpecimen] = useState<EventArchetype | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)

  // Interactive Live Prompt Simulator (Recent.design element)
  const [sandboxPrompt, setSandboxPrompt] = useState('Plan a 120-person candlelit autumn wedding with a $40,000 budget')
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const filteredTemplates = TEMPLATES.filter(
    (t) => selectedFilter === 'all' || t.category === selectedFilter
  )

  const handleCopyPrompt = (archetype: EventArchetype) => {
    navigator.clipboard.writeText(archetype.geminiPrompt)
    setCopiedPromptId(archetype.id)
    toast.success('Gemini prompt copied to clipboard!', {
      style: { background: '#0b0d10', color: '#8bf3e6', border: '1px solid rgba(139,243,230,0.3)' },
    })
    setTimeout(() => setCopiedPromptId(null), 2500)
  }

  const handleRunSimulator = () => {
    if (!sandboxPrompt.trim()) return
    setIsSimulating(true)
    setSandboxResponse('')

    const fullText = `✦ ARCHITECTURE GENERATED:\n• Recommended Budget: $${Math.round(350 * 120).toLocaleString()} (allocated across 7 benchmark categories)\n• Venue & Catering: 48% ($19,200)\n• Photo & Video: 14% ($5,600)\n• Floral & Lighting: 12% ($4,800)\n• Day-Of Milestones: 18 critical deadlines backward-scheduled from ceremony date\n• AI Pro-Tip: Autumn candlelit ceremonies save up to $1,800 in daytime floral volume by shifting aesthetic weight to ambient pillar candles and textured foliage.`

    let current = ''
    let idx = 0
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        current += fullText[idx]
        setSandboxResponse(current)
        idx++
      } else {
        clearInterval(interval)
        setIsSimulating(false)
      }
    }, 15)
  }

  return (
    <div className="relative min-h-screen bg-ink text-bone st-hero-glow overflow-x-hidden selection:bg-foam/20">

      {/* ── Background Subtle Tech Dot Grid ── */}
      <div className="pointer-events-none fixed inset-0 z-0 st-dot-grid opacity-30" aria-hidden="true" />

      {/* ── Top Floating Navigation Dock (Recent.design & Scrolltide inspired) ── */}
      <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4 sm:px-6">
        <nav
          className="flex items-center justify-between rounded-full border border-line bg-ink-2/90 px-5 py-3 backdrop-blur-xl shadow-2xl transition-all"
          aria-label="Main Navigation"
        >
          {/* Logo & System Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink font-bold text-xs shadow-glow-foam">
              ✦
            </div>
            <span className="font-display text-base font-bold tracking-tight text-bone">
              EventCraft <span className="text-foam">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-mono text-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM // READY
            </span>
          </div>

          {/* Quick Anchor Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-mist">
            <a href="#templates" className="hover:text-foam transition-colors">Templates [04]</a>
            <a href="#simulator" className="hover:text-foam transition-colors">AI Sandbox</a>
            <a href="#pricing" className="hover:text-foam transition-colors">Access</a>
          </div>

          {/* CTA Action */}
          <button
            onClick={onGetStarted}
            className="st-btn-primary text-xs py-2 px-4 font-semibold"
          >
            Launch Assistant →
          </button>
        </nav>
      </header>

      {/* ══════════════════════════════════════════
          HERO TITLE SEQUENCE (Scrolltide DNA)
      ══════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        {/* Technical Sub-Tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-1.5 text-xs font-mono text-foam backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-foam animate-ping" />
          <span>SCROLL-DRIVEN EVENT ARCHITECTURE · GEMINI 2.0</span>
        </div>

        {/* Master Headline in Bricolage Grotesque */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-bone leading-[1.02] text-balance mb-6">
          Cinematic event planning{' '}
          <span className="font-serif italic font-normal text-foam">sculpted in code</span>.
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-mist leading-relaxed mb-10">
          Reverse-engineered timelines, dynamic budget rebalancing, and bespoke AI co-planning.
          Inspired by architectural title sequences, designed for weddings, milestone birthdays, and community festivals.
        </p>

        {/* Action Pair */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="st-btn-primary w-full sm:w-auto text-sm px-8 py-3.5"
          >
            Start Free Plan ✦
          </button>
          <a
            href="#templates"
            className="st-btn-ghost w-full sm:w-auto text-sm px-8 py-3.5"
          >
            Explore Archetypes [04] ↓
          </a>
        </div>

        {/* Technical Metrics Strip (Recent.design metadata) */}
        <div className="mt-16 grid grid-cols-2 gap-4 border-y border-line py-6 sm:grid-cols-4 text-left font-mono text-xs">
          <div>
            <span className="text-dim block">ENGINE</span>
            <span className="text-bone font-medium">Google Gemini 2.0</span>
          </div>
          <div>
            <span className="text-dim block">BENCHMARK SAVINGS</span>
            <span className="text-foam font-medium">12.4% Net Budget</span>
          </div>
          <div>
            <span className="text-dim block">EXECUTION TIME</span>
            <span className="text-bone font-medium">40+ Hours Saved</span>
          </div>
          <div>
            <span className="text-dim block">DATA PRIVACY</span>
            <span className="text-emerald-400 font-medium">100% Local Vault</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RUNNING MARQUEE
      ══════════════════════════════════════════ */}
      <div className="relative z-10 border-b border-line bg-ink-2/60 py-3 overflow-hidden font-mono text-xs tracking-widest text-dim">
        <div className="flex animate-marquee gap-8 whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-foam">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SCROLLTIDE TEMPLATE SHOWCASE GALLERY
      ══════════════════════════════════════════ */}
      <section id="templates" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-foam block mb-2">
              CURATED TEMPLATE SUITE
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-bone">
              Scroll-driven event archetypes
            </h2>
            <p className="mt-2 text-sm text-mist max-w-xl">
              Each archetype is engineered with bespoke budget formulas, backwards-scheduled milestones, and full Gemini prompts ready to adopt.
            </p>
          </div>

          {/* Recent.design Style Pill Filter with Counts */}
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Template filters">
            {[
              { id: 'all', label: 'All', count: TEMPLATES.length },
              { id: 'wedding', label: 'Weddings', count: 1 },
              { id: 'birthday', label: 'Birthdays', count: 2 },
              { id: 'community', label: 'Festivals', count: 1 },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as typeof selectedFilter)}
                className={`st-pill ${
                  selectedFilter === f.id
                    ? 'border-foam text-foam bg-foam/10 font-semibold'
                    : ''
                }`}
                aria-pressed={selectedFilter === f.id}
              >
                {f.label} <span className="text-dim">[{f.count}]</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2x2 Grid of High-Fidelity Template Cards (Exact Scrolltide Card Geometry) */}
        <div className="grid gap-8 sm:grid-cols-2">
          {filteredTemplates.map((template) => {
            const isCopied = copiedPromptId === template.id
            return (
              <article
                key={template.id}
                className="group st-card p-6 flex flex-col justify-between technical-mark relative overflow-hidden"
              >
                {/* Top Media & Aspect Ratio Preview Window */}
                <div>
                  <div
                    className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 mb-5 transition-all duration-500 group-hover:border-line-strong group-hover:-translate-y-1"
                    style={{ aspectRatio: '16 / 9' }}
                  >
                    {/* Simulated Ambient Particle Visualizer */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${template.palette[2]}20 0%, transparent 60%), radial-gradient(circle at 80% 80%, ${template.palette[3] || template.palette[1]}20 0%, transparent 60%)`,
                      }}
                    />

                    {/* Technical Crosshairs & Corner Meta */}
                    <div className="relative z-10 flex justify-between items-start font-mono text-[10px] text-dim">
                      <span>{template.tagline}</span>
                      <span className="text-bone">{template.budget}</span>
                    </div>

                    {/* Centered Graphic Preview / Type Specimen */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                      <p className="font-serif italic text-3xl sm:text-4xl text-bone mb-1">
                        {template.name}
                      </p>
                      <p className="font-mono text-xs text-foam">
                        {template.guests} · {template.timelineMilestones.length} Milestones
                      </p>
                    </div>

                    {/* Bottom Micro Palette Bar */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-dim">
                      <div className="flex gap-1.5 items-center">
                        {template.palette.map((hex, pi) => (
                          <span
                            key={pi}
                            className="h-2.5 w-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                      <span className="uppercase text-mist">SPEC // {template.id}</span>
                    </div>
                  </div>

                  {/* Header Row: Title, Subtitle & Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold font-display tracking-tight text-bone group-hover:text-foam transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-dim font-mono">{template.subtitle}</p>
                    </div>

                    <span
                      className={`st-pill ${
                        template.tierColor === 'foam'
                          ? 'st-pill-foam'
                          : template.tierColor === 'gold'
                          ? 'st-pill-gold'
                          : template.tierColor === 'emerald'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'st-pill-rose'
                      }`}
                    >
                      {template.tier}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-mist leading-relaxed mb-6">
                    {template.description}
                  </p>
                </div>

                {/* Bottom Actions: Inspect Drawer & Copy Prompt */}
                <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveSpecimen(template)}
                    className="text-xs font-mono text-bone hover:text-foam transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect Blueprint</span>
                    <span className="text-foam">↗</span>
                  </button>

                  <button
                    onClick={() => handleCopyPrompt(template)}
                    className="st-btn-ghost text-xs py-1.5 px-3 font-mono"
                    title="Copy AI prompt to clipboard"
                  >
                    {isCopied ? 'Copied ✓' : 'Copy Gemini Prompt'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE INTERACTIVE AI SANDBOX (Recent.design element)
      ══════════════════════════════════════════ */}
      <section id="simulator" className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="st-card p-8 technical-mark bg-surface/90 border-line-strong shadow-2xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-foam block mb-1">
                TACTILE WORKBENCH
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-bone">
                Live Gemini 2.0 Co-Planner Terminal
              </h3>
            </div>
            <span className="font-mono text-xs text-dim bg-ink-2 px-3 py-1 rounded-full border border-line">
              MODEL // GEMINI-2.0-FLASH-PREVIEW
            </span>
          </div>

          {/* Quick Prompts to Try */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 text-xs font-mono text-mist">
            <span className="text-dim self-center mr-1">SUGGESTIONS:</span>
            {[
              '120-person vineyard wedding ($40k)',
              '30th rooftop cocktail party ($8k)',
              'Zero-waste civic food festival ($20k)',
            ].map((sug) => (
              <button
                key={sug}
                onClick={() => setSandboxPrompt(sug)}
                className="st-pill shrink-0 hover:border-foam hover:text-foam"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative mb-6">
            <textarea
              value={sandboxPrompt}
              onChange={(e) => setSandboxPrompt(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-line bg-ink px-4 py-3 text-sm text-bone placeholder-dim focus:border-foam focus:outline-none font-mono"
              placeholder="Describe your event parameters..."
            />
            <button
              onClick={handleRunSimulator}
              disabled={isSimulating}
              className="absolute right-3 bottom-3 st-btn-primary text-xs py-1.5 px-4 font-mono disabled:opacity-50"
            >
              {isSimulating ? 'Reasoning…' : 'Synthesize Plan ✦'}
            </button>
          </div>

          {/* Output Terminal Area */}
          <div className="rounded-xl border border-line bg-ink p-5 font-mono text-xs leading-relaxed text-bone min-h-[140px] whitespace-pre-wrap relative overflow-hidden">
            {sandboxResponse ? (
              <div>
                <p className="text-foam mb-2">// GEMINI CO-PLANNER RESPONSE:</p>
                <p className="text-mist">{sandboxResponse}</p>
                {isSimulating && (
                  <span className="inline-block h-3 w-1.5 bg-foam ml-1 animate-pulse" />
                )}
              </div>
            ) : (
              <div className="text-dim flex flex-col items-center justify-center h-28 text-center">
                <span className="mb-2">✦</span>
                <p>Click "Synthesize Plan" to preview real-time event budget rebalancing & milestones.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING ACCESS MATRIX
      ══════════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-14 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-foam block mb-2">
            ACCESS & VAULT TIERS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-bone">
            Transparent, unmetered planning
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Essential Planner',
              price: '$0',
              period: 'forever free',
              desc: 'For intimate celebrations, birthday dinners, and dinner parties.',
              features: ['1 Active event project', 'AI-assisted initial budget allocation', 'Reverse timeline builder', 'RSVP guest list up to 75 attendees'],
              highlight: false,
            },
            {
              name: 'AI Connoisseur',
              price: '$19',
              period: 'per event project',
              desc: 'The complete AI mastermind for dream weddings and signature celebrations.',
              features: ['Unlimited Gemini 2.0 streaming co-planner', 'Predictive budget auto-rebalancer', 'Full vendor CRM & contract tracker', 'Exportable run-of-show timeline PDF'],
              highlight: true,
              tag: 'RECOMMENDED',
            },
            {
              name: 'Studio & Guild',
              price: '$49',
              period: 'per month',
              desc: 'For professional coordinators, event producers, and festival directors.',
              features: ['Multi-planner team seats', 'White-label printable reports', 'Municipal permit checklists', 'Direct API access & custom themes'],
              highlight: false,
            },
          ].map((plan, i) => (
            <div
              key={plan.name}
              className={`st-card p-8 flex flex-col justify-between technical-mark ${
                plan.highlight ? 'border-foam/50 shadow-glow-foam scale-105 z-10 bg-surface' : ''
              }`}
            >
              {plan.tag && (
                <span className="self-start rounded-full border border-foam/40 bg-foam/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-foam mb-3">
                  {plan.tag}
                </span>
              )}
              <div>
                <h3 className="font-display text-2xl font-bold text-bone mb-1">{plan.name}</h3>
                <p className="text-xs text-dim font-mono mb-6">{plan.desc}</p>
                <div className="mb-6 flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-bold text-bone">{plan.price}</span>
                  <span className="text-xs text-dim">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-mist font-mono">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="text-foam">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className={plan.highlight ? 'st-btn-primary w-full text-xs py-3' : 'st-btn-ghost w-full text-xs py-3'}
              >
                Launch With {plan.name} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TACTILE SPECIMEN INSPECTION MODAL (Recent.design Peek Modal)
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {activeSpecimen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="specimen-modal-title"
          >
            <div
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
              onClick={() => setActiveSpecimen(null)}
              aria-hidden="true"
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl rounded-3xl border border-line-strong bg-ink-2 p-8 shadow-2xl text-left font-mono"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-start justify-between border-b border-line pb-4 mb-6">
                <div>
                  <span className="text-xs text-foam tracking-widest block uppercase">
                    ARCHETYPE BLUEPRINT // {activeSpecimen.id}
                  </span>
                  <h3 id="specimen-modal-title" className="font-display text-2xl font-bold text-bone">
                    {activeSpecimen.name} — {activeSpecimen.subtitle}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSpecimen(null)}
                  className="rounded-full border border-line p-2 text-mist hover:text-bone hover:border-line-strong"
                  aria-label="Close blueprint modal"
                >
                  ✕
                </button>
              </div>

              {/* Specimen Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                <div className="rounded-xl border border-line bg-surface p-3">
                  <span className="text-dim block">BUDGET ALLOCATION</span>
                  <span className="text-bone font-bold text-sm">{activeSpecimen.budget}</span>
                </div>
                <div className="rounded-xl border border-line bg-surface p-3">
                  <span className="text-dim block">CAPACITY SCOPE</span>
                  <span className="text-bone font-bold text-sm">{activeSpecimen.guests}</span>
                </div>
              </div>

              {/* Milestones list */}
              <div className="mb-6">
                <span className="text-dim text-xs block mb-2">REVERSE-ENGINEERED MILESTONES:</span>
                <div className="space-y-1.5 text-xs text-mist">
                  {activeSpecimen.timelineMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-foam">✦</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt box */}
              <div className="rounded-xl border border-line bg-ink p-4 mb-6 text-xs">
                <span className="text-dim block mb-1">GEMINI AI PROMPT TEMPLATE:</span>
                <p className="text-bone italic">{activeSpecimen.geminiPrompt}</p>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  onClick={() => handleCopyPrompt(activeSpecimen)}
                  className="st-btn-ghost text-xs py-2 px-4"
                >
                  Copy Prompt
                </button>
                <button
                  onClick={() => {
                    setActiveSpecimen(null)
                    onGetStarted()
                  }}
                  className="st-btn-primary text-xs py-2 px-5"
                >
                  Adopt Template in App →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-line py-12 text-center font-mono text-xs text-dim">
        <p>© 2026 EventCraft AI · Inspired by Scrolltide & Recent.design · Powered by Google Gemini</p>
      </footer>
    </div>
  )
}
