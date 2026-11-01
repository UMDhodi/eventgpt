'use client'

import React, { useState, useEffect, useLayoutEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import ConfettiCanvas from '@/components/motion/ConfettiCanvas'
import { useLenis } from '@/components/motion/SmoothScrollProvider'

// Lazy load below-the-fold components on idle
const RingGallery = dynamic(() => import('@/components/motion/RingGallery'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full" />,
})
const QuoteDeck = dynamic(() => import('@/components/motion/QuoteDeck'), { ssr: false })
const FAQChat = dynamic(() => import('@/components/sections/FAQChat'), { ssr: false })
const CTABanner = dynamic(() => import('@/components/sections/CTABanner'), { ssr: false })
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })

const PARTY_THEMES = [
  {
    title: 'Kids Wonderland & Magic',
    age: 'AGES 3 – 12',
    desc: 'Interactive puppet theatres, enchanted balloon archways, science lab experiments, and bespoke cotton candy carts.',
    badge: 'FAMILY FAVORITE',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Teens Neon Glow & Arcade',
    age: 'AGES 13 – 19',
    desc: 'Retro arcade machines, silent disco headsets, neon photo installations, and custom mocktail boba bars.',
    badge: 'ENERGETIC VIBES',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Milestone 30 · 40 · 50 Soirée',
    age: 'MILESTONE AGES',
    desc: 'Panoramic skyline penthouse, live vinyl jazz/house DJ, barrel-aged craft cocktails, and a private sommelier tasting.',
    badge: 'EDITORIAL LUXURY',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Grand Surprise Heist',
    age: 'ANY MILESTONE',
    desc: 'Secret code arrival portals, choreographed live flash revelations, sudden blackout reveals, and champagne rain.',
    badge: 'HIGH DRAMA',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
  },
]

const PARTY_ADDONS = [
  { icon: '🎂', title: 'Artisan 3-Tier Cake', desc: 'Custom sculpted fondants, salted caramel praline, and gold leaf finish.' },
  { icon: '🎧', title: 'Vinyl & Nu-Disco DJ', desc: 'Custom setlist curation tailored to the guest of honor’s music era.' },
  { icon: '📸', title: 'Retro 360 Photo Booth', desc: 'Instant high-speed slo-mo clips with customized branded overlay.' },
  { icon: '🎈', title: 'Organic Balloon Sculptures', desc: 'Chrome gold, pastel coral, and pearl white biodegradable archways.' },
  { icon: '🎯', title: 'Interactive Host & Games', desc: 'Trivia rounds, mixology challenges, and high-energy laughter.' },
  { icon: '🎁', title: 'Curated Return Keepsakes', desc: 'Personalized scented soy candles and luxury confection boxes.' },
]

const BIRTHDAY_PACKAGES = [
  {
    name: 'The Lounge Gathering',
    badge: 'INTIMATE',
    price: '₹95,000',
    guestCount: 'Up to 35 Guests',
    features: [
      'Bespoke craft cocktail bar setup + mixologist',
      'Ambient warm lighting wash & vinyl playlist',
      'Artisanal birthday dessert bar + custom cake',
      'Dedicated on-site host & setup coordinator',
    ],
  },
  {
    name: 'The Milestone Soirée',
    badge: 'MOST CELEBRATED',
    popular: true,
    price: '₹2,75,000',
    guestCount: '50 – 120 Guests',
    features: [
      'Private rooftop or club venue buyout hold',
      'Live DJ with sound rig and synchronized lights',
      '360 Glamour photobooth with instant prints',
      'Passed gourmet canapés + premium open bar',
      'Gold confetti burst synchronized to cake cutting',
    ],
  },
  {
    name: 'The Legendary Gala',
    badge: 'FULL PRODUCTION',
    price: '₹7,50,000',
    guestCount: '150+ Guests',
    features: [
      'Turnkey luxury estate buyout & valet parking',
      'Celebrity music performer or live 6-piece band',
      'Custom interactive theatrical sets & lighting show',
      'Multi-course plated chef degustation feast',
      'Full cinematography crew + social media live cuts',
    ],
  },
]

