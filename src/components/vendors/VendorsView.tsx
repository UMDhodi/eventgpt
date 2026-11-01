'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatCurrency, getVendorStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { VendorItem } from '@/types'

const VENDOR_CATEGORIES = ['Venue', 'Catering', 'Photography', 'Videography', 'Music / DJ', 'Band', 'Florist', 'Cake', 'Hair & Makeup', 'Officiant', 'Transportation', 'Lighting', 'Photo Booth', 'Security', 'Rentals', 'Invitations', 'Other']
const STATUSES: VendorItem['status'][] = ['researching', 'contacted', 'booked', 'confirmed', 'paid']
const STATUS_LABELS = { researching: 'Researching', contacted: 'Contacted', booked: 'Booked', confirmed: 'Confirmed', paid: 'Paid' }

const KANBAN_COLS: { id: VendorItem['status']; label: string; icon: string }[] = [
  { id: 'researching', label: 'Researching', icon: '🔍' },
  { id: 'contacted', label: 'Contacted', icon: '📞' },
  { id: 'booked', label: 'Booked', icon: '📝' },
  { id: 'confirmed', label: 'Confirmed', icon: '✅' },
  { id: 'paid', label: 'Paid', icon: '💳' },
]

export default function VendorsView() {
  const { activeEvent, addVendor, updateVendor, deleteVendor } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [form, setForm] = useState<Omit<VendorItem, 'id'>>({
    category: 'Venue', name: '', contact: '', price: 0, status: 'researching', notes: '', rating: 0
  })

  if (!activeEvent) return null

  const totalVendorCost = activeEvent.vendors.reduce((sum, v) => sum + (v.price || 0), 0)
  const confirmedVendors = activeEvent.vendors.filter((v) => ['confirmed', 'paid'].includes(v.status)).length

  const handleAdd = () => {
    if (!form.name || !form.category) { toast.error('Name and category required'); return }
    addVendor(activeEvent.id, form)
    setForm({ category: 'Venue', name: '', contact: '', price: 0, status: 'researching', notes: '', rating: 0 })
    setShowForm(false)
    toast.success(`${form.name} added to your vendor list!`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Vendor Manager</h1>
          <p className="mt-1 text-ink-500">
            {activeEvent.vendors.length} vendors · {confirmedVendors} confirmed · {formatCurrency(totalVendorCost)} committed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-cream-200 bg-white/60 p-1 sm:flex" role="group" aria-label="View mode">
            {(['kanban', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${view === v ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'} focus-visible:outline-gold-500`}
                aria-pressed={view === v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <motion.button onClick={() => setShowForm(true)}
            className="rounded-2xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            + Vendor
          </motion.button>
        </div>
      </div>

      {activeEvent.vendors.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mb-4 block text-5xl" aria-hidden="true">🤝</span>
          <h2 className="font-display text-xl font-semibold text-ink-900">No vendors yet</h2>
          <p className="mt-2 text-ink-500">Add your first vendor to start tracking your dream team.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-6 rounded-2xl bg-ink-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">
            Add Your First Vendor
          </button>
        </div>
      ) : view === 'kanban' ? (
        /* Kanban board */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" role="list" aria-label="Vendor pipeline">
          {KANBAN_COLS.map((col) => {
            const colVendors = activeEvent.vendors.filter((v) => v.status === col.id)
            return (
              <div key={col.id} className="rounded-3xl border border-cream-200 bg-white/40 p-4 backdrop-blur-sm" role="listitem">
                <div className="mb-4 flex items-center gap-2">
                  <span aria-hidden="true">{col.icon}</span>
                  <h2 className="font-semibold text-ink-800 text-sm">{col.label}</h2>
                  <span className="ml-auto rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-ink-600"
                    aria-label={`${colVendors.length} vendors`}>
                    {colVendors.length}
                  </span>
                </div>
                <div className="space-y-3" role="list">
                  {colVendors.map((vendor) => (
                    <motion.div key={vendor.id} className="rounded-2xl border border-cream-100 bg-white/80 p-4 shadow-soft"
                      whileHover={{ y: -2, shadow: 'card-hover' }} layout role="listitem">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-ink-900">{vendor.name}</p>
                          <p className="text-xs text-ink-500">{vendor.category}</p>
                        </div>
                        <button onClick={() => { deleteVendor(activeEvent.id, vendor.id); toast.success('Vendor removed') }}
                          className="text-ink-300 hover:text-blush-500 transition-colors focus-visible:outline-gold-500"
                          aria-label={`Remove ${vendor.name}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {vendor.price ? <p className="text-xs font-medium text-gold-600">{formatCurrency(vendor.price)}</p> : null}
                      {vendor.contact && <p className="text-xs text-ink-400 mt-1">{vendor.contact}</p>}
                      <select value={vendor.status}
                        onChange={(e) => updateVendor(activeEvent.id, vendor.id, { status: e.target.value as VendorItem['status'] })}
                        className="mt-2 w-full rounded-lg border border-cream-200 bg-cream-50 px-2 py-1 text-xs text-ink-600 focus:border-gold-400 focus:outline-none"
                        aria-label={`Status for ${vendor.name}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="rounded-3xl border border-cream-200 bg-white/70 backdrop-blur-sm overflow-hidden">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50/50">
                {['Vendor', 'Category', 'Contact', 'Price', 'Status', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {activeEvent.vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-ink-900 text-sm">{vendor.name}</td>
                  <td className="px-5 py-4 text-sm text-ink-600">{vendor.category}</td>
                  <td className="px-5 py-4 text-sm text-ink-500">{vendor.contact || '—'}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gold-700">{vendor.price ? formatCurrency(vendor.price) : '—'}</td>
                  <td className="px-5 py-4">
                    <select value={vendor.status}
                      onChange={(e) => updateVendor(activeEvent.id, vendor.id, { status: e.target.value as VendorItem['status'] })}
                      className="rounded-lg border border-cream-200 bg-cream-50 px-2 py-1 text-xs text-ink-700 focus:border-gold-400 focus:outline-none"
                      aria-label={`Status for ${vendor.name}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => { deleteVendor(activeEvent.id, vendor.id); toast.success('Vendor removed') }}
                      className="text-ink-300 hover:text-blush-500 transition-colors focus-visible:outline-gold-500"
                      aria-label={`Remove ${vendor.name}`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add vendor modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-labelledby="add-vendor-title">
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setShowForm(false)} aria-hidden="true" />
            <motion.div className="relative z-10 w-full max-w-md rounded-3xl bg-cream-50 p-8 shadow-2xl"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <h2 id="add-vendor-title" className="font-display mb-5 text-xl font-semibold text-ink-900">Add Vendor</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="vendor-category" className="mb-1 block text-sm font-medium text-ink-700">Category</label>
                    <select id="vendor-category" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none">
                      {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vendor-status" className="mb-1 block text-sm font-medium text-ink-700">Status</label>
                    <select id="vendor-status" value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as VendorItem['status'] })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none">
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="vendor-name" className="mb-1 block text-sm font-medium text-ink-700">Vendor Name <span className="text-blush-500" aria-label="required">*</span></label>
                  <input id="vendor-name" type="text" placeholder="e.g., Blossom Florals" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="vendor-contact" className="mb-1 block text-sm font-medium text-ink-700">Contact</label>
                    <input id="vendor-contact" type="text" placeholder="Phone / Email" value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="vendor-price" className="mb-1 block text-sm font-medium text-ink-700">Price ($)</label>
                    <input id="vendor-price" type="number" placeholder="0" value={form.price || ''}
                      onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="vendor-notes" className="mb-1 block text-sm font-medium text-ink-700">Notes</label>
                  <textarea id="vendor-notes" placeholder="Contract notes, terms, etc." value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none resize-none" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-cream-300 py-3 text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors focus-visible:outline-gold-500">Cancel</button>
                <button onClick={handleAdd}
                  className="flex-1 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">Add Vendor</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

