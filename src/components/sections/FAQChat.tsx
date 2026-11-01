'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQChatProps {
  items: FAQItem[]
  heading?: string
  subheading?: string
}

export default function FAQChat({
  items,
  heading = 'COMMONLY TRANSMITTED QUERIES',
  subheading = 'Real-time intelligence on deposits, acoustics, guest comfort, and permits',
}: FAQChatProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]) // first open by default

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index))
    } else {
      setOpenIndices([...openIndices, index])
    }
  }

  return (
    <section id="faq" className="w-full py-24 bg-ink-950 text-ivory-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="label-mono text-accent mb-3">{heading}</p>
          <h2 className="h2 mb-4">Chat with Producer Intelligence</h2>
          <p className="body-default text-muted max-w-lg mx-auto">{subheading}</p>
        </div>

        {/* Chat message stream container */}
        <div className="flex flex-col gap-6">
          {items.map((item, index) => {
            const isOpen = openIndices.includes(index)

            return (
              <div key={index} className="flex flex-col gap-3">
                {/* User / Question Bubble (Right-aligned, accent fill, ink text) */}
                <div className="flex justify-end">
                  <button
                    onClick={() => toggleIndex(index)}
                    className="max-w-md sm:max-w-lg p-4 px-5 rounded-3xl rounded-tr-sm bg-accent text-ink-950 font-body font-semibold text-sm sm:text-base text-left shadow-md hover:brightness-105 transition-all flex items-center justify-between gap-3 group"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span className="text-xs opacity-70 group-hover:translate-x-0.5 transition-transform">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>
                </div>

                {/* EventGpt / Answer Bubble (Left-aligned, ink-900 fill, ivory text with avatar) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-3 justify-start"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs shrink-0 mt-1">
                        ✦
                      </div>

                      <div className="max-w-md sm:max-w-xl p-5 rounded-3xl rounded-tl-sm bg-ink-900 border border-ink-700 text-ivory-50/90 font-body text-sm leading-relaxed shadow-lg">
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-ink-700/50">
                          <span className="label-mono text-accent text-[10px]">
                            EVENTGPT AI CO-PRODUCER
                          </span>
                          <span className="caption text-muted text-[10px]">VERIFIED GUIDELINE</span>
                        </div>
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

