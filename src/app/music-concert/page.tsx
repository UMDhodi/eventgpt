'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ConcertHero from '@/components/motion/ConcertHero'

// A5: Lazy-load everything below the hero with next/dynamic (SSR disabled for below-fold)
const RingGallery = dynamic(() => import('@/components/motion/RingGallery'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full" />,
})
const QuoteDeck = dynamic(() => import('@/components/motion/QuoteDeck'), { ssr: false })
const FAQChat = dynamic(() => import('@/components/sections/FAQChat'), { ssr: false })
const CTABanner = dynamic(() => import('@/components/sections/CTABanner'), { ssr: false })
const WeddingBanner = dynamic(() => import('@/components/motion/WeddingBanner'), { ssr: false })

const CONCERT_SERVICES = [
  {
    icon: '⚡',
    title: 'Stage & Truss Rigging',
    desc: 'Heavy-duty aluminium box trusses, ground-support towers, and revolving circular risers rated for 15,000kg payload.',
  },
  {
    icon: '🔊',
    title: 'Precision Acoustic Arrays',
    desc: 'L-Acoustics K2 & d&b audiotechnik line-arrays tuned via laser telemetry for seamless 104dB SPL without harsh reflections.',
  },
  {
    icon: '💡',
    title: 'Volumetric Intelligent Lighting',
    desc: 'Beam fixtures, pixel-mapped LED battens, atmospheric MDG foggers, and grandMA3 timecode sync.',
  },
  {
    icon: '🎤',
    title: 'Artist Rider Management',
    desc: 'Backline instruments, greenroom hospitality, VIP security escorts, and dedicated artist liaison officers.',
  },
  {
    icon: '🎟️',
    title: 'High-Throughput Ticketing',
    desc: 'RFID wristbands, QR turnstiles capable of 45 attendees/min per lane, and anti-scalping digital gates.',
  },
  {
    icon: '🛡️',
    title: 'Perimeter & Crowd Safety',
    desc: 'Mojo barricades, clear emergency egress corridors, fire marshal clearances, and certified medical staging.',
  },
]

const CONCERT_PACKAGES = [
  {
    name: 'Club & Warehouse Stage',
    badge: 'INTIMATE PRODUCTION',
    price: '₹1,80,000',
    capacity: 'Up to 500 Attendees',
    specs: [
      'Dual 18-inch subwoofers + active tops',
      '12 Moving head beam fixtures',
      'Pioneer DJ CDJ-3000 nexus setup',
      'Dedicated FOH sound engineer',
      'Single lane RFID entry gate',
    ],
  },
  {
    name: 'Arena Tour Spec',
    badge: 'MOST POPULAR',
    popular: true,
    price: '₹6,50,000',
    capacity: '2,000 – 6,000 Attendees',
    specs: [
      'Full line-array hang (12 cabs per side)',
      'Ground-support aluminium roof grid (40x30ft)',
      'Volumetric laser show with MDG haze',
      'Mojo barricades & VIP artist greenroom',
      '4 Ingress turnstiles with backup generator',
    ],
  },
  {
    name: 'Stadium Festival Grid',
    badge: 'HEADLINER SCALE',
    price: '₹18,00,000',
    capacity: '15,000+ Attendees',
    specs: [
      'L-Acoustics K2 arena sound + 2 delay towers',
      '180sqm High-def 3.9mm LED video wall',
      'Timecoded pyrotechnics & CO2 jet cannons',
      'Full artist logistics & broadcast audio feed',
      'Turnkey municipal licensing & safety protocol',
    ],
  },
]

const CONCERT_GALLERY = [
  {
    id: 'c1',
    title: 'Echoes in the Sky',
    subtitle: 'Electronic headliner with 24-point laser array',
    category: 'STADIUM LIVE · MUMBAI',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    stats: '106 dB Peak · Zero Distort',
  },
  {
    id: 'c2',
    title: 'Underground Bass Vault',
    subtitle: 'Industrial warehouse lighting and sub-bass resonance',
    category: 'WAREHOUSE RAVE · BENGALURU',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    stats: '400 kW Sub Array',
  },
  {
    id: 'c3',
    title: 'Sunburn Horizon Arena',
    subtitle: 'Mainstage kinetic trusses and dual delay towers',
    category: 'FESTIVAL MAINSTAGE · GOA',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    stats: '18,000 Attendees · 3 Days',
  },
  {
    id: 'c4',
    title: 'Velvet Midnight Jazz Room',
    subtitle: 'Warm analog acoustic architecture with ribbon microphones',
    category: 'JAZZ SOIRÉE · DELHI',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    stats: 'Acoustic Shell · 220 Guests',
  },
  {
    id: 'c5',
    title: 'Starlight Dome Amphitheatre',
    subtitle: 'Circular 360 sound array with center revolving riser',
    category: 'ARENA PRODUCTION · HYDERABAD',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    stats: '360° Volumetric Wash',
  },
]

