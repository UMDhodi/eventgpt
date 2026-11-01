'use client'

import React from 'react'
import Link from 'next/link'
import PortalStage from '@/components/motion/PortalStage'
import RingGallery from '@/components/motion/RingGallery'
import QuoteDeck from '@/components/motion/QuoteDeck'
import FAQChat from '@/components/sections/FAQChat'
import CTABanner from '@/components/sections/CTABanner'

const HOME_PORTFOLIO_ITEMS = [
  {
    id: 'ring-1',
    title: 'The Starlight Arena Concert',
    subtitle: '12,000 attendee stadium production with immersive laser rigging',
    category: 'LIVE CONCERT · MUMBAI',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    stats: '104 dB SPL · Zero Delay',
  },
  {
    id: 'ring-2',
    title: 'Umaid Heritage Sovereign Wedding',
    subtitle: 'Palace courtyard floral architecture with acoustic sitar quartet',
    category: 'ROYAL WEDDING · JODHPUR',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    stats: '340 Guests · 3 Days',
  },
  {
    id: 'ring-3',
    title: 'Neon Velvet Rooftop Soirée',
    subtitle: '30th milestone birthday with bespoke craft cocktail botanical bar',
    category: 'MILESTONE BIRTHDAY · BENGALURU',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    stats: '85 Guests · Custom Vinyl DJ',
  },
  {
    id: 'ring-4',
    title: 'Botanical Solarium Feast',
    subtitle: 'Curated 5-course farm-to-table banquet inside greenhouse arches',
    category: 'PRIVATE BANQUET · GOA',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    stats: '48 Guests · Biodynamic Pairings',
  },
  {
    id: 'ring-5',
    title: 'Electronic Horizon Festival',
    subtitle: 'Dual acoustic stages with kinetic volumetric lighting trusses',
    category: 'FESTIVAL PRODUCTION · DELHI',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    stats: '6,500 Attendees · 2 Stages',
  },
  {
    id: 'ring-6',
    title: 'Ethereal Glasshouse Vows',
    subtitle: 'Hanging floral chandeliers and candlelight aisle orchestration',
    category: 'ESTATE WEDDING · JAIPUR',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    stats: '220 Guests · Sunset Golden Hour',
  },
  {
    id: 'ring-7',
    title: 'Amber Glow Midsummer Party',
    subtitle: 'Live acoustic lounge, fire pit seating and artisanal dessert bar',
    category: 'ANNIVERSARY SOIRÉE · CHENNAI',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    stats: '120 Guests · Michelin Chef',
  },
]

