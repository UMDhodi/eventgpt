'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { getEventTypeConfig } from '@/lib/utils'
import toast from 'react-hot-toast'

const IDEA_THEMES = {
  wedding: [
    { category: 'Ceremony', icon: '💒', ideas: [
      'Floating aisle with flower petals on water',
      'Aerial silk performers as guests arrive',
      'Personalized vows read by a loved one as a surprise',
      'Live string quartet playing the couple\'s first song',
      'Lantern release at golden hour',
      'Unity ceremony: planting a tree together',
    ]},
    { category: 'Reception', icon: '🥂', ideas: [
      'Dessert wall instead of a traditional cake',
      'Interactive cocktail station with a mixologist',
      'Custom photo wall with polaroid guests can take home',
      'Late-night food truck surprise',
      'Personalized cocktail named after the couple',
      'Star map of your first date location',
    ]},
    { category: 'Décor', icon: '🌸', ideas: [
      'Micro-garden centerpieces guests can take home',
      'Hanging floral installations above the dance floor',
      'Neon sign with couple\'s name or quote',
      'Book-themed décor for literary couples',
      'Canopy of fairy lights over the dining area',
      'Vintage frames with couple\'s photos through the years',
    ]},
    { category: 'Entertainment', icon: '🎶', ideas: [
      'Surprise performance from a local artist',
      'Photo booth with custom backdrop and props',
      'Lawn games during cocktail hour',
      'Live caricature artist',
      'Bubble machine for the first dance exit',
      'Sparkler exit with custom sparklers',
    ]},
  ],
  birthday: [
    { category: 'Theme Ideas', icon: '🎨', ideas: [
      'Roaring 20s Great Gatsby glamour party',
      'Tropical escape with tropical cocktails and décor',
      'Murder mystery dinner party',
      'Decade party — dress as any era',
      'Garden party with botanical theme',
      'Casino night with game tables',
    ]},
    { category: 'Activities', icon: '🎮', ideas: [
      'Escape room challenge for the group',
      'Cooking class with a chef',
      'Trivia night with custom questions about the birthday person',
      'DIY craft station (pottery, painting)',
      'Scavenger hunt around the city',
      'Photo walk with a professional photographer',
    ]},
    { category: 'Food & Drink', icon: '🍰', ideas: [
      'Build-your-own taco bar',
      'Champagne tower for a dramatic reveal',
      'Custom birthday cake flavors station',
      'Sushi rolling station',
      'Charcuterie board wall',
      'Milkshake bar with toppings',
    ]},
  ],
  community: [
    { category: 'Programming', icon: '🎤', ideas: [
      'Open mic night for local talent',
      'Panel discussion with community leaders',
      'Live mural painting by a local artist',
      'Cooking competition open to all',
      'Cultural performances from diverse groups',
      'Interactive workshops and skill shares',
    ]},
    { category: 'Engagement', icon: '🤝', ideas: [
      'Community vision board collaborative art',
      'Local business showcase booths',
      'Memory wall where people share stories',
      'Time capsule creation ceremony',
      'Plant swap and garden sharing',
      'Community cookbook collaboration',
    ]},
    { category: 'Sustainability', icon: '🌱', ideas: [
      'Zero-waste event with compostable materials',
      'Partner with local farms for food',
      'Bike valet to encourage eco-transport',
      'Solar-powered stage and equipment',
      'Plant a tree for every attendee',
      'Seed packet favors with local flowers',
    ]},
  ],
}