const CONCERT_TECH_SPECS = [
  {
    title: 'Acoustic Array Telemetry & Calibration',
    content:
      'We deploy laser inclinometers and Soundvision 3D predictive software to calculate exact inter-cabinet splay angles before flying arrays. Every venue is calibrated for uniform 102-106 dB(A) SPL coverage from front barricade to the back bleachers.',
  },
  {
    title: 'Volumetric Timecoded Lighting & Lasers',
    content:
      'All lighting cues are programmed on grandMA3 consoles and synced via SMPTE linear timecode directly from the artist’s playback rig. Atmospheric haze is delivered via MDG ATMe generators.',
  },
  {
    title: 'Backline & Power Redundancy',
    content:
      'Dual synchronized Cummins 250kVA generators with automatic transfer switches guarantee zero power dropouts. Dedicated stage isolators prevent ground hum on sensitive analog synthesizers and guitar backline.',
  },
]

const CONCERT_QUOTES = [
  {
    id: 'cq1',
    quote:
      'The sub-bass clarity without stage bleed was the best we have experienced in any Indian arena tour. Flawless engineering.',
    name: 'Armaan Malhotra',
    role: 'Tour Manager · Nucleya Arena Tour',
    eventType: 'ARENA CONCERT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cq2',
    quote:
      'EventGpt handled 8,000 festivalgoers in Goa without a single crowd choke point. The RFID turnstiles were effortless.',
    name: 'Miraal Shah',
    role: 'Festival Director · Sunburn Afterhours',
    eventType: 'FESTIVAL',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
]

const CONCERT_FAQ = [
  {
    question: 'How early must we book an arena sound and lighting rig?',
    answer:
      'For Club/Warehouse setups (up to 500 pax), 2 weeks notice is sufficient. For Arena and Festival scale productions, we recommend 4 to 8 weeks to secure generator logistics and artist backline riders.',
  },
  {
    question: 'Do your concert packages include sound engineers and technicians?',
    answer:
      'Yes. Every package includes a certified FOH acoustic engineer, a lighting console programmer (grandMA3 certified), and a stage crew for load-in and line checks.',
  },
  {
    question: 'How do you handle outdoor rain or weather contingencies?',
    answer:
      'All outdoor festival stages include certified weather covers, waterproof moving head enclosures, and elevated rubber cabling ramps to ensure continuous electrical isolation.',
  },
  {
    question: 'Can you source international artist backline gear (vintage amps, specific synths)?',
    answer:
      'We maintain an extensive backline inventory in Mumbai and Delhi, including vintage Rhodes pianos, Nord Stage keyboards, Ampeg SVT rigs, and DW Collector drum kits.',
  },
]

export default function MusicConcertPage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0)
  const [showBelowFold, setShowBelowFold] = useState(false)

  // A5: Mount below-the-fold content smoothly on idle after hero is ready
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => setShowBelowFold(true))
    } else {
      const timer = setTimeout(() => setShowBelowFold(true), 250)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div data-theme="concert" className="w-full bg-ink-950 text-ivory-50 overflow-x-hidden">
      {/* 1. Synchronously Rendered Hero (A5: Only hero renders synchronously) */}
      <ConcertHero />

      {/* 2. Below-the-fold content mounted smoothly after arrival */}
      {showBelowFold && (
        <>
          {/* What We Run: 6 Service Tiles Grid */}
          <section className="w-full py-28 max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <p className="label-mono text-violet mb-3">PRODUCTION INFRASTRUCTURE</p>
              <h2 className="h2 mb-4">What We Build On-Stage</h2>
              <p className="body-default text-muted max-w-lg mx-auto">
                Tour-grade engineering delivering pristine acoustics and awe-inspiring visual impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CONCERT_SERVICES.map((s, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl border border-ink-700 bg-ink-900 flex flex-col gap-4 hover:border-violet hover:shadow-[0_0_40px_rgba(123,77,255,0.2)] transition-all"
                >
                  <div className="h-12 w-12 rounded-2xl bg-violet/10 border border-violet/30 flex items-center justify-center text-xl text-violet">
                    {s.icon}
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{s.title}</h3>
                  <p className="caption text-muted leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Stage Packages: 3 Pricing Cards in INR */}
          <section className="w-full py-28 bg-ink-900/50 border-y border-ink-700">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                <p className="label-mono text-violet mb-3">TRANSPARENT PRODUCTION PRICING</p>
                <h2 className="h2 mb-4">Concert Stage Packages</h2>
                <p className="body-default text-muted max-w-lg mx-auto">
                  All prices include delivery, rigging, sound engineering, and backup power across India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {CONCERT_PACKAGES.map((pkg, idx) => (
                  <div
                    key={idx}
                    className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                      pkg.popular
                        ? 'border-violet bg-ink-900 shadow-[0_0_60px_rgba(123,77,255,0.25)] relative scale-105'
                        : 'border-ink-700 bg-ink-950/80 hover:border-ink-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="label-mono text-xs px-3 py-1 rounded-full bg-violet/10 text-violet border border-violet/30">
                          {pkg.badge}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-2xl text-white mb-2">
                        {pkg.name}
                      </h3>
                      <p className="caption text-muted mb-6">{pkg.capacity}</p>

                      <div className="mb-8">
                        <span className="font-mono text-4xl font-extrabold text-white">
                          {pkg.price}
                        </span>
                        <span className="caption text-muted ml-2">+ 18% GST</span>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {pkg.specs.map((item, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5 text-sm text-ivory-50/90 font-body">
                            <span className="text-violet font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href="/chat"
                      className={`w-full h-13 rounded-full flex items-center justify-center font-body font-bold text-sm tracking-wide transition-all ${
                        pkg.popular
                          ? 'bg-violet text-white hover:brightness-110 shadow-lg'
                          : 'border border-white/20 text-white hover:bg-white/10'
                      }`}
                    >
                      Add to Plan →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Ring Gallery: Crowd and stage shots */}
          <RingGallery
            items={CONCERT_GALLERY}
            heading="STAGE ARCHIVES"
            title="Live Stadium & Tour Productions"
          />

          {/* 5. Tech Spec Accordion */}
          <section id="tech-specs" className="w-full py-28 max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="label-mono text-violet mb-3">TECHNICAL PROTOCOLS</p>
              <h2 className="h2 mb-4">Production Specifications</h2>
              <p className="body-default text-muted max-w-lg mx-auto">
                Rigorous sound tuning, safety redundancy, and decibel compliance guidelines.
              </p>
            </div>

            <div className="space-y-4">
              {CONCERT_TECH_SPECS.map((spec, i) => {
                const isOpen = activeAccordion === i
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink-700 bg-ink-900 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setActiveAccordion(isOpen ? null : i)}
                      className="w-full p-6 text-left flex items-center justify-between font-display font-semibold text-lg text-white hover:text-violet transition-colors"
                    >
                      <span>{spec.title}</span>
                      <span className="text-violet font-mono text-xl">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-ivory-50/80 font-body leading-relaxed border-t border-ink-700/60 pt-4">
                        {spec.content}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* 6. Quote Deck */}
          <QuoteDeck quotes={CONCERT_QUOTES} heading="STAGE CREW & ARTIST FEEDBACK" />

          {/* 7. FAQ Chat */}
          <FAQChat items={CONCERT_FAQ} />

          {/* 8. CTA Banner (Violet to blue glow) */}
          <CTABanner
            heading="Book Your Stadium Tour Rig"
            subheading="Lock your dates and deploy certified acoustic line-arrays, grandMA3 programmers, and seamless crowd logistics."
            ctaText="Plan Concert with AI"
            ctaHref="/chat"
            accentLabel="2026 TOUR PRODUCTION SLOTS AVAILABLE"
          />

          {/* 9. Next Horizon: Expanding Wedding Banner (White Cream Shader & Hero Title Expansion) */}
          <WeddingBanner />
        </>
      )}
    </div>
  )
}