// 8 curated birthday milestone celebration cards for symmetric 3D ring geometry
const BIRTHDAY_GALLERY = [
  {
    id: 'b1',
    title: 'Golden Euphoria 30th',
    subtitle: 'Champagne tower & neon skyline in Bengaluru',
    category: 'PENTHOUSE SOIRÉE',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    stats: '80 Guests · Vinyl DJ',
  },
  {
    id: 'b2',
    title: 'Secret Agent 40th Speakeasy',
    subtitle: 'Black-tie surprise reveal at private cellar lounge',
    category: 'SURPRISE CELEBRATION · MUMBAI',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    stats: '110 Guests · Custom Mixology',
  },
  {
    id: 'b3',
    title: 'Whimsical Pastel Wonderland',
    subtitle: 'Enchanted balloon pergolas and acoustic guitar singalong',
    category: 'KIDS WONDERLAND · DELHI',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    stats: '60 Families · Cotton Candy Station',
  },
  {
    id: 'b4',
    title: 'Retro Havana 50th Jubilee',
    subtitle: 'Live salsa quartet, hand-rolled cigars, and rum tasting flight',
    category: 'MILESTONE GALA · JAIPUR',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    stats: '140 Guests · Latin Brass',
  },
  {
    id: 'b5',
    title: 'Neon Velvet Rooftop 25th',
    subtitle: 'Midnight disco ball and bespoke botanical craft gin bar',
    category: 'ROOFTOP CLUB · GOA',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    stats: '95 Guests · Sunset Golden Hour',
  },
  {
    id: 'b6',
    title: 'Midnight Masquerade Gala',
    subtitle: 'Venetian masks, gilded chandeliers, and chamber strings',
    category: 'HERITAGE BALLROOM · UDAIPUR',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    stats: '180 Guests · Midnight Champagne',
  },
  {
    id: 'b7',
    title: 'Sunset Bohemian Beachside 21st',
    subtitle: 'Low-seating macramé floor cushions and acoustic beach firepit',
    category: 'COASTAL SOIRÉE · ALIBAG',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    stats: '75 Guests · Live Acoustic Set',
  },
  {
    id: 'b8',
    title: 'Great Gatsby Art Deco Soirée',
    subtitle: 'Prohibition champagne fountain and 10-piece swing big-band',
    category: 'ESTATE GALA · HYDERABAD',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    stats: '220 Guests · Vintage Limousine Fleet',
  },
]