export default function IdeasView() {
  const { activeEvent, updateEvent } = useStore()
  const [savedIdeas, setSavedIdeas] = useState<string[]>([])
  const [customIdea, setCustomIdea] = useState('')

  if (!activeEvent) return null

  const config = getEventTypeConfig(activeEvent.type)
  const themes = IDEA_THEMES[activeEvent.type]

  const toggleSave = (idea: string) => {
    if (savedIdeas.includes(idea)) {
      setSavedIdeas(savedIdeas.filter((i) => i !== idea))
      toast('Idea unsaved', { icon: '✕' })
    } else {
      setSavedIdeas([...savedIdeas, idea])
      toast.success('Idea saved to your list!')
    }
  }

  const saveAllIdeas = () => {
    const all = [...(activeEvent.personalizedIdeas ?? []), ...savedIdeas]
    const unique = [...new Set(all)]
    updateEvent(activeEvent.id, { personalizedIdeas: unique })
    setSavedIdeas([])
    toast.success(`${savedIdeas.length} ideas saved to your event!`)
  }

  const addCustomIdea = () => {
    if (!customIdea.trim()) return
    const ideas = [...(activeEvent.personalizedIdeas ?? []), customIdea.trim()]
    updateEvent(activeEvent.id, { personalizedIdeas: ideas })
    setCustomIdea('')
    toast.success('Your idea saved!')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">{config.emoji}</span>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Personalized Ideas</h1>
        </div>
        <p className="text-ink-500">Curated inspiration for your {config.label.toLowerCase()}</p>
      </div>

      {/* Saved ideas bar */}
      {savedIdeas.length > 0 && (
        <motion.div
          className="mb-6 flex items-center justify-between rounded-2xl bg-gold-50 border border-gold-200 p-4"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          role="status" aria-live="polite"
        >
          <p className="text-sm font-medium text-gold-800">
            {savedIdeas.length} idea{savedIdeas.length > 1 ? 's' : ''} selected
          </p>
          <button onClick={saveAllIdeas}
            className="rounded-xl bg-gold-600 px-4 py-2 text-xs font-semibold text-white hover:bg-gold-700 transition-colors focus-visible:outline-gold-500">
            Save to Event →
          </button>
        </motion.div>
      )}

      {/* Saved to event */}
      {(activeEvent.personalizedIdeas ?? []).length > 0 && (
        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6" aria-labelledby="saved-ideas-heading">
          <h2 id="saved-ideas-heading" className="mb-4 font-display text-lg font-semibold text-ink-900">
            ✦ Your Saved Ideas
          </h2>
          <ul className="flex flex-wrap gap-2">
            {(activeEvent.personalizedIdeas ?? []).map((idea, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full bg-white border border-emerald-200 px-4 py-2 text-sm text-ink-700">
                <span className="text-emerald-500" aria-hidden="true">✓</span>
                {idea}
                <button
                  onClick={() => {
                    const updated = (activeEvent.personalizedIdeas ?? []).filter((_, j) => j !== i)
                    updateEvent(activeEvent.id, { personalizedIdeas: updated })
                  }}
                  className="ml-1 text-ink-400 hover:text-blush-500 transition-colors focus-visible:outline-gold-500"
                  aria-label={`Remove idea: ${idea}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add custom idea */}
      <div className="mb-8 rounded-3xl border border-cream-200 bg-white/70 p-6 backdrop-blur-sm" aria-labelledby="custom-idea-heading">
        <h2 id="custom-idea-heading" className="mb-3 font-display text-lg font-semibold text-ink-900">Add Your Own Idea</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Type your unique idea..." value={customIdea}
            onChange={(e) => setCustomIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomIdea()}
            className="flex-1 rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
            aria-label="Custom event idea" />
          <button onClick={addCustomIdea}
            className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500"
            disabled={!customIdea.trim()}>
            Add
          </button>
        </div>
      </div>

      {/* Idea categories */}
      <div className="space-y-8">
        {themes.map((theme) => (
          <motion.section key={theme.category}
            className="rounded-3xl border border-cream-200 bg-white/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            aria-labelledby={`${theme.category}-heading`}>
            <h2 id={`${theme.category}-heading`} className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
              <span aria-hidden="true">{theme.icon}</span>
              {theme.category}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {theme.ideas.map((idea) => {
                const isSaved = savedIdeas.includes(idea) || (activeEvent.personalizedIdeas ?? []).includes(idea)
                return (
                  <li key={idea}>
                    <motion.button
                      onClick={() => toggleSave(idea)}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                        isSaved
                          ? 'border-gold-300 bg-gold-50 shadow-soft'
                          : 'border-cream-200 bg-cream-50/50 hover:border-gold-200 hover:bg-gold-50/30'
                      } focus-visible:outline-gold-500`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-pressed={isSaved}
                      aria-label={`${isSaved ? 'Remove' : 'Save'} idea: ${idea}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-ink-700 leading-relaxed">{idea}</p>
                        <motion.div
                          className={`shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSaved ? 'border-gold-500 bg-gold-500' : 'border-cream-300 group-hover:border-gold-300'
                          }`}
                          animate={{ scale: isSaved ? [1, 1.2, 1] : 1 }}
                          aria-hidden="true"
                        >
                          {isSaved && <span className="text-white text-xs">✓</span>}
                        </motion.div>
                      </div>
                    </motion.button>
                  </li>
                )
              })}
            </ul>
          </motion.section>
        ))}
      </div>
    </div>
  )
}

