'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsSubscribed(true)
    toast.success('You have been added to the EventGpt Guest List!')
  }

  return (
    <footer className="relative w-full bg-[#C4623A] pt-16 pb-0 overflow-hidden text-[#1C1A17]">
      {/* Cream Card Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-12">
        <div className="rounded-[32px] bg-[#F5EBDD] p-8 sm:p-12 lg:p-16 shadow-2xl border border-[#C4623A]/15">
          {/* Main Grid: Left Wordmark, Centre Newsletter, Right 4 Link Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[#C4623A]/20">
            {/* Left: EventGpt Wordmark + Tagline */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <Link href="/" className="inline-block">
                  <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#C4623A] tracking-tight">
                    EventGpt
                  </h3>
                </Link>
                <p className="mt-3 text-sm text-[#3d3630] font-body max-w-sm leading-relaxed">
                  The producer-grade event planning intelligence. Uniting architectural sound, botanical decor, and predictive orchestration across India.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="label-mono text-xs text-[#6e6259]">
                  Live in 38 Cities · New Delhi HQ
                </span>
              </div>
            </div>

            {/* Centre: Newsletter Signup */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <span className="label-mono text-xs text-[#C4623A] font-semibold mb-2">
                INSIDER ACCESS
              </span>
              <h4 className="font-display font-bold text-xl text-[#14100d] mb-2">
                Join the Private Guest List
              </h4>
              <p className="text-xs text-[#6e6259] mb-4">
                Receive weekly venue drops, curatorial palettes, and generative prompt templates.
              </p>

              {isSubscribed ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium">
                  ✓ Welcome aboard. Check your inbox for the EventGpt Curatorial Guide.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="producer@studio.com"
                      className="flex-1 px-4 py-2.5 rounded-full border border-[#C4623A]/30 bg-white/80 text-sm text-[#14100d] placeholder:text-[#9aa2ad] focus:outline-none focus:border-[#C4623A] transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-[#C4623A] text-white text-xs font-bold tracking-wide uppercase hover:bg-[#9E4A2A] transition-colors whitespace-nowrap shadow-sm"
                    >
                      Join
                    </button>
                  </div>
                  <span className="text-[11px] text-[#8f5e25]">
                    Zero spam. Unsubscribe anytime with one tap.
                  </span>
                </form>
              )}
            </div>

            {/* Right: Four Link Columns */}
            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-body">
              {/* Events */}
              <div>
                <h5 className="font-display font-bold text-[#14100d] mb-3 text-sm">
                  Events
                </h5>
                <ul className="space-y-2 text-[#4d2e0f]">
                  <li>
                    <Link href="/music-concert" className="hover:text-[#C4623A] transition-colors">
                      Concerts
                    </Link>
                  </li>
                  <li>
                    <Link href="/wedding" className="hover:text-[#C4623A] transition-colors">
                      Weddings
                    </Link>
                  </li>
                  <li>
                    <Link href="/birthday-party" className="hover:text-[#C4623A] transition-colors">
                      Birthdays
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="hover:text-[#C4623A] transition-colors">
                      Corporate
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Plan with AI */}
              <div>
                <h5 className="font-display font-bold text-[#14100d] mb-3 text-sm">
                  AI Suite
                </h5>
                <ul className="space-y-2 text-[#4d2e0f]">
                  <li>
                    <Link href="/chat" className="hover:text-[#C4623A] transition-colors">
                      Chat Assistant
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="hover:text-[#C4623A] transition-colors">
                      Plan with AI
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="hover:text-[#C4623A] transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:text-[#C4623A] transition-colors">
                      Checkout
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h5 className="font-display font-bold text-[#14100d] mb-3 text-sm">
                  Company
                </h5>
                <ul className="space-y-2 text-[#4d2e0f]">
                  <li>
                    <Link href="/" className="hover:text-[#C4623A] transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/music-concert" className="hover:text-[#C4623A] transition-colors">
                      Portfolio
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-[#C4623A] transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="/chat" className="hover:text-[#C4623A] transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h5 className="font-display font-bold text-[#14100d] mb-3 text-sm">
                  Support
                </h5>
                <ul className="space-y-2 text-[#4d2e0f]">
                  <li>
                    <a href="#faq" className="hover:text-[#C4623A] transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:text-[#C4623A] transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:text-[#C4623A] transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/checkout" className="hover:text-[#C4623A] transition-colors">
                      Refunds
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom strip inside cream card: Socials and © line */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8f5e25]">
            <p>© {new Date().getFullYear()} EventGpt Inc. Built for Mayank / Niora Star. All rights reserved.</p>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4623A]">
                TWITTER / X
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4623A]">
                INSTAGRAM
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4623A]">
                LINKEDIN
              </a>
              <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4623A]">
                SPOTIFY PLAYLISTS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Illustrated Skyline of Indian Monuments in Darker Terracotta (#9E4A2A) */}
      <div className="w-full relative overflow-hidden pointer-events-none mt-2">
        <svg
          viewBox="0 0 1440 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto transform transition-transform duration-1000 ease-out"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
        >
          {/* Base Groundline */}
          <path d="M0 216H1440V220H0V216Z" fill="#9E4A2A" />

          {/* Monument 1: India Gate (New Delhi) ~ x: 120-220 */}
          <g fill="#9E4A2A">
            <rect x="130" y="80" width="80" height="136" rx="2" />
            <rect x="120" y="70" width="100" height="12" rx="2" />
            <rect x="140" y="58" width="60" height="14" rx="2" />
            {/* Arch opening */}
            <path
              d="M150 216V130C150 118 160 110 170 110C180 110 190 118 190 130V216H150Z"
              fill="#C4623A"
            />
          </g>

          {/* Monument 2: Qutub Minar (New Delhi) ~ x: 280-320 */}
          <g fill="#9E4A2A">
            <polygon points="290,216 295,30 305,30 310,216" />
            <rect x="293" y="24" width="14" height="8" rx="1" />
            <polygon points="300,10 297,24 303,24" />
            {/* Minar Balconies */}
            <rect x="292" y="70" width="16" height="4" rx="1" />
            <rect x="293" y="115" width="14" height="4" rx="1" />
            <rect x="294" y="160" width="12" height="4" rx="1" />
          </g>

          {/* Monument 3: Hawa Mahal (Jaipur) ~ x: 380-500 */}
          <g fill="#9E4A2A">
            <path d="M400 216V95L440 60L480 95V216H400Z" />
            <polygon points="440,40 435,60 445,60" />
            {/* Jharokhas Windows */}
            <circle cx="440" cy="85" r="8" fill="#C4623A" />
            <circle cx="425" cy="115" r="7" fill="#C4623A" />
            <circle cx="455" cy="115" r="7" fill="#C4623A" />
            <circle cx="415" cy="145" r="7" fill="#C4623A" />
            <circle cx="440" cy="145" r="7" fill="#C4623A" />
            <circle cx="465" cy="145" r="7" fill="#C4623A" />
            <circle cx="415" cy="175" r="7" fill="#C4623A" />
            <circle cx="440" cy="175" r="7" fill="#C4623A" />
            <circle cx="465" cy="175" r="7" fill="#C4623A" />
          </g>

          {/* Monument 4: TAJ MAHAL (Agra) — Centrepiece ~ x: 600-840 */}
          <g fill="#9E4A2A">
            {/* Main Plinth */}
            <rect x="620" y="180" width="200" height="36" />
            {/* Main Center Building */}
            <rect x="645" y="90" width="150" height="92" rx="2" />
            {/* Central Arch Portal */}
            <path
              d="M690 180V120C690 105 705 95 720 95C735 95 750 105 750 120V180H690Z"
              fill="#C4623A"
            />
            {/* Main Central Onion Dome */}
            <path
              d="M685 92C685 45 720 20 720 20C720 20 755 45 755 92H685Z"
            />
            {/* Spire */}
            <line x1="720" y1="20" x2="720" y2="4" stroke="#9E4A2A" strokeWidth="3" />
            {/* Left Chhatri */}
            <rect x="660" y="70" width="16" height="20" rx="1" />
            <path d="M657 70C657 58 668 50 668 50C668 50 679 58 679 70H657Z" />
            {/* Right Chhatri */}
            <rect x="764" y="70" width="16" height="20" rx="1" />
            <path d="M761 70C761 58 772 50 772 50C772 50 783 58 783 70H761Z" />

            {/* Left Flanking Minaret */}
            <polygon points="595,216 600,45 606,45 611,216" />
            <path d="M598 45C598 38 603 32 603 32C603 32 608 38 608 45H598Z" />
            <rect x="596" y="95" width="14" height="4" />
            <rect x="597" y="145" width="12" height="4" />

            {/* Right Flanking Minaret */}
            <polygon points="829,216 834,45 840,45 845,216" />
            <path d="M832 45C832 38 837 32 837 32C837 32 842 38 842 45H832Z" />
            <rect x="830" y="95" width="14" height="4" />
            <rect x="831" y="145" width="12" height="4" />
          </g>

          {/* Monument 5: Charminar (Hyderabad) ~ x: 920-1040 */}
          <g fill="#9E4A2A">
            <rect x="940" y="90" width="80" height="126" />
            {/* Main Archway */}
            <path
              d="M960 216V145C960 130 970 120 980 120C990 120 1000 130 1000 145V216H960Z"
              fill="#C4623A"
            />
            {/* 4 Minarets (Front 2 visible) */}
            <polygon points="932,216 937,28 943,28 948,216" />
            <path d="M935 28C935 22 940 16 940 16C940 16 945 22 945 28H935Z" />
            <polygon points="1012,216 1017,28 1023,28 1028,216" />
            <path d="M1015 28C1015 22 1020 16 1020 16C1020 16 1025 22 1025 28H1015Z" />
          </g>

          {/* Monument 6: Gateway of India (Mumbai) ~ x: 1090-1210 */}
          <g fill="#9E4A2A">
            <rect x="1100" y="75" width="100" height="141" rx="2" />
            <rect x="1090" y="65" width="120" height="12" rx="2" />
            {/* Big Center Arch */}
            <path
              d="M1130 216V130C1130 110 1140 98 1150 98C1160 98 1170 110 1170 130V216H1130Z"
              fill="#C4623A"
            />
            {/* Side Arches */}
            <path d="M1108 216V160C1108 152 1114 146 1120 146C1126 146 1132 152 1132 160V216H1108Z" fill="#C4623A" />
            <path d="M1168 216V160C1168 152 1174 146 1180 146C1186 146 1192 152 1192 160V216H1168Z" fill="#C4623A" />
            {/* Top Domelet */}
            <path d="M1135 65C1135 45 1150 35 1150 35C1150 35 1165 45 1165 65H1135Z" />
          </g>

          {/* Monument 7: Lotus Temple (New Delhi) ~ x: 1260-1380 */}
          <g fill="#9E4A2A">
            <path d="M1280 216C1280 170 1300 115 1320 85C1340 115 1360 170 1360 216H1280Z" />
            <path d="M1295 216C1295 180 1310 135 1320 100C1330 135 1345 180 1345 216H1295Z" fill="#C4623A" />
            <path d="M1310 216C1310 190 1316 160 1320 135C1324 160 1330 190 1330 216H1310Z" fill="#9E4A2A" />
          </g>
        </svg>
      </div>
    </footer>
  )
}

