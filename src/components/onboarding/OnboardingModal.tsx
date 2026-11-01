'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import type { EventType } from '@/types'
import toast from 'react-hot-toast'

const EVENT_TYPES: { type: EventType; icon: string; label: string; desc: string; color: string; bg: string }[] = [
  {
    type: 'wedding',
    icon: '💍',
    label: 'Wedding',
    desc: 'Ceremonies, receptions, and everything in between',
    color: '#cc4569',
    bg: 'from-blush-50 to-cream-50',
  },
  {
    type: 'birthday',
    icon: '🎂',
    label: 'Birthday',
    desc: 'Intimate dinners to full-scale celebrations',
    color: '#d97706',
    bg: 'from-gold-50 to-cream-50',
  },
  {
    type: 'community',
    icon: '🌟',
    label: 'Community Event',
    desc: 'Festivals, fundraisers, and gatherings',
    color: '#059669',
    bg: 'from-emerald-50 to-cream-50',
  },
]

const STEPS = ['Event Type', 'Details', 'Budget']

interface OnboardingModalProps {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const createEvent = useStore((s) => s.createEvent)
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [form, setForm] = useState({
    title: '',
    date: '',
    guestCount: 50,
    budget: 10000,
  })

  const handleCreate = () => {
    if (!selectedType || !form.title || !form.date) {
      toast.error('Please fill in all required fields')
      return
    }
    createEvent(selectedType, form.title, form.date, form.guestCount, form.budget)
    toast.success(`${form.title} created! Let's start planning 🎉`, { duration: 4000 })
    onClose()
  }

  const isStepValid = () => {
    if (step === 0) return selectedType !== null
    if (step === 1) return form.title.trim() !== '' && form.date !== ''
    return true
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-label="Close dialog"
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-cream-50 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top decoration */}
        <div className="relative h-2 bg-gradient-to-r from-blush-400 via-gold-400 to-emerald-400" aria-hidden="true" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 id="onboarding-title" className="font-display text-2xl font-semibold text-ink-900">
                Let's plan your event ✦
              </h2>
              <p className="mt-1 text-sm text-ink-500">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700 focus-visible:outline-gold-500"
              aria-label="Close dialog"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
            {STEPS.map((s, i) => (
              <div key={s} className="h-1.5 flex-1 rounded-full bg-cream-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[300px] px-8 pb-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-5 text-sm text-ink-600">What are you celebrating?</p>
                <div className="space-y-3" role="radiogroup" aria-label="Event type">
                  {EVENT_TYPES.map((et) => (
                    <motion.button
                      key={et.type}
                      onClick={() => setSelectedType(et.type)}
                      className={`group w-full rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
                        selectedType === et.type
                          ? 'border-transparent shadow-card'
                          : 'border-cream-200 bg-white/50 hover:border-cream-300'
                      }`}
                      style={
                        selectedType === et.type
                          ? { borderColor: et.color, backgroundColor: `${et.color}08` }
                          : {}
                      }
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      role="radio"
                      aria-checked={selectedType === et.type}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl" aria-hidden="true">{et.icon}</span>
                        <div>
                          <p className="font-semibold text-ink-900">{et.label}</p>
                          <p className="text-xs text-ink-500">{et.desc}</p>
                        </div>
                        {selectedType === et.type && (
                          <motion.div
                            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ backgroundColor: et.color }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                            aria-hidden="true"
                          >
                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-5 text-sm text-ink-600">Tell us about your event</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="event-title" className="mb-1.5 block text-sm font-medium text-ink-700">
                      Event Name <span className="text-blush-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      placeholder={selectedType === 'wedding' ? "e.g., Sarah & James's Wedding" : selectedType === 'birthday' ? "e.g., Emma's 30th Birthday" : "e.g., Summer Community Festival"}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink-900 placeholder-ink-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="event-date" className="mb-1.5 block text-sm font-medium text-ink-700">
                      Event Date <span className="text-blush-500" aria-label="required">*</span>
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-ink-900 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guest-count" className="mb-1.5 block text-sm font-medium text-ink-700">
                      Expected Guests: <strong className="text-gold-600">{form.guestCount}</strong>
                    </label>
                    <input
                      id="guest-count"
                      type="range"
                      min={10}
                      max={1000}
                      step={10}
                      value={form.guestCount}
                      onChange={(e) => setForm({ ...form, guestCount: parseInt(e.target.value) })}
                      className="w-full accent-gold-500"
                      aria-label={`Guest count: ${form.guestCount}`}
                    />
                    <div className="mt-1 flex justify-between text-xs text-ink-400">
                      <span>10</span>
                      <span>1,000</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-5 text-sm text-ink-600">Set your total budget</p>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-gold-50 to-cream-100 p-6 text-center">
                    <p className="mb-1 text-xs text-ink-500 uppercase tracking-wider">Total Budget</p>
                    <p className="font-display text-5xl font-light text-ink-900">
                      ${form.budget.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-ink-400">
                      ~${Math.round(form.budget / form.guestCount).toLocaleString()} per guest
                    </p>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={200000}
                    step={500}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) })}
                    className="w-full accent-gold-500"
                    aria-label={`Budget: $${form.budget.toLocaleString()}`}
                  />
                  <div className="flex justify-between text-xs text-ink-400">
                    <span>$500</span>
                    <span>$200,000</span>
                  </div>

                  <div className="rounded-xl border border-cream-200 bg-white/60 p-4">
                    <p className="mb-2 text-xs font-medium text-ink-600 uppercase tracking-wider">
                      Budget will be split automatically:
                    </p>
                    {selectedType === 'wedding' && (
                      <div className="space-y-1.5">
                        {[['Venue', 30], ['Catering', 25], ['Photography', 10], ['Décor', 10], ['Entertainment', 8], ['Other', 17]].map(([cat, pct]) => (
                          <div key={cat as string} className="flex items-center justify-between text-xs">
                            <span className="text-ink-600">{cat}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-cream-200 overflow-hidden">
                                <div className="h-full bg-blush-400 rounded-full" style={{ width: `${pct}%` }} aria-hidden="true" />
                              </div>
                              <span className="text-ink-500 w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedType === 'birthday' && (
                      <div className="space-y-1.5">
                        {[['Catering & Cake', 30], ['Venue', 25], ['Entertainment', 20], ['Decorations', 15], ['Other', 10]].map(([cat, pct]) => (
                          <div key={cat as string} className="flex items-center justify-between text-xs">
                            <span className="text-ink-600">{cat}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-cream-200 overflow-hidden">
                                <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} aria-hidden="true" />
                              </div>
                              <span className="text-ink-500 w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedType === 'community' && (
                      <div className="space-y-1.5">
                        {[['Venue & Permits', 25], ['Equipment', 20], ['Food & Bev', 20], ['Marketing', 15], ['Other', 20]].map(([cat, pct]) => (
                          <div key={cat as string} className="flex items-center justify-between text-xs">
                            <span className="text-ink-600">{cat}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-cream-200 overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} aria-hidden="true" />
                              </div>
                              <span className="text-ink-500 w-8 text-right">{pct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between border-t border-cream-200 px-8 py-5">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-cream-100 focus-visible:outline-gold-500"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <motion.button
            onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : handleCreate()}
            disabled={!isStepValid()}
            className="rounded-xl px-7 py-2.5 text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isStepValid()
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : undefined,
              backgroundColor: isStepValid() ? undefined : '#d5d0ca',
            }}
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            {step < STEPS.length - 1 ? 'Continue →' : '✦ Create My Event'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

