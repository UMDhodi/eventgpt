'use client'

import { useStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardView from './DashboardView'
import BudgetView from '../budget/BudgetView'
import TimelineView from '../timeline/TimelineView'
import VendorsView from '../vendors/VendorsView'
import GuestsView from '../guests/GuestsView'
import IdeasView from '../ideas/IdeasView'
import ChatView from '../chat/ChatView'

export default function Dashboard() {
  const { activeTab, activeEvent } = useStore()

  if (!activeEvent) return null

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    budget: <BudgetView />,
    timeline: <TimelineView />,
    vendors: <VendorsView />,
    guests: <GuestsView />,
    ideas: <IdeasView />,
    chat: <ChatView />,
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-light)' }} id="main-content" aria-label="Event planning dashboard">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {views[activeTab]}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

