'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { getRsvpStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { GuestItem } from '@/types'

const RSVP_STATUSES: GuestItem['rsvpStatus'][] = ['pending', 'confirmed', 'declined', 'maybe']
const RSVP_LABELS = { pending: 'Pending', confirmed: 'Confirmed', declined: 'Declined', maybe: 'Maybe' }
const RSVP_EMOJIS = { pending: '⏳', confirmed: '✅', declined: '❌', maybe: '🤷' }

export default function GuestsView() {
  const { activeEvent, addGuest, updateGuest, deleteGuest } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRsvp, setFilterRsvp] = useState<string>('all')
  const [form, setForm] = useState<Omit<GuestItem, 'id'>>({
    name: '', email: '', phone: '', rsvpStatus: 'pending', plusOne: false, dietaryRestrictions: '', tableNumber: undefined
  })

  if (!activeEvent) return null

  const stats = useMemo(() => ({
    total: activeEvent.guests.length,
    confirmed: activeEvent.guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    declined: activeEvent.guests.filter((g) => g.rsvpStatus === 'declined').length,
    maybe: activeEvent.guests.filter((g) => g.rsvpStatus === 'maybe').length,
    pending: activeEvent.guests.filter((g) => g.rsvpStatus === 'pending').length,
    plusOnes: activeEvent.guests.filter((g) => g.plusOne && g.rsvpStatus === 'confirmed').length,
  }), [activeEvent.guests])

  const filtered = activeEvent.guests.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRsvp = filterRsvp === 'all' || g.rsvpStatus === filterRsvp
    return matchSearch && matchRsvp
  })

  const handleAdd = () => {
    if (!form.name) { toast.error('Guest name is required'); return }
    addGuest(activeEvent.id, form)
    setForm({ name: '', email: '', phone: '', rsvpStatus: 'pending', plusOne: false, dietaryRestrictions: '', tableNumber: undefined })
    setShowForm(false)
    toast.success(`${form.name} added to guest list!`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Guest List</h1>
          <p className="mt-1 text-ink-500">{stats.total} guests · {stats.confirmed} confirmed</p>
        </div>
        <motion.button onClick={() => setShowForm(true)}
          className="rounded-2xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          + Guest
        </motion.button>
      </div>

      {/* RSVP stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Confirmed', value: stats.confirmed, color: '#059669', emoji: '✅' },
          { label: 'Pending', value: stats.pending, color: '#d97706', emoji: '⏳' },
          { label: 'Maybe', value: stats.maybe, color: '#7c3aed', emoji: '🤷' },
          { label: 'Declined', value: stats.declined, color: '#cc4569', emoji: '❌' },
        ].map((s) => (
          <motion.div key={s.label}
            className="rounded-2xl border border-cream-200 bg-white/70 p-4 text-center backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
            <p className="font-display mt-1 text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" placeholder="Search guests..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-cream-300 bg-white pl-10 pr-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
            aria-label="Search guests" />
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by RSVP status">
          {['all', ...RSVP_STATUSES].map((s) => (
            <button key={s} onClick={() => setFilterRsvp(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filterRsvp === s ? 'bg-ink-900 text-cream-50' : 'border border-cream-200 bg-white/70 text-ink-600 hover:border-gold-300'} focus-visible:outline-gold-500`}
              aria-pressed={filterRsvp === s}>
              {s === 'all' ? 'All' : RSVP_LABELS[s as GuestItem['rsvpStatus']]}
            </button>
          ))}
        </div>
      </div>

      {/* Guest table */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <span className="mb-4 block text-5xl" aria-hidden="true">👥</span>
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {activeEvent.guests.length === 0 ? 'No guests yet' : 'No results found'}
          </h2>
          <p className="mt-2 text-ink-500">
            {activeEvent.guests.length === 0 ? 'Start adding guests to track RSVPs and manage your list.' : 'Try a different search or filter'}
          </p>
          {activeEvent.guests.length === 0 && (
            <button onClick={() => setShowForm(true)}
              className="mt-6 rounded-2xl bg-ink-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">
              Add First Guest
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-cream-200 bg-white/70 backdrop-blur-sm overflow-hidden">
          <table className="w-full" role="table" aria-label="Guest list">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Name</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 sm:table-cell" scope="col">Contact</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">RSVP</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500 md:table-cell" scope="col">+1</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-500" scope="col">Table</th>
                <th className="px-5 py-3.5" scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.map((guest) => (
                <tr key={guest.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-200 to-cream-200 text-xs font-bold text-ink-800">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-ink-900 text-sm">{guest.name}</p>
                        {guest.dietaryRestrictions && (
                          <p className="text-xs text-ink-400">{guest.dietaryRestrictions}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <p className="text-sm text-ink-600">{guest.email || '—'}</p>
                    <p className="text-xs text-ink-400">{guest.phone || ''}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select value={guest.rsvpStatus}
                      onChange={(e) => updateGuest(activeEvent.id, guest.id, { rsvpStatus: e.target.value as GuestItem['rsvpStatus'] })}
                      className="rounded-lg border border-cream-200 bg-cream-50 px-2 py-1 text-xs font-medium focus:border-gold-400 focus:outline-none"
                      style={{ color: getRsvpStatusColor(guest.rsvpStatus) }}
                      aria-label={`RSVP status for ${guest.name}`}>
                      {RSVP_STATUSES.map((s) => <option key={s} value={s}>{RSVP_EMOJIS[s]} {RSVP_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <button onClick={() => updateGuest(activeEvent.id, guest.id, { plusOne: !guest.plusOne })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${guest.plusOne ? 'bg-emerald-100 text-emerald-700' : 'bg-cream-100 text-ink-500'} focus-visible:outline-gold-500`}
                      aria-pressed={guest.plusOne} aria-label={`${guest.name} plus one: ${guest.plusOne ? 'yes' : 'no'}`}>
                      {guest.plusOne ? '+1 ✓' : '+1'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <input type="number" placeholder="#"
                      defaultValue={guest.tableNumber || ''}
                      onChange={(e) => updateGuest(activeEvent.id, guest.id, { tableNumber: parseInt(e.target.value) || undefined })}
                      className="w-14 rounded-lg border border-cream-200 bg-cream-50 px-2 py-1 text-xs text-ink-700 focus:border-gold-400 focus:outline-none text-center"
                      aria-label={`Table number for ${guest.name}`} />
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => { deleteGuest(activeEvent.id, guest.id); toast.success('Guest removed') }}
                      className="text-ink-300 hover:text-blush-500 transition-colors focus-visible:outline-gold-500"
                      aria-label={`Remove ${guest.name} from guest list`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add guest modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-labelledby="add-guest-title">
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setShowForm(false)} aria-hidden="true" />
            <motion.div className="relative z-10 w-full max-w-md rounded-3xl bg-cream-50 p-8 shadow-2xl"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <h2 id="add-guest-title" className="font-display mb-5 text-xl font-semibold text-ink-900">Add Guest</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="guest-name" className="mb-1 block text-sm font-medium text-ink-700">Full Name <span className="text-blush-500" aria-label="required">*</span></label>
                  <input id="guest-name" type="text" placeholder="e.g., Jane Smith" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="guest-email" className="mb-1 block text-sm font-medium text-ink-700">Email</label>
                    <input id="guest-email" type="email" placeholder="jane@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="guest-phone" className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
                    <input id="guest-phone" type="tel" placeholder="+1 234 567 8900" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="guest-rsvp" className="mb-1 block text-sm font-medium text-ink-700">RSVP Status</label>
                    <select id="guest-rsvp" value={form.rsvpStatus}
                      onChange={(e) => setForm({ ...form, rsvpStatus: e.target.value as GuestItem['rsvpStatus'] })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none">
                      {RSVP_STATUSES.map((s) => <option key={s} value={s}>{RSVP_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="guest-table" className="mb-1 block text-sm font-medium text-ink-700">Table #</label>
                    <input id="guest-table" type="number" placeholder="1" value={form.tableNumber || ''}
                      onChange={(e) => setForm({ ...form, tableNumber: parseInt(e.target.value) || undefined })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="guest-dietary" className="mb-1 block text-sm font-medium text-ink-700">Dietary Restrictions</label>
                  <input id="guest-dietary" type="text" placeholder="e.g., Vegan, gluten-free" value={form.dietaryRestrictions}
                    onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none" />
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <div className={`relative h-6 w-11 rounded-full transition-colors ${form.plusOne ? 'bg-gold-500' : 'bg-cream-300'}`}
                    onClick={() => setForm({ ...form, plusOne: !form.plusOne })}
                    role="switch" aria-checked={form.plusOne} aria-label="Plus one">
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.plusOne ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-ink-700">Bringing a plus one</span>
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-cream-300 py-3 text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors focus-visible:outline-gold-500">Cancel</button>
                <button onClick={handleAdd}
                  className="flex-1 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">Add Guest</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

