import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  AppState,
  EventPlan,
  EventType,
  BudgetCategory,
  TimelineItem,
  VendorItem,
  GuestItem,
  ChatMessage,
} from '@/types'

// Default budget templates per event type
function getDefaultBudget(type: EventType, total: number): BudgetCategory[] {
  const templates: Record<EventType, Array<{ name: string; pct: number; icon: string; color: string }>> = {
    wedding: [
      { name: 'Venue', pct: 30, icon: '🏛️', color: '#cc4569' },
      { name: 'Catering', pct: 25, icon: '🍽️', color: '#d97706' },
      { name: 'Photography', pct: 10, icon: '📸', color: '#7c3aed' },
      { name: 'Décor & Florals', pct: 10, icon: '💐', color: '#059669' },
      { name: 'Entertainment', pct: 8, icon: '🎶', color: '#0891b2' },
      { name: 'Attire', pct: 7, icon: '👗', color: '#db2777' },
      { name: 'Invitations', pct: 3, icon: '✉️', color: '#92400e' },
      { name: 'Miscellaneous', pct: 7, icon: '✨', color: '#6b7280' },
    ],
    birthday: [
      { name: 'Venue', pct: 25, icon: '🎪', color: '#d97706' },
      { name: 'Catering & Cake', pct: 30, icon: '🎂', color: '#cc4569' },
      { name: 'Decorations', pct: 15, icon: '🎈', color: '#7c3aed' },
      { name: 'Entertainment', pct: 20, icon: '🎮', color: '#059669' },
      { name: 'Favors & Gifts', pct: 7, icon: '🎁', color: '#0891b2' },
      { name: 'Miscellaneous', pct: 3, icon: '✨', color: '#6b7280' },
    ],
    community: [
      { name: 'Venue & Permits', pct: 25, icon: '🏟️', color: '#059669' },
      { name: 'Marketing & Promo', pct: 15, icon: '📣', color: '#d97706' },
      { name: 'Equipment & Tech', pct: 20, icon: '🎤', color: '#7c3aed' },
      { name: 'Food & Beverages', pct: 20, icon: '🥗', color: '#cc4569' },
      { name: 'Volunteers', pct: 5, icon: '🤝', color: '#0891b2' },
      { name: 'Safety & Security', pct: 8, icon: '🛡️', color: '#92400e' },
      { name: 'Miscellaneous', pct: 7, icon: '✨', color: '#6b7280' },
    ],
  }
  return templates[type].map((t) => ({
    id: uuidv4(),
    name: t.name,
    allocated: Math.round((t.pct / 100) * total),
    spent: 0,
    icon: t.icon,
    color: t.color,
  }))
}

