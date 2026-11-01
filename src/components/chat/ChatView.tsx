'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatDate, getEventTypeConfig } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import type { ChatMessage } from '@/types'

const QUICK_PROMPTS = {
  wedding: [
    'What should I prioritize first for my wedding?',
    'Give me a detailed vendor checklist',
    'How can I save money on catering?',
    'Suggest unique ceremony ideas for us',
    'Create a day-of timeline for the ceremony',
    'What are common wedding planning mistakes to avoid?',
  ],
  birthday: [
    'What activities work for 50+ guests?',
    'How do I create a memorable theme?',
    'Suggest catering options for my budget',
    'Give me a party timeline',
    'What entertainment ideas work best?',
    'How do I handle dietary restrictions?',
  ],
  community: [
    'How do I secure event permits?',
    'What\'s the best way to promote the event?',
    'How do I manage volunteers effectively?',
    'Suggest ways to make it more inclusive',
    'Create a day-of logistics plan',
    'How do I measure event success?',
  ],
}

export default function ChatView() {
  const { activeEvent, chatHistory, addMessage, updateLastMessage } = useStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  if (!activeEvent) return null

  const messages = chatHistory[activeEvent.id] ?? []
  const config = getEventTypeConfig(activeEvent.type)
  const quickPrompts = QUICK_PROMPTS[activeEvent.type]

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const buildEventContext = () => ({
    eventType: activeEvent.type,
    title: activeEvent.title,
    date: formatDate(activeEvent.date),
    guestCount: activeEvent.guestCount,
    totalBudget: activeEvent.totalBudget,
    budgetCategories: activeEvent.budgetCategories.map((c) => ({
      name: c.name,
      allocated: c.allocated,
      spent: c.spent,
    })),
    completedTasks: activeEvent.timeline.filter((t) => t.status === 'completed').length,
    totalTasks: activeEvent.timeline.length,
    vendorCount: activeEvent.vendors.length,
    confirmedVendors: activeEvent.vendors.filter((v) => ['confirmed', 'paid'].includes(v.status)).length,
    guestListSize: activeEvent.guests.length,
    confirmedGuests: activeEvent.guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    venue: activeEvent.venue,
    theme: activeEvent.theme,
    savedIdeas: activeEvent.personalizedIdeas,
  })

  const sendMessage = async (text: string) => {
    const userText = text.trim()
    if (!userText || isLoading) return

    setInput('')
    setIsLoading(true)

    // Add user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    }
    addMessage(activeEvent.id, userMsg)

    // Add placeholder assistant message
    const assistantId = uuidv4()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    addMessage(activeEvent.id, assistantMsg)

    try {
      abortRef.current = new AbortController()

      const historyForApi = [...messages, userMsg].slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          eventContext: buildEventContext(),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to get AI response')
      }

      // Stream the response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          let handledSse = false
          for (const line of lines) {
            if (line.startsWith('0:')) {
              handledSse = true
              try {
                const text = JSON.parse(line.slice(2))
                accumulated += text
                updateLastMessage(activeEvent.id, accumulated)
              } catch {}
            }
          }

          // If raw stream (NVIDIA NIM plain text streaming)
          if (!handledSse && chunk) {
            accumulated += chunk
            updateLastMessage(activeEvent.id, accumulated)
          }
        }
      }

      if (!accumulated) {
        updateLastMessage(activeEvent.id, 'I apologize, but I was unable to generate a response. Please check your API configuration and try again.')
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        updateLastMessage(activeEvent.id, '_Response cancelled._')
      } else {
        console.error('Chat error:', err)
        updateLastMessage(activeEvent.id,
          '⚠️ **AI not configured yet**\n\nTo enable AI responses, add your `GOOGLE_GENERATIVE_AI_API_KEY` to a `.env.local` file:\n\n```\nGOOGLE_GENERATIVE_AI_API_KEY=your-key-here\n```\n\nGet a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey). Then restart the dev server.\n\n*In the meantime, explore the Budget, Timeline, and Vendor sections — they work without AI!*'
        )
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsLoading(false)
  }

  return (
    <div className="flex h-[calc(100vh-116px)] flex-col" aria-label="AI Planning Assistant chat">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-cream-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-sm">
            <span className="text-lg" aria-hidden="true">✦</span>
          </div>
          <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 animate-pulse" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-semibold text-ink-900">EventCraft AI Assistant</h1>
          <p className="text-xs text-ink-500">
            Planning expert for <span style={{ color: config.accent }}>{activeEvent.title}</span>
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700" role="status">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          NVIDIA NIM · Online
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <motion.div className="flex h-full flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-100 to-cream-200 shadow-soft">
              <span className="text-4xl" aria-hidden="true">{config.emoji}</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Hello! I'm your planning assistant ✦
            </h2>
            <p className="mt-2 max-w-md text-ink-500">
              I know everything about <strong>{activeEvent.title}</strong> — your budget, timeline, vendors, and goals.
              Ask me anything!
            </p>

            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickPrompts.map((prompt) => (
                <button key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-2xl border border-cream-200 bg-white/70 p-4 text-left text-sm text-ink-700 transition-all hover:border-gold-300 hover:shadow-soft hover:-translate-y-0.5 focus-visible:outline-gold-500"
                  aria-label={`Ask: ${prompt}`}>
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>

                  {/* Avatar */}
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    msg.role === 'user'
                      ? 'bg-ink-900 text-cream-50'
                      : 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
                  }`} aria-hidden="true">
                    {msg.role === 'user' ? 'Y' : '✦'}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] rounded-3xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'rounded-tr-lg bg-ink-900 text-cream-50'
                      : 'rounded-tl-lg border border-cream-200 bg-white/90 text-ink-800'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose-chat text-sm leading-relaxed">
                        {msg.isStreaming && !msg.content ? (
                          <div className="flex gap-1" aria-label="Loading response">
                            {[0, 1, 2].map((i) => (
                              <span key={i}
                                className="h-2 w-2 rounded-full bg-gold-400 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                                aria-hidden="true" />
                            ))}
                          </div>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    <p className={`mt-2 text-xs ${msg.role === 'user' ? 'text-cream-300' : 'text-ink-400'}`}
                      aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString()}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Quick prompts bar (when there are messages) */}
      {messages.length > 0 && (
        <div className="border-t border-cream-100 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 whitespace-nowrap" role="group" aria-label="Quick question prompts">
            {quickPrompts.slice(0, 4).map((prompt) => (
              <button key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-xs font-medium text-ink-600 transition-all hover:border-gold-300 hover:bg-gold-50 disabled:opacity-40 focus-visible:outline-gold-500">
                {prompt.length > 40 ? prompt.slice(0, 38) + '…' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-cream-200 bg-white/80 px-4 py-4 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI planning assistant anything..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-2xl border border-cream-300 bg-white px-5 py-3.5 pr-4 text-sm text-ink-900 placeholder-ink-400 transition-all focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100 disabled:opacity-60"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              aria-label="Message input"
            />
          </div>

          {isLoading ? (
            <button onClick={handleStop}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush-100 text-blush-600 transition-colors hover:bg-blush-200 focus-visible:outline-gold-500"
              aria-label="Stop generating response">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-cream-50 transition-all hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-gold-500"
              aria-label="Send message">
              <svg className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-ink-400">
          AI knows your budget, timeline, vendors & guests · Powered by Google Gemini
        </p>
      </div>
    </div>
  )
}