const BIRTHDAY_QUOTES = [
  {
    id: 'bq1',
    quote:
      'My 40th birthday was pure cinema. The gold confetti drop happened right as the saxophone solo kicked in. Unforgettable.',
    name: 'Karan Mehra',
    role: 'Managing Partner · 40th Milestone Gala',
    eventType: 'MILESTONE 40TH',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'bq2',
    quote:
      'I gave EventGpt a rough budget and a few songs my wife loved. They turned a simple rooftop into the coolest party in Mumbai.',
    name: 'Samir & Neha Shroff',
    role: 'Surprise Soiree Host',
    eventType: 'SURPRISE BIRTHDAY',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
]

const BIRTHDAY_FAQ = [
  {
    question: 'How does the confetti burst work and is it safe for indoor venues?',
    answer:
      'We use electric CO2 confetti cannons loaded with certified flame-retardant, biodegradable metallic gold and coral paper. Safe for indoor ballrooms and rooftop terraces alike.',
  },
  {
    question: 'Can you organize surprise parties where the guest of honor has no clue?',
    answer:
      'Surprise coordination is our specialty. We provide private RSVP coordination so invitations never leak, alongside discreet backstage arrival timings.',
  },
  {
    question: 'Can we book individual add-ons like the 360 photo booth or DJ only?',
    answer:
      'Yes. In the AI Planner and Checkout, you can toggle individual add-ons on or off with instant live price recalculations.',
  },
]

export default function BirthdayPage() {
  const router = useRouter()
  const { stopLenis } = useLenis()
  const [returnPillOpacity, setReturnPillOpacity] = useState(0)

  // Synchronous scroll reset on arrival to prevent any scroll jump
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [])

  // Scroll back from Birthday to Wedding when at scrollY === 0 and wheeling up
  useEffect(() => {
    let accumulatedDelta = 0
    let touchStartY = 0
    let armed = false

    // 800ms cooldown after mount so arrival momentum doesn't trigger back
    const timer = setTimeout(() => {
      armed = true
    }, 800)

    const triggerReturnToWedding = () => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-nav-theme', 'wedding')
      }
      router.push('/wedding')
    }

    const handleWheel = (e: WheelEvent) => {
      if (!armed) return
      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (scrollY <= 5 && e.deltaY < 0) {
        accumulatedDelta += -e.deltaY
        setReturnPillOpacity(Math.min(accumulatedDelta / 150, 1))
        if (accumulatedDelta >= 200) {
          accumulatedDelta = 0
          triggerReturnToWedding()
        }
      } else if (scrollY > 10) {
        accumulatedDelta = 0
        setReturnPillOpacity(0)
      } else {
        setReturnPillOpacity(0)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!armed) return
      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (scrollY <= 2) {
        const touchY = e.touches[0].clientY
        if (touchY - touchStartY > 120) {
          triggerReturnToWedding()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [router, stopLenis])

  return (
    <div data-theme="birthday" className="w-full bg-ink-950 text-ivory-50 overflow-x-hidden">
      {/* Scroll-back Indicator Pill to Wedding */}
      <div
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-200"
        style={{ opacity: returnPillOpacity }}
      >
        <div className="px-4 py-2 rounded-full border border-confetti-gold/50 bg-ink-950/95 backdrop-blur-md text-xs font-mono font-semibold tracking-wider text-confetti-gold flex items-center gap-2 shadow-xl">
          <span>↑</span>
          <span>RELEASE TO RETURN TO WEDDINGS</span>
        </div>
      </div>

      {/* Confetti Burst on Page Load (Canvas, 2.8s) */}
      <ConfettiCanvas durationMs={2800} colors={['#FFC83D', '#FF6B6B', '#FFFFFF', '#E8B84A']} />

      {/* 1. Hero with birthparty.mp4, heading 'Birthday', zoom into 'B' -> /chat */}
      <Hero
        videoSrc="/media/birthparty.mp4"
        word="Birthday"
        targetLetter="B"
        nextHref="/chat"
        nextTheme="ai"
        nextLabel="AI Chat Assistant"
        leadText="Parties people talk about for years. Golden confetti explosions, bespoke mixology, and electrifying DJ setlists."
        primaryCtaText="Plan Birthday with AI"
        primaryCtaHref="/chat"
        secondaryCtaText="Explore Themes"
        secondaryCtaHref="#themes"
        centerAlign={true}
      />

      {/* 2. Party Themes: Horizontal Card Strip */}
      <section id="themes" className="w-full py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="label-mono text-confetti-gold mb-3">CURATED PARTY EXPERIENCES</p>
          <h2 className="h2 mb-4">Celebration Themes</h2>
          <p className="body-default text-muted max-w-lg mx-auto">
            Engineered around the guest of honor’s personality, era, and musical tastes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTY_THEMES.map((theme, idx) => (
            <div
              key={idx}
              className="group relative h-[440px] rounded-3xl overflow-hidden border border-ink-700 bg-ink-900 p-6 flex flex-col justify-between hover:border-confetti-gold hover:shadow-[0_0_40px_rgba(255,200,61,0.25)] transition-all"
            >
              <img
                src={theme.image}
                alt={theme.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />

              <div className="relative z-10 flex justify-between items-center">
                <span className="label-mono text-[10px] px-2.5 py-1 rounded-full bg-confetti-gold/20 text-confetti-gold border border-confetti-gold/30">
                  {theme.badge}
                </span>
                <span className="label-mono text-xs text-white/80">{theme.age}</span>
              </div>

              <div className="relative z-10">
                <h3 className="font-display font-bold text-2xl text-white group-hover:text-confetti-gold transition-colors mb-2">
                  {theme.title}
                </h3>
                <p className="caption text-ivory-50/80 leading-relaxed">{theme.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Add-ons Grid: Cake, DJ, Photo booth, Balloons, Games, Return gifts */}
      <section className="w-full py-28 bg-ink-900/60 border-y border-ink-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="label-mono text-confetti-gold mb-3">SIGNATURE DETAILS</p>
            <h2 className="h2 mb-4">Celebration Add-Ons</h2>
            <p className="body-default text-muted max-w-lg mx-auto">
              Every detail coordinated by our production team for effortless party execution.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {PARTY_ADDONS.map((addon, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-ink-700 bg-ink-950/80 flex flex-col items-center text-center gap-3 hover:border-confetti-gold transition-colors"
              >
                <span className="text-3xl">{addon.icon}</span>
                <h4 className="font-display font-bold text-base text-white">{addon.title}</h4>
                <p className="caption text-muted text-xs leading-normal">{addon.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Packages in INR */}
      <section className="w-full py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="label-mono text-confetti-gold mb-3">CURATED BUDGET TIERS</p>
          <h2 className="h2 mb-4">Birthday Packages</h2>
          <p className="body-default text-muted max-w-lg mx-auto">
            Honest all-inclusive pricing including venue setup, sound, bar, and cleanup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {BIRTHDAY_PACKAGES.map((pkg, idx) => (
            <div
              key={idx}
              className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                pkg.popular
                  ? 'border-confetti-gold bg-ink-900 shadow-[0_0_60px_rgba(255,200,61,0.25)] relative scale-105'
                  : 'border-ink-700 bg-ink-950/80 hover:border-ink-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="label-mono text-xs px-3 py-1 rounded-full bg-confetti-gold/10 text-confetti-gold border border-confetti-gold/30">
                    {pkg.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl text-white mb-2">{pkg.name}</h3>
                <p className="caption text-muted mb-6">{pkg.guestCount}</p>

                <div className="mb-8">
                  <span className="font-mono text-4xl font-extrabold text-white">
                    {pkg.price}
                  </span>
                  <span className="caption text-muted ml-2">+ 18% GST</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-sm text-ivory-50/90 font-body">
                      <span className="text-confetti-gold font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/chat"
                className={`w-full h-13 rounded-full flex items-center justify-center font-body font-bold text-sm tracking-wide transition-all ${
                  pkg.popular
                    ? 'bg-confetti-gold text-ink-950 hover:brightness-110 shadow-lg'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                Add to Plan →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Ring Gallery */}
      <RingGallery
        items={BIRTHDAY_GALLERY}
        heading="PARTY DISPATCHES"
        title="Landmark Milestone Celebrations"
      />

      {/* 6. Quote Deck */}
      <QuoteDeck quotes={BIRTHDAY_QUOTES} heading="WORDS FROM PARTY HOSTS" />

      {/* 7. FAQ Chat */}
      <FAQChat items={BIRTHDAY_FAQ} />

      {/* 8. CTA Banner (Gold to coral glow) */}
      <CTABanner
        heading="Drop the Confetti on Your Birthday"
        subheading="Book our rooftop suites, custom vinyl setlists, and celebratory cocktail bars in seconds."
        ctaText="Plan Birthday with AI"
        ctaHref="/chat"
        accentLabel="RESERVE YOUR MILESTONE WEEKEND"
      />

      {/* Footer exclusively on Birthday Party */}
      <Footer />
    </div>
  )
}

