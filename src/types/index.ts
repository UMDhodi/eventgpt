// Core domain types for EventCraft AI

export type EventType = 'wedding' | 'birthday' | 'community'

export interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  icon: string
  color: string
}

export interface TimelineItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
}

export interface VendorItem {
  id: string
  category: string
  name: string
  contact?: string
  price?: number
  status: 'researching' | 'contacted' | 'booked' | 'confirmed' | 'paid'
  notes?: string
  rating?: number
  website?: string
}

export interface GuestItem {
  id: string
  name: string
  email?: string
  phone?: string
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe'
  plusOne: boolean
  dietaryRestrictions?: string
  tableNumber?: number
  notes?: string
}

export interface EventPlan {
  id: string
  type: EventType
  title: string
  date: string
  venue?: string
  guestCount: number
  totalBudget: number
  budgetCategories: BudgetCategory[]
  timeline: TimelineItem[]
  vendors: VendorItem[]
  guests: GuestItem[]
  notes: string
  createdAt: string
  updatedAt: string
  theme?: string
  mood?: string
  personalizedIdeas?: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

export interface AppState {
  // Active event
  activeEvent: EventPlan | null
  // All events
  events: EventPlan[]
  // Chat history per event
  chatHistory: Record<string, ChatMessage[]>
  // UI state
  activeTab: 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'ideas' | 'chat'
  isMobileMenuOpen: boolean
  isOnboarding: boolean

  // Actions
  createEvent: (type: EventType, title: string, date: string, guestCount: number, budget: number) => string
  setActiveEvent: (id: string) => void
  updateEvent: (id: string, updates: Partial<EventPlan>) => void
  deleteEvent: (id: string) => void

  // Budget actions
  addBudgetCategory: (eventId: string, category: Omit<BudgetCategory, 'id'>) => void
  updateBudgetCategory: (eventId: string, categoryId: string, updates: Partial<BudgetCategory>) => void
  deleteBudgetCategory: (eventId: string, categoryId: string) => void

  // Timeline actions
  addTimelineItem: (eventId: string, item: Omit<TimelineItem, 'id'>) => void
  updateTimelineItem: (eventId: string, itemId: string, updates: Partial<TimelineItem>) => void
  deleteTimelineItem: (eventId: string, itemId: string) => void
  toggleTimelineStatus: (eventId: string, itemId: string) => void

  // Vendor actions
  addVendor: (eventId: string, vendor: Omit<VendorItem, 'id'>) => void
  updateVendor: (eventId: string, vendorId: string, updates: Partial<VendorItem>) => void
  deleteVendor: (eventId: string, vendorId: string) => void

  // Guest actions
  addGuest: (eventId: string, guest: Omit<GuestItem, 'id'>) => void
  updateGuest: (eventId: string, guestId: string, updates: Partial<GuestItem>) => void
  deleteGuest: (eventId: string, guestId: string) => void

  // Chat actions
  addMessage: (eventId: string, message: ChatMessage) => void
  updateLastMessage: (eventId: string, content: string) => void

  // UI actions
  setActiveTab: (tab: AppState['activeTab']) => void
  setMobileMenuOpen: (open: boolean) => void
  setIsOnboarding: (val: boolean) => void
}