const HOME_QUOTES = [
  {
    id: 'q1',
    quote:
      'EventGpt orchestrated our 400-guest sangeet down to the minute. The lighting cues during the family dance were pure cinema.',
    name: 'Aanya & Kabir Singhania',
    role: 'Couples · Heritage Wedding, Udaipur',
    eventType: 'WEDDING',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'q2',
    quote:
      'As a tour director, I was stunned. The FOH acoustics and crowd flow throughput predictions saved us 45 minutes on ingress.',
    name: 'Devraj Mukherjee',
    role: 'Head of Touring · Submerge Live',
    eventType: 'CONCERT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'q3',
    quote:
      'The crumpled receipt unfolding into a clear GST budget at checkout was magic. Zero hidden costs, pure producer transparency.',
    name: 'Zoya Merchant',
    role: 'Creative Director · 30th Birthday Gala',
    eventType: 'BIRTHDAY',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
]

const HOME_FAQ = [
  {
    question: 'How does EventGpt generate event timelines and acoustic specs?',
    answer:
      'Our AI planner engine synthesizes verified engineering guidelines from stadium acoustic engineers, master florists, and hospitality directors. It factors in crowd velocity, noise ordinance curfews, and dietary distributions in seconds.',
  },
  {
    question: 'Can I customize the packages or ask the AI to rebalance my budget?',
    answer:
      'Absolutely. Every generated plan includes an interactive category donut chart and a conversational prompt bar where you can say "Shift 10% from floral decor into craft mixology" to see live updates.',
  },
  {
    question: 'What cities in India does EventGpt support for physical delivery?',
    answer:
      'We currently manage production, sound rigging, and floral vendor contracts across 38 cities including Mumbai, Delhi NCR, Bengaluru, Jaipur, Udaipur, Goa, Hyderabad, and Kolkata.',
  },
  {
    question: 'How does the 30% advance booking payment work at checkout?',
    answer:
      'You can choose to lock your date and primary vendor hold with a 30% advance payment via UPI, Credit Card, or Net Banking. The remaining 70% is due 14 days before your event run-of-show.',
  },
  {
    question: 'Can I invite my wedding planner or co-hosts to review the plan?',
    answer:
      'Yes. Every generated plan produces a shareable link and a printable PDF run-of-show complete with vendor call sheets and load-in schedules.',
  },
]

export default function HomePage() {
  return (
    <div data-theme="home" className="w-full bg-ink-950 text-ivory-50 overflow-x-hidden">
      {/* 1. Cinematic Pinned PortalStage: Home -> Concert scroll transition ("fly through the p") */}
      <PortalStage />

      {/* 2. Stats strip: 4 mono numbers (Handbook Section 7.1) */}
      <section className="w-full border-y border-ink-700 bg-ink-900/60 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-accent tracking-tight">
              4,800+
            </span>
            <span className="label-mono text-xs text-muted mt-2">EVENTS DELIVERED</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-tight">
              38
            </span>
            <span className="label-mono text-xs text-muted mt-2">CITIES ACROSS INDIA</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-accent tracking-tight">
              1.2M
            </span>
            <span className="label-mono text-xs text-muted mt-2">GUESTS HOSTED</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-tight">
              4.98 ★
            </span>
            <span className="label-mono text-xs text-muted mt-2">PRODUCER RATING</span>
          </div>
        </div>
      </section>

      {/* 3. Three Event Doors: Large cards for Concert, Wedding, Birthday (Handbook Section 7.1) */}
      <section className="w-full py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="label-mono text-accent mb-3">CURTAIN UP ARCHITECTURE</p>
          <h2 className="h2 mb-4">Choose Your Stage</h2>
          <p className="body-default text-muted max-w-lg mx-auto">
            Every celebration lights up in its own distinctive palette when you enter its doors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Door 1: Concert */}
          <Link
            href="/music-concert"
            className="group relative h-[420px] rounded-3xl overflow-hidden border border-ink-700 bg-ink-900 p-8 flex flex-col justify-between hover:border-violet hover:shadow-[0_0_60px_rgba(123,77,255,0.3)] transition-all duration-500"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80"
                alt="Concert"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="label-mono text-xs px-3 py-1 rounded-full bg-violet/20 border border-violet/40 text-violet">
                PORTAL // 01
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-extrabold text-3xl text-white group-hover:text-violet transition-colors">
                Music Concerts
              </h3>
              <p className="caption text-ivory-50/80 mt-2 line-clamp-2">
                Stadium sound rigging, volumetric laser design, and crowd ingress throughput engineering.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-violet group-hover:translate-x-1 transition-transform">
                <span>ENTER CONCERT STAGE</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Door 2: Birthday Party */}
          <Link
            href="/birthday-party"
            className="group relative h-[420px] rounded-3xl overflow-hidden border border-ink-700 bg-ink-900 p-8 flex flex-col justify-between hover:border-confetti-gold hover:shadow-[0_0_60px_rgba(255,200,61,0.3)] transition-all duration-500"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
                alt="Birthday Party"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="label-mono text-xs px-3 py-1 rounded-full bg-confetti-gold/20 border border-confetti-gold/40 text-confetti-gold">
                PORTAL // 02
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-extrabold text-3xl text-white group-hover:text-confetti-gold transition-colors">
                Milestone Birthdays
              </h3>
              <p className="caption text-ivory-50/80 mt-2 line-clamp-2">
                Golden hour rooftop soirées, custom vinyl DJ sets, and artisanal confetti revelations.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-confetti-gold group-hover:translate-x-1 transition-transform">
                <span>ENTER BIRTHDAY LOUNGE</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Signature Feature 2: Ring Gallery (Handbook Section 6.1) */}
      <RingGallery
        items={HOME_PORTFOLIO_ITEMS}
        heading="CURATED PRODUCTION SHOWCASE"
        title="A Decade of Landmark Productions"
      />

      {/* 5. How AI Planning Works: 3 Steps (Tell us, AI designs, We deliver) */}
      <section className="w-full py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="label-mono text-accent mb-3">METHODOLOGY</p>
          <h2 className="h2 mb-4">How AI Planning Works</h2>
          <p className="body-default text-muted max-w-lg mx-auto">
            From conversational prompt to turnkey stadium or palace delivery in three seamless phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl border border-ink-700 bg-ink-900 flex flex-col gap-4 relative group hover:border-accent transition-colors">
            <span className="font-mono text-4xl font-extrabold text-accent">01</span>
            <h3 className="font-display font-bold text-xl text-white">Tell Us Your Vision</h3>
            <p className="caption text-muted leading-relaxed">
              Share your guest count, preferred city, dates, and budget ceiling. Pick moodboard vibe chips ranging from Heritage Palace to Neon Brutalist.
            </p>
            <div className="mt-auto pt-4 border-t border-ink-700/60 text-xs font-mono text-accent">
              CONVERSATIONAL INPUT
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl border border-ink-700 bg-ink-900 flex flex-col gap-4 relative group hover:border-accent transition-colors">
            <span className="font-mono text-4xl font-extrabold text-accent">02</span>
            <h3 className="font-display font-bold text-xl text-white">AI Designs The Run-Of-Show</h3>
            <p className="caption text-muted leading-relaxed">
              Our model synthesizes hour-by-hour acoustic and culinary cue sheets, generates an unbundled budget donut, and locks top-rated vendor holds.
            </p>
            <div className="mt-auto pt-4 border-t border-ink-700/60 text-xs font-mono text-accent">
              PACK-OPENING REVEAL (M9)
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl border border-ink-700 bg-ink-900 flex flex-col gap-4 relative group hover:border-accent transition-colors">
            <span className="font-mono text-4xl font-extrabold text-accent">03</span>
            <h3 className="font-display font-bold text-xl text-white">We Deliver On-Ground</h3>
            <p className="caption text-muted leading-relaxed">
              Executive producers manage load-in, sound tuning, floral pergolas, and hospitality checkpoints with live WhatsApp updates for total peace of mind.
            </p>
            <div className="mt-auto pt-4 border-t border-ink-700/60 text-xs font-mono text-accent">
              TURNKEY EXECUTION
            </div>
          </div>
        </div>
      </section>

      {/* 6. Signature Feature 3: Quote Deck (Handbook Section 6.2) */}
      <QuoteDeck quotes={HOME_QUOTES} />

      {/* 7. FAQ Chat (Handbook Section 6.6) */}
      <FAQChat items={HOME_FAQ} />

      {/* 8. CTA Banner (Handbook Section 6.7) */}
      <CTABanner
        heading="Curtain Up on Your Event"
        subheading="Experience AI planning designed like a high-production theatre. From first sound check to midnight champagne."
        ctaText="Plan with AI Now"
        ctaHref="/chat"
      />
    </div>
  )
}
