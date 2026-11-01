'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatCurrency, calculateBudgetProgress, getBudgetHealthColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export default function BudgetView() {
  const { activeEvent, addBudgetCategory, updateBudgetCategory, deleteBudgetCategory } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', allocated: 0, icon: '💼', color: '#d97706' })

  if (!activeEvent) return null

  const totalSpent = activeEvent.budgetCategories.reduce((sum, c) => sum + c.spent, 0)
  const totalAllocated = activeEvent.budgetCategories.reduce((sum, c) => sum + c.allocated, 0)
  const remaining = activeEvent.totalBudget - totalSpent
  const overallPct = Math.min(Math.round((totalSpent / activeEvent.totalBudget) * 100), 100)

  const handleAdd = () => {
    if (!form.name) { toast.error('Please enter a category name'); return }
    if (form.allocated <= 0) { toast.error('Please enter a valid amount'); return }
    addBudgetCategory(activeEvent.id, { name: form.name, allocated: form.allocated, spent: 0, icon: form.icon, color: form.color })
    setForm({ name: '', allocated: 0, icon: '💼', color: '#d97706' })
    setShowAddForm(false)
    toast.success('Budget category added!')
  }

  const handleUpdateSpent = (catId: string, spent: number) => {
    updateBudgetCategory(activeEvent.id, catId, { spent })
    toast.success('Spending updated!')
  }

  const ICONS = ['💼', '🏛️', '🍽️', '📸', '💐', '🎶', '👗', '✉️', '🎂', '🎈', '🎮', '🎁', '🏟️', '📣', '🎤', '🤝', '🛡️', '✨']
  const COLORS = ['#cc4569', '#d97706', '#059669', '#7c3aed', '#0891b2', '#db2777', '#92400e', '#6b7280']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Budget Tracker</h1>
          <p className="mt-1 text-ink-500">Track spending across all categories</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="rounded-2xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          aria-label="Add budget category"
        >
          + Category
        </motion.button>
      </div>

      {/* Budget summary ring */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Budget', value: formatCurrency(activeEvent.totalBudget), color: '#14100d', sub: 'your limit' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: getBudgetHealthColor(overallPct), sub: `${overallPct}% used` },
          { label: 'Remaining', value: formatCurrency(remaining), color: remaining >= 0 ? '#059669' : '#dc2626', sub: remaining >= 0 ? 'available' : 'over budget!' },
        ].map((s) => (
          <motion.div
            key={s.label}
            className="rounded-3xl border border-cream-200 bg-white/70 p-6 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <p className="mb-1 text-xs uppercase tracking-wider text-ink-500">{s.label}</p>
            <p className="font-display text-3xl font-semibold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-400">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="mb-8 rounded-3xl border border-cream-200 bg-white/70 p-6 backdrop-blur-sm">
        <div className="mb-3 flex justify-between text-sm">
          <span className="font-medium text-ink-700">Overall Budget Usage</span>
          <span style={{ color: getBudgetHealthColor(overallPct) }}>{overallPct}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-cream-200">
          <motion.div
            className="h-full rounded-full transition-all"
            style={{ backgroundColor: getBudgetHealthColor(overallPct), width: `${overallPct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget used: ${overallPct}%`}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {activeEvent.budgetCategories.map((cat, i) => {
          const pct = calculateBudgetProgress(cat.allocated, cat.spent)
          const isEditing = editingId === cat.id
          const overSpent = cat.spent > cat.allocated

          return (
            <motion.div
              key={cat.id}
              className="rounded-3xl border border-cream-200 bg-white/70 p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${cat.color}15` }} aria-hidden="true">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-900">{cat.name}</h3>
                    <p className="text-sm text-ink-500">
                      {formatCurrency(cat.spent)} of {formatCurrency(cat.allocated)}
                      {overSpent && <span className="ml-2 text-blush-600 font-medium" role="alert">Over budget!</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(isEditing ? null : cat.id)}
                    className="rounded-xl px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-cream-100 focus-visible:outline-gold-500"
                    aria-label={`Edit ${cat.name} spending`}
                    aria-expanded={isEditing}
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                  <button
                    onClick={() => { deleteBudgetCategory(activeEvent.id, cat.id); toast.success('Category removed') }}
                    className="rounded-xl p-1.5 text-ink-400 transition-colors hover:bg-blush-50 hover:text-blush-600 focus-visible:outline-gold-500"
                    aria-label={`Delete ${cat.name} category`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: overSpent ? '#dc2626' : cat.color, width: `${Math.min(pct, 100)}%` }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name}: ${pct}% spent`}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-ink-400">
                  <span>{pct}% used</span>
                  <span>{formatCurrency(cat.allocated - cat.spent)} left</span>
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    className="mt-4 rounded-2xl bg-cream-50 p-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`allocated-${cat.id}`} className="mb-1 block text-xs font-medium text-ink-600">Allocated Budget</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm" aria-hidden="true">$</span>
                          <input
                            id={`allocated-${cat.id}`}
                            type="number"
                            defaultValue={cat.allocated}
                            onChange={(e) => updateBudgetCategory(activeEvent.id, cat.id, { allocated: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-4 py-2.5 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`spent-${cat.id}`} className="mb-1 block text-xs font-medium text-ink-600">Amount Spent</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm" aria-hidden="true">$</span>
                          <input
                            id={`spent-${cat.id}`}
                            type="number"
                            defaultValue={cat.spent}
                            onChange={(e) => updateBudgetCategory(activeEvent.id, cat.id, { spent: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-4 py-2.5 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Add category form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-labelledby="add-category-title"
          >
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)} aria-hidden="true" />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-3xl bg-cream-50 p-8 shadow-2xl"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 id="add-category-title" className="font-display mb-6 text-xl font-semibold text-ink-900">Add Budget Category</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cat-name" className="mb-1.5 block text-sm font-medium text-ink-700">Category Name</label>
                  <input id="cat-name" type="text" placeholder="e.g., Florist" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                </div>
                <div>
                  <label htmlFor="cat-budget" className="mb-1.5 block text-sm font-medium text-ink-700">Allocated Budget</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true">$</span>
                    <input id="cat-budget" type="number" placeholder="0" value={form.allocated || ''}
                      onChange={(e) => setForm({ ...form, allocated: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-ink-700">Icon</p>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category icon">
                    {ICONS.map((icon) => (
                      <button key={icon} onClick={() => setForm({ ...form, icon })}
                        className={`rounded-xl p-2.5 text-lg transition-all ${form.icon === icon ? 'bg-gold-100 ring-2 ring-gold-400' : 'bg-cream-100 hover:bg-cream-200'}`}
                        role="radio" aria-checked={form.icon === icon} aria-label={icon}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-ink-700">Color</p>
                  <div className="flex gap-2" role="radiogroup" aria-label="Category color">
                    {COLORS.map((color) => (
                      <button key={color} onClick={() => setForm({ ...form, color })}
                        className={`h-8 w-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 scale-110 ring-ink-900' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                        role="radio" aria-checked={form.color === color} aria-label={`Color: ${color}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl border border-cream-300 py-3 text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors focus-visible:outline-gold-500">
                  Cancel
                </button>
                <button onClick={handleAdd}
                  className="flex-1 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">
                  Add Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

