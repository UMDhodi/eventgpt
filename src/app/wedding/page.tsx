'use client'

import React, { useState, useEffect, useLayoutEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import { useLenis } from '@/components/motion/SmoothScrollProvider'

// Lazy load below-the-fold components on idle to ensure instantaneous zero-lag hero mounting
const RingGallery = dynamic(() => import('@/components/motion/RingGallery'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full" />,
})
const QuoteDeck = dynamic(() => import('@/components/motion/QuoteDeck'), { ssr: false })
const FAQChat = dynamic(() => import('@/components/sections/FAQChat'), { ssr: false })
const CTABanner = dynamic(() => import('@/components/sections/CTABanner'), { ssr: false })
const BirthdayBanner = dynamic(() => import('@/components/motion/BirthdayBanner'), { ssr: false })

const WEDDING_TIMELINE_STEPS = [
  {
    step: '01',
    name: 'The Engagement Gala',
    lead: 'Champagne toast & diamond unveiling',
    desc: 'An intimate sunset soiree with acoustic jazz strings, passed caviar canapés, and bespoke heirloom calligraphy.',
    timing: 'Day 1 · Evening',
  },
  {
    step: '02',
    name: 'The Botanical Mehendi',
    lead: 'Fresh marigold pergolas & live bangle bazaar',
    desc: 'Sun-drenched courtyard filled with live organic henna artists, refreshing sugarcane coolers, and acoustic dhol beats.',
    timing: 'Day 2 · Afternoon',
  },
  {
    step: '03',
    name: 'The Royal Sangeet',
    lead: 'Synchronized stage lights & cocktail revelry',
    desc: '24ft glossy white performance dance floor, grandMA3 moving wash lights, custom musical cues, and midnight buffet.',
    timing: 'Day 2 · Night',
  },
  {
    step: '04',
    name: 'The Sacred Pheras',
    lead: 'Floral mandap floating above water pavilion',
    desc: 'Scent of vetiver and fresh tuberose, Vedic hymns accompanied by classical flutists, and golden hour blessings.',
    timing: 'Day 3 · Twilight',
  },
  {
    step: '05',
    name: 'The Black-Tie Reception',
    lead: 'Grand ballroom dinner & 5-tier cake reveal',
    desc: '4-course plated gastronomic dinner pairing, 12-piece jazz band, and a celebratory midnight sparkler exit.',
    timing: 'Day 3 · Gala',
  },
]

const WEDDING_MOODBOARD = [
  {
    title: 'Floating Tuberose Mandap',
    loc: 'Jagmandir Island Palace, Udaipur',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    tag: 'CEREMONY FLORALS',
  },
  {
    title: 'Candlelit Solarium Tablescape',
    loc: 'The Oberoi Rajvilas, Jaipur',
    img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    tag: 'BOTANICAL BANQUET',
  },
  {
    title: 'Acoustic Sitar & Harp Pavilion',
    loc: 'Neemrana Fort Palace, Rajasthan',
    img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    tag: 'ACOUSTIC SOUND',
  },
  {
    title: 'Vintage Champagne Tower',
    loc: 'Taj Falaknuma Palace, Hyderabad',
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    tag: 'REVELRY BAR',
  },
]

const WEDDING_PACKAGES = [
  {
    name: 'Intimate Heritage Courtyard',
    badge: 'BOUTIQUE',
    price: '₹8,00,000',
    guestRange: 'Up to 100 Guests',
    features: [
      'Full botanical mandap with fresh Indian florals',
      'Acoustic sitar and flute instrumentalists',
      'Curated 4-course banquet menu orchestration',
      'Dedicated lead bride & groom concierge',
      'Artisanal calligraphy seating chart & invites',
    ],
  },
  {
    name: 'Classic Palace Sovereign',
    badge: 'MOST COVETED',
    popular: true,
    price: '₹22,00,000',
    guestRange: '150 – 350 Guests',
    features: [
      '3-Day full ceremony coverage (Mehendi to Reception)',
      'Custom 24x24ft Sangeet dance floor & lighting truss',
      'Volumetric floral arches & floating water chandeliers',
      'Live celebrity DJ & dhol ensemble coordination',
      'VIP guest hospitality desk & airport transfer fleet',
    ],
  },
  {
    name: 'The Imperial Grand Estate',
    badge: 'LEGENDARY SCALE',
    price: '₹55,00,000',
    guestRange: '500+ Guests',
    features: [
      'Turnkey palace buyout & heritage logistics',
      'Michelin-level master chef banquet stations',
      'Full architectural drone cinematography & live stream',
      'Orchestral symphonic prelude for ceremony walk',
      '24/7 Concierge team of 18 executive producers',
    ],
  },
]

// 8 curated wedding cards so the 3D ring geometry is full, symmetric and evenly balanced (Point 5)
const WEDDING_GALLERY = [
  {
    id: 'w1',
    title: 'Rhea & Devansh',
    subtitle: 'Golden hour pheras on lake Pichola',
    category: 'ROYAL WEDDING · UDAIPUR',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    stats: '280 Guests · 3 Days',
  },
  {
    id: 'w2',
    title: 'Tara & Siddharth',
    subtitle: 'Minimalist sage and champagne floral arch',
    category: 'ESTATE SOVEREIGN · JAIPUR',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    stats: '160 Guests',
  },
  {
    id: 'w3',
    title: 'Ananya & Vivaan',
    subtitle: 'Royal palace sangeet & floral mandap',
    category: 'SOLARIUM WEDDING · DELHI',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    stats: '320 Guests',
  },
  {
    id: 'w4',
    title: 'Meera & Aryan',
    subtitle: 'Beachside sunset mandap with acoustic ocean vibes',
    category: 'COASTAL VOWS · GOA',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    stats: '190 Guests',
  },
  {
    id: 'w5',
    title: 'Kavya & Arjun',
    subtitle: 'Palace courtyards candlelit sitar symphonies',
    category: 'PALACE FORT · JODHPUR',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    stats: '450 Guests · 3 Days',
  },
  {
    id: 'w6',
    title: 'Sanjana & Kabir',
    subtitle: 'Solarium glasshouse vows under hanging floral chandeliers',
    category: 'BOTANICAL GLASS · CHENNAI',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    stats: '210 Guests · Twilight',
  },
  {
    id: 'w7',
    title: 'Pooja & Rohan',
    subtitle: 'Vintage convertible getaway under celebratory sparklers',
    category: 'HERITAGE HAVELI · JAIPUR',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    stats: '340 Guests',
  },
  {
    id: 'w8',
    title: 'Ishita & Nirav',
    subtitle: 'Lakeside mehendi with artisanal marigold pergolas',
    category: 'ISLAND PALACE · UDAIPUR',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    stats: '175 Guests · Sitar Quartet',
  },
]

const WEDDING_QUOTES = [
  {
    id: 'wq1',
    quote:
      'We wanted our wedding to feel like an intimate editorial dream, not a noisy commercial spectacle. EventGpt delivered poetry in motion.',
    name: 'Tarini Jindal & Yashvardhan',
    role: 'Couples · Fort Barwara',
    eventType: 'ROYAL WEDDING',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'wq2',
    quote:
      'The AI timeline builder gave both families clear call times. No rushed photos, no cold food, just pure joy from morning till night.',
    name: 'Rohit Aggarwal',
    role: 'Father of the Bride · Udaipur',
    eventType: 'PALACE WEDDING',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
]

const WEDDING_FAQ = [
  {
    question: 'How does EventGpt maintain budget transparency for multi-day weddings?',
    answer:
      'We generate an unbundled budget ledger across catering, decor, acoustics, hospitality, and licenses. You see exact line-item costs with zero marked-up hidden commissions.',
  },
  {
    question: 'Can you orchestrate destination weddings in Udaipur, Jaipur, or Goa?',
    answer:
      'Yes. Our executive producer hubs are stationed in all major wedding hubs across Rajasthan, Goa, and Maharashtra with dedicated hotel liaison and charter fleet coordination.',
  },
  {
    question: 'How do you coordinate dietary and cultural meal requirements?',
    answer:
      'The guest list engine tags strict Jain, vegan, Halal, gluten-free, and children requirements, automatically routing ingredient specs directly to the banquet executive chef.',
  },
  {
    question: 'What is the payment milestone breakdown?',
    answer:
      'We require a 30% advance to lock your date and primary venue contracts. 40% is due 45 days prior, and the final 30% settles after pre-event technical dry run.',
  },
]

export default function WeddingPage() {
  const router = useRouter()
  const { stopLenis } = useLenis()
  const [selectedTimeline, setSelectedTimeline] = useState(0)
  const [returnPillOpacity, setReturnPillOpacity] = useState(0)

  // Synchronous scroll reset on arrival to prevent any scroll jump (Point 2)
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [])

  // Point 4: Scroll back from Wedding to Concert when at scrollY === 0 and wheeling up
  useEffect(() => {
    let accumulatedDelta = 0
    let touchStartY = 0
    let armed = false

    // 800ms cooldown after mount so arrival momentum doesn't trigger back
    const timer = setTimeout(() => {
      armed = true
    }, 800)

    const triggerReturnToConcert = () => {
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-nav-theme')
      }
      router.push('/music-concert')
    }

    const handleWheel = (e: WheelEvent) => {
      if (!armed) return
      const scrollY = window.scrollY || document.documentElement.scrollTop
      if (scrollY <= 5 && e.deltaY < 0) {
        accumulatedDelta += -e.deltaY
        setReturnPillOpacity(Math.min(accumulatedDelta / 150, 1))
        if (accumulatedDelta >= 200) {
          accumulatedDelta = 0
          triggerReturnToConcert()
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
          triggerReturnToConcert()
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
    <div data-theme="wedding" className="w-full bg-[#F6F0E6] text-[#1C1A17] overflow-x-hidden">
      {/* Scroll-back Indicator Pill (Point 4) */}
      <div
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-200"
        style={{ opacity: returnPillOpacity }}
      >
        <div className="px-4 py-2 rounded-full border border-[#8FA98A]/50 bg-[#F6F0E6]/95 backdrop-blur-md text-xs font-mono font-semibold tracking-wider text-[#1C1A17] flex items-center gap-2 shadow-xl">
          <span>↑</span>
          <span>RELEASE TO RETURN TO CONCERT</span>
        </div>
      </div>

      {/* 1. Synchronously Rendered Hero with wedding.mp4 loop, heading 'Wedding', editorial subtitle */}
      <Hero
        videoSrc="/media/wedding.mp4"
        word="Wedding"
        targetLetter="d"
        nextHref="/birthday-party"
        nextTheme="birthday"
        nextLabel="Birthday Lounge"
        leadText="Curated botanical architecture, palace acoustics, and seamless multi-day coordination."
        primaryCtaText="Curate Wedding Plan"
        primaryCtaHref="/chat"
        secondaryCtaText="Explore Ceremonies"
        secondaryCtaHref="#timeline"
        centerAlign={true}
        editorialSubtitle="Your day, quietly unforgettable."
        isLightWedding={true}
      />

      {/* Wedding Journey Timeline */}
      <section id="timeline" className="w-full py-28 max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="label-mono text-[#8FA98A] mb-3">MULTI-DAY CHRONOLOGY</p>
              <h2 className="h2 text-[#1C1A17] mb-4">The Wedding Journey</h2>
              <p className="body-default text-[#6e6259] max-w-lg mx-auto">
                From the intimate sunset engagement to the final sparkler farewell.
              </p>
            </div>

            {/* Timeline Navigation Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-3 justify-start sm:justify-center mb-12 scrollbar-none">
              {WEDDING_TIMELINE_STEPS.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTimeline(idx)}
                  className={`px-5 py-3 rounded-full text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                    selectedTimeline === idx
                      ? 'bg-[#8FA98A] text-white font-bold shadow-md'
                      : 'bg-[#EFE7DA] text-[#6e6259] hover:bg-[#E2D8C7]'
                  }`}
                >
                  {step.step} · {step.name}
                </button>
              ))}
            </div>

            {/* Selected Step Spotlight */}
            <div className="p-8 sm:p-12 rounded-[32px] bg-[#EFE7DA] border border-[#8FA98A]/30 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="flex-1">
                <span className="label-mono text-[#8FA98A] text-xs font-bold">
                  {WEDDING_TIMELINE_STEPS[selectedTimeline].timing}
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#1C1A17] mt-2 mb-3">
                  {WEDDING_TIMELINE_STEPS[selectedTimeline].name}
                </h3>
                <p className="serif-italic text-lg text-[#6e6259] mb-4">
                  &ldquo;{WEDDING_TIMELINE_STEPS[selectedTimeline].lead}&rdquo;
                </p>
                <p className="body-default text-[#3d3630] leading-relaxed">
                  {WEDDING_TIMELINE_STEPS[selectedTimeline].desc}
                </p>
              </div>

              <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={WEDDING_MOODBOARD[selectedTimeline % WEDDING_MOODBOARD.length].img}
                  alt="Timeline preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>

          {/* 3. Venue & Decor Moodboard Masonry */}
          <section className="w-full py-28 bg-[#EFE7DA]/60 border-y border-[#8FA98A]/20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                <p className="label-mono text-[#8FA98A] mb-3">CURATED AESTHETICS</p>
                <h2 className="h2 text-[#1C1A17] mb-4">Venue & Floral Moodboard</h2>
                <p className="body-default text-[#6e6259] max-w-lg mx-auto">
                  Realized installations blending heirloom architecture with bespoke botanical beauty.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {WEDDING_MOODBOARD.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative h-96 rounded-3xl overflow-hidden border border-[#8FA98A]/20 bg-white shadow-md flex flex-col justify-end p-6 hover:shadow-2xl transition-all"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A17] via-[#1C1A17]/40 to-transparent" />
                    <div className="relative z-10 text-white">
                      <span className="label-mono text-[10px] text-[#E9D8C4] tracking-wider uppercase mb-1 block">
                        {item.tag}
                      </span>
                      <h4 className="font-display font-bold text-lg leading-tight">{item.title}</h4>
                      <p className="caption text-white/80 text-xs mt-1">{item.loc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Packages in INR */}
          <section className="w-full py-28 max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <p className="label-mono text-[#8FA98A] mb-3">CURATED INVESTMENT TIERS</p>
              <h2 className="h2 text-[#1C1A17] mb-4">Wedding Packages</h2>
              <p className="body-default text-[#6e6259] max-w-lg mx-auto">
                Clear, honest luxury production contracts with zero surprise line items.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {WEDDING_PACKAGES.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all ${
                    pkg.popular
                      ? 'border-[#8FA98A] bg-white shadow-2xl relative scale-105'
                      : 'border-[#8FA98A]/20 bg-[#EFE7DA] hover:border-[#8FA98A]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="label-mono text-xs px-3 py-1 rounded-full bg-[#8FA98A]/20 text-[#2f492a] font-bold">
                        {pkg.badge}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-2xl text-[#1C1A17] mb-2">{pkg.name}</h3>
                    <p className="caption text-[#6e6259] mb-6">{pkg.guestRange}</p>

                    <div className="mb-8">
                      <span className="font-mono text-4xl font-extrabold text-[#1C1A17]">
                        {pkg.price}
                      </span>
                      <span className="caption text-[#6e6259] ml-2">+ 18% GST</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-sm text-[#3d3630]">
                          <span className="text-[#8FA98A] font-bold">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/chat"
                    className={`w-full h-13 rounded-full flex items-center justify-center font-body font-bold text-sm tracking-wide transition-all ${
                      pkg.popular
                        ? 'bg-[#8FA98A] text-white hover:brightness-105 shadow-md'
                        : 'border border-[#8FA98A] text-[#1C1A17] hover:bg-[#8FA98A]/10'
                    }`}
                  >
                    Add to Plan →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Signature Feature: 3D Ring Gallery with 8 Curated Cards (Point 5) */}
          <RingGallery
            items={WEDDING_GALLERY}
            heading="WEDDING PORTFOLIO"
            title="Portraits of Mastercrafted Nights"
          />

          {/* 6. Quote Deck */}
          <QuoteDeck quotes={WEDDING_QUOTES} heading="WORDS FROM COUPLES & FAMILIES" />

          {/* 7. FAQ Chat */}
          <FAQChat items={WEDDING_FAQ} />

          {/* 8. CTA Banner (Champagne to sage, dark text) */}
          <CTABanner
            heading="Begin Your Wedding Architecture"
            subheading="Let EventGpt weave palace courtyards, tuberose mandaps, and Michelin banquets into an unforgettable celebration."
            ctaText="Plan Wedding with AI"
            ctaHref="/chat"
            accentLabel="LIMITED DESTINATION DATES FOR 2026/2027"
          />

          {/* 9. Next Horizon: Expanding Birthday Banner */}
          <BirthdayBanner />
    </div>
  )
}
