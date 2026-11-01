'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ConfettiCanvas from '@/components/motion/ConfettiCanvas'

export default function CheckoutPage() {
  // Crumpled receipt unfolds on load (Handbook M7)
  const [isReceiptUnfolded, setIsReceiptUnfolded] = useState(false)

  // Payment form state
  const [payAdvance, setPayAdvance] = useState(true) // 30% advance option
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  // Success state modal (Handbook 7.7.4)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingId, setBookingId] = useState('')

  // Pricing calculations
  const baseTotal = 1800000 // ₹18,00,000 base
  const gst = Math.round(baseTotal * 0.18) // 18% GST
  const subTotal = baseTotal + gst - promoDiscount
  const advanceAmount = Math.round(subTotal * 0.3) // 30% advance
  const payableNow = payAdvance ? advanceAmount : subTotal

  useEffect(() => {
    // Unfold receipt with animation (M7)
    const timer = setTimeout(() => {
      setIsReceiptUnfolded(true)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.trim().toUpperCase() === 'NIORA' || promoCode.trim().toUpperCase() === 'PRODUCER') {
      setPromoDiscount(50000)
    }
  }

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const id = `EVT-${Math.floor(100000 + Math.random() * 900000)}`
    setBookingId(id)
    setIsBooked(true)
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div data-theme="checkout" className="w-full bg-ink-950 text-ivory-50 min-h-screen flex flex-col">
      {/* 1. Slim Nav: Logo, Secure Badge, Back to Plan */}
      <header className="w-full h-16 border-b border-ink-700 bg-ink-900/80 backdrop-blur-xl px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent text-ink-950 font-bold flex items-center justify-center text-xs">
            ✦
          </span>
          <span className="font-display font-extrabold text-lg text-white">EventGpt</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
          <span>🔒</span>
          <span>256-BIT ENCRYPTED PRODUCTION ESCROW</span>
        </div>

        <Link
          href="/chat"
          className="text-xs font-mono text-muted hover:text-white transition-colors"
        >
          ← Return to Chat
        </Link>
      </header>

      {/* Main 2-Column Checkout Layout */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
        {/* Left Column (Col 7): Contact, Event Details, Add-ons, Payment */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-white">
              Secure Event Checkout
            </h1>
            <p className="caption text-muted mt-1">
              Lock production dates and vendor teams across India.
            </p>
          </div>

          <form onSubmit={handleCompleteBooking} className="space-y-8">
            {/* Contact Details */}
            <div className="p-6 sm:p-8 rounded-3xl border border-ink-700 bg-ink-900 shadow-xl space-y-4">
              <span className="label-mono text-accent text-xs">SECTION 01</span>
              <h3 className="font-display font-bold text-xl text-white">Host Contact Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">FULL NAME</label>
                  <input
                    type="text"
                    required
                    defaultValue="Mayank"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    defaultValue="mayank@niorastar.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="label-mono text-muted text-[10px] block mb-1">PHONE NUMBER</label>
                <input
                  type="tel"
                  required
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Event Specifics */}
            <div className="p-6 sm:p-8 rounded-3xl border border-ink-700 bg-ink-900 shadow-xl space-y-4">
              <span className="label-mono text-accent text-xs">SECTION 02</span>
              <h3 className="font-display font-bold text-xl text-white">Event Logistical Hold</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">RESERVED DATE</label>
                  <input
                    type="date"
                    required
                    defaultValue="2026-11-20"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50 font-mono"
                  />
                </div>
                <div>
                  <label className="label-mono text-muted text-[10px] block mb-1">PRIMARY CITY</label>
                  <input
                    type="text"
                    required
                    defaultValue="Mumbai / Udaipur"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50"
                  />
                </div>
              </div>
              <div>
                <label className="label-mono text-muted text-[10px] block mb-1">SPECIAL CURATORIAL NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Acoustic rider nuances, dietary restrictions, arrival gate preferences..."
                  className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-sm text-ivory-50 placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Payment Method & 30% Advance Toggle */}
            <div className="p-6 sm:p-8 rounded-3xl border border-ink-700 bg-ink-900 shadow-xl space-y-6">
              <span className="label-mono text-accent text-xs">SECTION 03</span>
              <h3 className="font-display font-bold text-xl text-white">Payment Options</h3>

              {/* 30% Advance Toggle Card */}
              <div
                onClick={() => setPayAdvance(!payAdvance)}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  payAdvance
                    ? 'border-accent bg-accent/10 shadow-md'
                    : 'border-ink-700 bg-ink-950/60'
                }`}
              >
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    30% Advance Production Deposit
                  </h4>
                  <p className="caption text-muted mt-0.5">
                    Pay {formatINR(advanceAmount)} today to lock date. Remaining balance due 14 days prior to event.
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                    payAdvance ? 'border-accent bg-accent text-ink-950' : 'border-ink-700'
                  }`}
                >
                  {payAdvance && '✓'}
                </div>
              </div>

              {/* Method Selector: UPI, Cards, Net Banking */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: '📱' },
                  { id: 'card', label: 'Cards (Visa/MC)', icon: '💳' },
                  { id: 'netbanking', label: 'Net Banking', icon: '🏛️' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-accent bg-accent/10 text-white font-bold'
                        : 'border-ink-700 bg-ink-950 text-muted hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Promo Code (e.g. NIORA)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ink-950 border border-ink-700 text-xs font-mono uppercase text-ivory-50 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-xl border border-accent text-accent font-mono text-xs font-bold hover:bg-accent/10"
                >
                  Apply
                </button>
              </div>
              {promoDiscount > 0 && (
                <p className="text-xs font-mono text-emerald-400">
                  ✓ NIORA Producer Code Applied: -{formatINR(promoDiscount)} discount
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-primary w-full h-14 text-base font-bold shadow-2xl"
              >
                Confirm & Pay {formatINR(payableNow)} →
              </button>
            </div>
          </form>

          {/* Trust Row (Handbook 7.7.3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-700/60 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>100% Refundable up to 30 days prior</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Zero Marked-up Vendor Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>24/7 Executive Producer Concierge</span>
            </div>
          </div>
        </div>

        {/* Right Column (Col 5): Sticky Order Summary as Crumpled-to-Flat Unfolding Receipt (M7) */}
        <div className="lg:col-span-5">
          <div
            className={`sticky top-24 rounded-3xl border border-ink-700 bg-ivory-50 text-[#1C1A17] p-8 shadow-2xl transition-all duration-700 ${
              isReceiptUnfolded
                ? 'scale-100 rotate-0 filter blur-0 opacity-100'
                : 'scale-95 rotate-2 filter blur-[1px] opacity-70'
            }`}
            style={{
              backgroundImage: 'radial-gradient(#1C1A17 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Receipt Header */}
            <div className="text-center pb-6 border-b-2 border-dashed border-[#1C1A17]/25">
              <span className="font-mono text-[10px] tracking-widest uppercase block text-[#6e6259]">
                EVENTGPT ESCROW DISPATCH
              </span>
              <h3 className="font-display font-extrabold text-2xl tracking-tight text-[#1C1A17] mt-1">
                Production Order
              </h3>
              <span className="font-mono text-xs text-[#8f5e25]">
                REF: {bookingId || 'EST-2026-HQ'}
              </span>
            </div>

            {/* Receipt Line Items */}
            <div className="py-6 space-y-3 font-mono text-xs border-b-2 border-dashed border-[#1C1A17]/25">
              <div className="flex justify-between items-center">
                <span className="text-[#3d3630]">1x Sovereign Event Production Base</span>
                <span className="font-bold">{formatINR(baseTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[#6e6259]">
                <span>· L-Acoustics K2 Rigging & Tuning</span>
                <span>INCL</span>
              </div>
              <div className="flex justify-between items-center text-[#6e6259]">
                <span>· Botanical Mandap / Stage Arch</span>
                <span>INCL</span>
              </div>
              <div className="flex justify-between items-center text-[#6e6259]">
                <span>· 18 Executive Producer Shifts</span>
                <span>INCL</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Promo Code Discount</span>
                  <span>-{formatINR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#6e6259] pt-2 border-t border-[#1C1A17]/10">
                <span>Government GST (18%)</span>
                <span>{formatINR(gst)}</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="py-6 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Contract Value</span>
                <span className="font-mono text-lg">{formatINR(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-extrabold text-[#C4623A] pt-2 border-t border-[#1C1A17]/10">
                <span>Payable Today ({payAdvance ? '30% Advance' : 'Full'})</span>
                <span className="font-mono text-2xl">{formatINR(payableNow)}</span>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="pt-4 flex flex-col items-center">
              <div className="w-full h-8 flex justify-between gap-1 opacity-70">
                {Array.from({ length: 48 }).map((_, bIdx) => (
                  <div
                    key={bIdx}
                    className="h-full bg-[#1C1A17]"
                    style={{ width: `${(bIdx % 3) + 1}px` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-[#6e6259] tracking-widest mt-1">
                * EVENTGPT VERIFIED DISPATCH *
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Booking Confirmation Success State (Handbook 7.7.4) */}
      {isBooked && (
        <>
          <ConfettiCanvas durationMs={5000} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/90 backdrop-blur-3xl">
            <div className="max-w-md w-full p-8 rounded-[32px] border border-accent bg-ink-900 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent flex items-center justify-center mx-auto text-3xl text-accent">
                ✦
              </div>

              <div>
                <span className="label-mono text-accent text-xs">RESERVATION CONFIRMED</span>
                <h3 className="font-display font-extrabold text-2xl text-white mt-1">
                  Curtain Up on Your Event!
                </h3>
                <p className="caption text-muted mt-2">
                  Your primary venue hold and audio engineering slots have been secured.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ink-950 border border-ink-700">
                <span className="label-mono text-muted text-[10px] block">OFFICIAL BOOKING ID</span>
                <span className="font-mono text-2xl font-bold text-accent tracking-widest">
                  {bookingId}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => alert(`Added ${bookingId} to calendar!`)}
                  className="btn-secondary w-full text-xs h-12"
                >
                  📅 Add to Calendar (.ics)
                </button>
                <Link
                  href="/chat"
                  className="btn-primary w-full text-xs h-12"
                >
                  Chat with Your Planner →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

