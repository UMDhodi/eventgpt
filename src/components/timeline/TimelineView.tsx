'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatDate, daysUntilEvent, getTimelineStatusColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { TimelineItem } from '@/types'

const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES = ['pending', 'in-progress', 'completed'] as const
const CATEGORIES = ['Planning', 'Venue', 'Catering', 'Vendors', 'Invitations', 'Entertainment', 'Attire', 'Day Of', 'Legal', 'Marketing', 'Volunteers', 'Logistics', 'Décor', 'Other']

export default function TimelineView() {
  const { activeEvent, addTimelineItem, updateTimelineItem, deleteTimelineItem, toggleTimelineStatus } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState<Omit<TimelineItem, 'id'>>({
    title: '', description: '', dueDate: '', status: 'pending', priority: 'medium', category: 'Planning'
  })

  if (!activeEvent) return null

  const filtered = activeEvent.timeline
    .filter((t) => filter === 'all' || t.status === filter || t.priority === filter)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const completedCount = activeEvent.timeline.filter((t) => t.status === 'completed').length
  const progress = activeEvent.timeline.length ? Math.round((completedCount / activeEvent.timeline.length) * 100) : 0

  const handleAdd = () => {
    if (!form.title || !form.dueDate) { toast.error('Title and due date are required'); return }
    addTimelineItem(activeEvent.id, form)
    setForm({ title: '', description: '', dueDate: '', status: 'pending', priority: 'medium', category: 'Planning' })
    setShowForm(false)
    toast.success('Task added to timeline!')
  }

  const priorityColors = { low: '#059669', medium: '#d97706', high: '#cc4569' }
  const statusLabels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Done' }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Event Timeline</h1>
          <p className="mt-1 text-ink-500">{completedCount} of {activeEvent.timeline.length} tasks complete · {progress}%</p>
        </div>
        <motion.button onClick={() => setShowForm(true)}
          className="rounded-2xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          + Task
        </motion.button>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-3xl border border-cream-200 bg-white/70 p-5 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-700">Overall Progress</span>
          <span className="font-semibold text-gold-600">{progress}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-cream-200">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
            aria-label={`Timeline progress: ${progress}%`} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter tasks">
        {[
          { value: 'all', label: 'All Tasks' },
          { value: 'pending', label: 'Pending' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'completed', label: 'Done' },
          { value: 'high', label: '🔴 High Priority' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filter === f.value ? 'bg-ink-900 text-cream-50' : 'bg-white/70 border border-cream-200 text-ink-600 hover:border-gold-300'} focus-visible:outline-gold-500`}
            aria-pressed={filter === f.value}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline items */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-gold-300 via-cream-300 to-cream-200" aria-hidden="true" />

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <span className="mb-3 block text-4xl" aria-hidden="true">📋</span>
            <p className="font-medium text-ink-700">No tasks match this filter</p>
            <p className="text-sm text-ink-400">Try a different filter or add a new task</p>
          </div>
        )}

        {filtered.map((task, i) => {
          const days = daysUntilEvent(task.dueDate)
          const isOverdue = days < 0 && task.status !== 'completed'

          return (
            <motion.div key={task.id}
              className="relative flex gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}>

              {/* Status circle */}
              <button
                onClick={() => { toggleTimelineStatus(activeEvent.id, task.id); toast.success(task.status === 'completed' ? 'Task reopened' : 'Task completed! 🎉') }}
                className="relative z-10 mt-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-cream-50 transition-all hover:scale-110 focus-visible:outline-gold-500"
                style={{ borderColor: task.status === 'completed' ? '#059669' : priorityColors[task.priority] }}
                aria-label={`${task.status === 'completed' ? 'Reopen' : 'Complete'} task: ${task.title}`}
                aria-pressed={task.status === 'completed'}
              >
                {task.status === 'completed' && (
                  <motion.span className="text-xs text-emerald-600" initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden="true">✓</motion.span>
                )}
                {task.status === 'in-progress' && (
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: priorityColors[task.priority] }} aria-hidden="true" />
                )}
              </button>

              {/* Card */}
              <div className={`flex-1 rounded-3xl border p-5 backdrop-blur-sm transition-all ${
                task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/50 opacity-70' :
                isOverdue ? 'border-blush-200 bg-blush-50/50' : 'border-cream-200 bg-white/70'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-ink-900 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </h3>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: `${priorityColors[task.priority]}15`, color: priorityColors[task.priority] }}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && <p className="text-sm text-ink-500 mb-2">{task.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden="true">📅</span>
                        {formatDate(task.dueDate, 'MMM d, yyyy')}
                        {!isOverdue && task.status !== 'completed' && ` · ${days}d left`}
                        {isOverdue && <span className="text-blush-600 font-medium" role="alert"> · {Math.abs(days)}d overdue!</span>}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden="true">🏷️</span>
                        {task.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => updateTimelineItem(activeEvent.id, task.id, { status: e.target.value as TimelineItem['status'] })}
                      className="rounded-xl border border-cream-200 bg-white px-2 py-1.5 text-xs text-ink-700 focus:border-gold-400 focus:outline-none"
                      aria-label={`Status for ${task.title}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                    <button
                      onClick={() => { deleteTimelineItem(activeEvent.id, task.id); toast.success('Task removed') }}
                      className="rounded-xl p-1.5 text-ink-400 hover:bg-blush-50 hover:text-blush-600 transition-colors focus-visible:outline-gold-500"
                      aria-label={`Delete task: ${task.title}`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-labelledby="add-task-title">
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setShowForm(false)} aria-hidden="true" />
            <motion.div className="relative z-10 w-full max-w-md rounded-3xl bg-cream-50 p-8 shadow-2xl"
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <h2 id="add-task-title" className="font-display mb-5 text-xl font-semibold text-ink-900">Add Timeline Task</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-ink-700">Task Name <span className="text-blush-500" aria-label="required">*</span></label>
                  <input id="task-title" type="text" placeholder="e.g., Book florist" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                </div>
                <div>
                  <label htmlFor="task-desc" className="mb-1 block text-sm font-medium text-ink-700">Description</label>
                  <textarea id="task-desc" placeholder="Optional details..." value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="task-date" className="mb-1 block text-sm font-medium text-ink-700">Due Date <span className="text-blush-500" aria-label="required">*</span></label>
                    <input id="task-date" type="date" value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100" />
                  </div>
                  <div>
                    <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-ink-700">Priority</label>
                    <select id="task-priority" value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as TimelineItem['priority'] })}
                      className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none">
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="task-category" className="mb-1 block text-sm font-medium text-ink-700">Category</label>
                  <select id="task-category" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-400 focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-cream-300 py-3 text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors focus-visible:outline-gold-500">Cancel</button>
                <button onClick={handleAdd}
                  className="flex-1 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-cream-50 hover:bg-ink-800 transition-colors focus-visible:outline-gold-500">Add Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

