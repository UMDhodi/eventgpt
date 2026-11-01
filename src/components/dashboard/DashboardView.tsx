'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { getEventTypeConfig, formatDate, daysUntilEvent, formatCurrency, calculateBudgetProgress } from '@/lib/utils'
import CountUp from 'react-countup'

const stagger = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } },
}

export default function DashboardView() {
  const { activeEvent, setActiveTab } = useStore()
  if (!activeEvent) return null

  const config = getEventTypeConfig(activeEvent.type)
  const daysLeft = daysUntilEvent(activeEvent.date)
  const totalSpent = activeEvent.budgetCategories.reduce((sum, c) => sum + c.spent, 0)
  const budgetUsed = Math.round((totalSpent / activeEvent.totalBudget) * 100)
  const completedTasks = activeEvent.timeline.filter((t) => t.status === 'completed').length
  const totalTasks = activeEvent.timeline.length
  const taskPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
  const confirmedGuests = activeEvent.guests.filter((g) => g.rsvpStatus === 'confirmed').length
  const bookedVendors = activeEvent.vendors.filter((v) => ['booked', 'confirmed', 'paid'].includes(v.status)).length

  const quickStats = [
    {
      label: 'Days Until Event',
      value: Math.abs(daysLeft),
      unit: daysLeft >= 0 ? 'days remaining' : 'days ago',
      icon: '📅',
      color: daysLeft > 30 ? '#059669' : daysLeft > 7 ? '#d97706' : '#cc4569',
      action: () => setActiveTab('timeline'),
    },
    {
      label: 'Budget Used',
      value: budgetUsed,
      suffix: '%',
      unit: `of ${formatCurrency(activeEvent.totalBudget)}`,
      icon: '💰',
      color: budgetUsed < 70 ? '#059669' : budgetUsed < 90 ? '#d97706' : '#cc4569',
      action: () => setActiveTab('budget'),
    },
    {
      label: 'Tasks Complete',
      value: taskPct,
      suffix: '%',
      unit: `${completedTasks} of ${totalTasks} tasks`,
      icon: '✅',
      color: '#7c3aed',
      action: () => setActiveTab('timeline'),
    },
    {
      label: 'Confirmed Guests',
      value: confirmedGuests,
      suffix: '',
      unit: `of ${activeEvent.guestCount} expected`,
      icon: '👥',
      color: '#0891b2',
      action: () => setActiveTab('guests'),
    },
  ]

  const upcomingTasks = activeEvent.timeline
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)

  const topBudgetCategories = [...activeEvent.budgetCategories]
    .sort((a, b) => b.allocated - a.allocated)
    .slice(0, 5)

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--surface-light)', color: 'var(--ink-900)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        {/* ── Hero banner ── */}
        <motion.div
          className="relative mb-8 overflow-hidden rounded-3xl p-8 md:p-10"
          style={{
            background: `linear-gradient(135deg, ${config.accentLight} 0%, rgba(255,255,255,0.6) 100%)`,
            border: `1px solid ${config.accent}25`,
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative orb */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-25"
            style={{ background: `radial-gradient(circle, ${config.accent}, transparent 70%)` }}
            aria-hidden="true"
          />
          {/* Bottom-left orb */}
          <div
            className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${config.accent}, transparent 70%)` }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">{config.emoji}</span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: config.accent, fontFamily: 'var(--font-body)' }}
                >
                  {config.label}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  lineHeight: 1.2,
                }}
              >
                {activeEvent.title}
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-body)' }}>
                {formatDate(activeEvent.date, 'EEEE, MMMM d, yyyy')} · {activeEvent.guestCount} guests
                {activeEvent.venue && ` · ${activeEvent.venue}`}
              </p>
            </div>

            {/* Countdown box */}
            <div
              className="flex flex-col items-center rounded-2xl px-8 py-5 text-center shrink-0"
              style={{ background: `${config.accent}18`, border: `1px solid ${config.accent}25` }}
              aria-label={`${Math.abs(daysLeft)} days ${daysLeft >= 0 ? 'remaining' : 'since event'}`}
            >
              <p
                style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: config.accent, lineHeight: 1 }}
              >
                {Math.abs(daysLeft)}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: 'var(--ink-600)' }}>
                {daysLeft >= 0 ? 'days to go' : 'days ago'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-7">
            <div className="mb-2 flex justify-between text-xs" style={{ color: 'var(--ink-500)' }}>
              <span style={{ fontFamily: 'var(--font-body)' }}>Planning Progress</span>
              <span style={{ fontWeight: 600, color: config.accent }}>{taskPct}% complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${config.accent}, ${config.accent}bb)` }}
                initial={{ width: 0 }}
                animate={{ width: `${taskPct}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                role="progressbar"
                aria-valuenow={taskPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Planning progress: ${taskPct}%`}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Quick stats grid ── */}
        <motion.div
          className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
          variants={stagger.container}
          initial="hidden"
          animate="show"
          aria-label="Event statistics"
        >
          {quickStats.map((stat) => (
            <motion.button
              key={stat.label}
              variants={stagger.item}
              onClick={stat.action}
              className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 focus-visible:outline-gold-500"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(232,208,161,0.35)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 1px 3px rgba(20,16,13,0.05), 0 4px 16px rgba(20,16,13,0.05)',
              }}
              whileHover={{ y: -4, boxShadow: `0 8px 32px rgba(20,16,13,0.1), 0 0 0 1px ${stat.color}30` }}
              aria-label={`${stat.label}: ${stat.value} ${stat.unit}`}
            >
              {/* Subtle hover gradient */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at 20% 20%, ${stat.color}10 0%, transparent 70%)` }}
                aria-hidden="true"
              />

              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
              <p
                className="mt-3 leading-none"
                style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink-900)' }}
              >
                <CountUp end={stat.value} duration={1.5} />
                {stat.suffix || ''}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-body)' }}>{stat.unit}</p>

              <div
                className="mt-4 h-0.5 w-8 rounded-full transition-all duration-400 group-hover:w-full"
                style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }}
                aria-hidden="true"
              />
            </motion.button>
          ))}
        </motion.div>

        {/* ── Two column: tasks + budget ── */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Upcoming tasks */}
          <motion.section
            className="lg:col-span-3 rounded-3xl p-6"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(232,208,161,0.35)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            aria-labelledby="upcoming-tasks-heading"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="upcoming-tasks-heading"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink-900)' }}
              >
                Upcoming Tasks
              </h2>
              <button
                onClick={() => setActiveTab('timeline')}
                className="text-xs font-medium transition-colors hover:underline focus-visible:outline-gold-500"
                style={{ color: '#d97706', fontFamily: 'var(--font-body)' }}
              >
                View all →
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="mb-3 text-4xl" aria-hidden="true">🎉</span>
                <p className="font-semibold" style={{ color: 'var(--ink-700)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  All tasks complete!
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-400)' }}>You're all set for your event.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcomingTasks.map((task) => {
                  const days = daysUntilEvent(task.dueDate)
                  const isOverdue = days < 0
                  const priorityColors: Record<string, string> = {
                    high: '#cc4569', medium: '#d97706', low: '#10b981',
                  }
                  return (
                    <li
                      key={task.id}
                      className="flex items-start gap-4 rounded-2xl p-4 transition-colors"
                      style={{ background: 'rgba(253,250,245,0.8)', border: '1px solid rgba(232,208,161,0.25)' }}
                    >
                      <div
                        className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                        aria-label={`Priority: ${task.priority}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--ink-800)', fontFamily: 'var(--font-body)' }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-400)' }}>{task.category}</p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: isOverdue ? '#fae4eb' : days <= 7 ? '#fef3c7' : 'rgba(232,208,161,0.2)',
                          color: isOverdue ? '#cc4569' : days <= 7 ? '#b45309' : 'var(--ink-500)',
                        }}
                        aria-label={isOverdue ? `Overdue by ${Math.abs(days)} days` : `Due in ${days} days`}
                      >
                        {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.section>

          {/* Budget overview */}
          <motion.section
            className="lg:col-span-2 rounded-3xl p-6"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(232,208,161,0.35)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            aria-labelledby="budget-overview-heading"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="budget-overview-heading"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink-900)' }}
              >
                Budget Overview
              </h2>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-medium transition-colors hover:underline focus-visible:outline-gold-500"
                style={{ color: '#d97706', fontFamily: 'var(--font-body)' }}
              >
                Details →
              </button>
            </div>

            {/* Remaining amount box */}
            <div
              className="mb-5 rounded-2xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(253,243,199,0.8) 0%, rgba(250,243,231,0.9) 100%)',
                border: '1px solid rgba(217,119,6,0.2)',
              }}
            >
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-400)', letterSpacing: '0.12em' }}>
                Remaining Budget
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1 }}>
                {formatCurrency(activeEvent.totalBudget - totalSpent)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-400)' }}>
                of {formatCurrency(activeEvent.totalBudget)} total
              </p>
            </div>

            <div className="space-y-4">
              {topBudgetCategories.map((cat) => {
                const pct = calculateBudgetProgress(cat.allocated, cat.spent)
                return (
                  <div key={cat.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-600)', fontFamily: 'var(--font-body)' }}>
                        <span aria-hidden="true">{cat.icon}</span>
                        {cat.name}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--ink-500)' }} aria-label={`${pct}% spent`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(232,208,161,0.3)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${cat.name}: ${pct}% spent`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        </div>

        {/* ── Vendor pipeline ── */}
        {activeEvent.vendors.length > 0 && (
          <motion.section
            className="mt-6 rounded-3xl p-6"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(232,208,161,0.35)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            aria-labelledby="vendors-quick-heading"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="vendors-quick-heading"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink-900)' }}
              >
                Vendor Pipeline
              </h2>
              <button
                onClick={() => setActiveTab('vendors')}
                className="text-xs font-medium transition-colors hover:underline focus-visible:outline-gold-500"
                style={{ color: '#d97706', fontFamily: 'var(--font-body)' }}
              >
                Manage vendors →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeEvent.vendors.slice(0, 8).map((v) => {
                const statusColors: Record<string, string> = {
                  researching: '#8e8278', contacted: '#0891b2', booked: '#7c3aed',
                  confirmed: '#d97706', paid: '#059669',
                }
                const c = statusColors[v.status] || '#8e8278'
                return (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: `${c}35`, color: c, background: `${c}12`, border: `1px solid ${c}30` }}
                  >
                    {v.category} — {v.name}
                  </span>
                )
              })}
              {activeEvent.vendors.length > 8 && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs"
                  style={{ background: 'rgba(232,208,161,0.2)', border: '1px solid rgba(232,208,161,0.4)', color: 'var(--ink-500)' }}
                >
                  +{activeEvent.vendors.length - 8} more
                </span>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