// Default timeline templates
function getDefaultTimeline(type: EventType, eventDate: string): TimelineItem[] {
  const date = new Date(eventDate)
  const daysAgo = (n: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
  }

  const templates: Record<EventType, Array<Omit<TimelineItem, 'id'>>> = {
    wedding: [
      { title: 'Set Budget & Guest List', description: 'Determine your overall budget and compile initial guest list', dueDate: daysAgo(365), status: 'pending', priority: 'high', category: 'Planning' },
      { title: 'Book Venue', description: 'Tour and secure your ceremony and reception venue', dueDate: daysAgo(300), status: 'pending', priority: 'high', category: 'Venue' },
      { title: 'Hire Photographer & Videographer', description: 'Review portfolios and sign contracts', dueDate: daysAgo(270), status: 'pending', priority: 'high', category: 'Vendors' },
      { title: 'Choose & Book Caterer', description: 'Schedule tastings and finalize menu', dueDate: daysAgo(240), status: 'pending', priority: 'high', category: 'Catering' },
      { title: 'Send Save the Dates', description: 'Mail or email save the dates to all guests', dueDate: daysAgo(180), status: 'pending', priority: 'medium', category: 'Invitations' },
      { title: 'Book Entertainment', description: 'Band, DJ, or other performers', dueDate: daysAgo(150), status: 'pending', priority: 'medium', category: 'Entertainment' },
      { title: 'Send Invitations', description: 'Mail formal invitations with RSVP deadline', dueDate: daysAgo(90), status: 'pending', priority: 'high', category: 'Invitations' },
      { title: 'Final Dress Fitting', description: 'Last alterations and fitting', dueDate: daysAgo(30), status: 'pending', priority: 'high', category: 'Attire' },
      { title: 'Final Vendor Confirmations', description: 'Confirm all vendors 1 week before', dueDate: daysAgo(7), status: 'pending', priority: 'high', category: 'Vendors' },
      { title: 'Rehearsal & Dinner', description: 'Practice ceremony and celebrate with bridal party', dueDate: daysAgo(1), status: 'pending', priority: 'high', category: 'Day Of' },
    ],
    birthday: [
      { title: 'Set Date & Theme', description: 'Decide on party date and choose a fun theme', dueDate: daysAgo(60), status: 'pending', priority: 'high', category: 'Planning' },
      { title: 'Book Venue', description: 'Reserve your celebration space', dueDate: daysAgo(45), status: 'pending', priority: 'high', category: 'Venue' },
      { title: 'Send Invitations', description: 'Digital or physical invitations to guests', dueDate: daysAgo(30), status: 'pending', priority: 'high', category: 'Invitations' },
      { title: 'Order Birthday Cake', description: 'Place custom cake order with bakery', dueDate: daysAgo(14), status: 'pending', priority: 'high', category: 'Catering' },
      { title: 'Book Entertainment', description: 'Games, activities, performers', dueDate: daysAgo(14), status: 'pending', priority: 'medium', category: 'Entertainment' },
      { title: 'Order Decorations', description: 'Buy balloons, banners, and themed décor', dueDate: daysAgo(10), status: 'pending', priority: 'medium', category: 'Décor' },
      { title: 'Prepare Party Favors', description: 'Assemble goody bags or favors', dueDate: daysAgo(3), status: 'pending', priority: 'low', category: 'Favors' },
      { title: 'Confirm All Bookings', description: 'Final confirmation with all vendors', dueDate: daysAgo(1), status: 'pending', priority: 'high', category: 'Vendors' },
    ],
    community: [
      { title: 'Define Goals & Budget', description: 'Establish event purpose, KPIs, and financial plan', dueDate: daysAgo(120), status: 'pending', priority: 'high', category: 'Planning' },
      { title: 'Secure Permits & Insurance', description: 'Apply for all required permits and event insurance', dueDate: daysAgo(90), status: 'pending', priority: 'high', category: 'Legal' },
      { title: 'Book Venue & Equipment', description: 'Confirm space and audiovisual equipment', dueDate: daysAgo(75), status: 'pending', priority: 'high', category: 'Venue' },
      { title: 'Launch Marketing Campaign', description: 'Social media, posters, email blast', dueDate: daysAgo(60), status: 'pending', priority: 'high', category: 'Marketing' },
      { title: 'Recruit Volunteers', description: 'Sign up and brief volunteer team', dueDate: daysAgo(45), status: 'pending', priority: 'medium', category: 'Volunteers' },
      { title: 'Confirm Speakers / Performers', description: 'Finalize lineup and schedules', dueDate: daysAgo(30), status: 'pending', priority: 'high', category: 'Programming' },
      { title: 'Final Logistics Check', description: 'Walk through venue, test equipment', dueDate: daysAgo(7), status: 'pending', priority: 'high', category: 'Logistics' },
      { title: 'Day-Of Setup', description: 'Coordinate setup crew and opening checklist', dueDate: daysAgo(0), status: 'pending', priority: 'high', category: 'Day Of' },
    ],
  }

  return templates[type].map((t) => ({ ...t, id: uuidv4() }))
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeEvent: null,
      events: [],
      chatHistory: {},
      activeTab: 'dashboard',
      isMobileMenuOpen: false,
      isOnboarding: true,

      createEvent: (type, title, date, guestCount, budget) => {
        const id = uuidv4()
        const now = new Date().toISOString()
        const event: EventPlan = {
          id,
          type,
          title,
          date,
          guestCount,
          totalBudget: budget,
          budgetCategories: getDefaultBudget(type, budget),
          timeline: getDefaultTimeline(type, date),
          vendors: [],
          guests: [],
          notes: '',
          createdAt: now,
          updatedAt: now,
          personalizedIdeas: [],
        }
        set((state) => ({
          events: [...state.events, event],
          activeEvent: event,
          isOnboarding: false,
          activeTab: 'dashboard',
          chatHistory: { ...state.chatHistory, [id]: [] },
        }))
        return id
      },

      setActiveEvent: (id) => {
        const event = get().events.find((e) => e.id === id) ?? null
        set({ activeEvent: event })
      },

      updateEvent: (id, updates) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          )
          const activeEvent = state.activeEvent?.id === id
            ? events.find((e) => e.id === id) ?? state.activeEvent
            : state.activeEvent
          return { events, activeEvent }
        })
      },

      deleteEvent: (id) => {
        set((state) => {
          const events = state.events.filter((e) => e.id !== id)
          return {
            events,
            activeEvent: state.activeEvent?.id === id ? (events[0] ?? null) : state.activeEvent,
            isOnboarding: events.length === 0,
          }
        })
      },

      addBudgetCategory: (eventId, category) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, budgetCategories: [...e.budgetCategories, { ...category, id: uuidv4() }] }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      updateBudgetCategory: (eventId, categoryId, updates) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  budgetCategories: e.budgetCategories.map((c) =>
                    c.id === categoryId ? { ...c, ...updates } : c
                  ),
                }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      deleteBudgetCategory: (eventId, categoryId) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, budgetCategories: e.budgetCategories.filter((c) => c.id !== categoryId) }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      addTimelineItem: (eventId, item) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, timeline: [...e.timeline, { ...item, id: uuidv4() }] }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      updateTimelineItem: (eventId, itemId, updates) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  timeline: e.timeline.map((t) =>
                    t.id === itemId ? { ...t, ...updates } : t
                  ),
                }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      deleteTimelineItem: (eventId, itemId) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, timeline: e.timeline.filter((t) => t.id !== itemId) }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      toggleTimelineStatus: (eventId, itemId) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  timeline: e.timeline.map((t) =>
                    t.id === itemId
                      ? { ...t, status: (t.status === 'completed' ? 'pending' : 'completed') as TimelineItem['status'] }
                      : t
                  ),
                }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      addVendor: (eventId, vendor) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, vendors: [...e.vendors, { ...vendor, id: uuidv4() }] }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      updateVendor: (eventId, vendorId, updates) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  vendors: e.vendors.map((v) =>
                    v.id === vendorId ? { ...v, ...updates } : v
                  ),
                }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      deleteVendor: (eventId, vendorId) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, vendors: e.vendors.filter((v) => v.id !== vendorId) }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      addGuest: (eventId, guest) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, guests: [...e.guests, { ...guest, id: uuidv4() }] }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      updateGuest: (eventId, guestId, updates) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  guests: e.guests.map((g) =>
                    g.id === guestId ? { ...g, ...updates } : g
                  ),
                }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      deleteGuest: (eventId, guestId) => {
        set((state) => {
          const events = state.events.map((e) =>
            e.id === eventId
              ? { ...e, guests: e.guests.filter((g) => g.id !== guestId) }
              : e
          )
          return { events, activeEvent: events.find((e) => e.id === eventId) ?? state.activeEvent }
        })
      },

      addMessage: (eventId, message) => {
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [eventId]: [...(state.chatHistory[eventId] ?? []), message],
          },
        }))
      },

      updateLastMessage: (eventId, content) => {
        set((state) => {
          const messages = [...(state.chatHistory[eventId] ?? [])]
          if (messages.length > 0) {
            messages[messages.length - 1] = { ...messages[messages.length - 1], content, isStreaming: false }
          }
          return { chatHistory: { ...state.chatHistory, [eventId]: messages } }
        })
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setIsOnboarding: (val) => set({ isOnboarding: val }),
    }),
    {
      name: 'eventcraft-ai-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
      partialize: (state) => ({
        events: state.events,
        chatHistory: state.chatHistory,
        activeEvent: state.activeEvent,
        isOnboarding: state.isOnboarding,
      }),
    }
  )
)

