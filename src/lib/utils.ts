import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'
import type { EventType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string, fmt = 'MMMM d, yyyy'): string {
  try {
    return format(new Date(date), fmt)
  } catch {
    return date
  }
}

export function formatRelativeDate(date: string): string {
  try {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isPast(d)) return `${formatDistanceToNow(d)} ago`
    return `in ${formatDistanceToNow(d)}`
  } catch {
    return date
  }
}

export function daysUntilEvent(date: string): number {
  const now = new Date()
  const eventDate = new Date(date)
  const diff = eventDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getBudgetHealthColor(pct: number): string {
  if (pct <= 60) return '#059669' // green
  if (pct <= 85) return '#d97706' // amber
  return '#dc2626' // red
}

export function getEventTypeConfig(type: EventType) {
  const configs = {
    wedding: {
      label: 'Wedding',
      emoji: '💍',
      gradient: 'from-blush-100 to-cream-100',
      accent: '#cc4569',
      accentLight: '#fae4eb',
      icon: '💍',
      description: 'Your perfect love story',
    },
    birthday: {
      label: 'Birthday',
      emoji: '🎂',
      gradient: 'from-gold-100 to-cream-100',
      accent: '#d97706',
      accentLight: '#fef3c7',
      icon: '🎂',
      description: 'Celebrate another chapter',
    },
    community: {
      label: 'Community Event',
      emoji: '🌟',
      gradient: 'from-emerald-100 to-cream-100',
      accent: '#059669',
      accentLight: '#d1fae5',
      icon: '🌟',
      description: 'Bring people together',
    },
  }
  return configs[type]
}

export function calculateBudgetProgress(allocated: number, spent: number): number {
  if (allocated === 0) return 0
  return Math.min(Math.round((spent / allocated) * 100), 100)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function getTimelineStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': '#8e8278',
    'in-progress': '#d97706',
    'completed': '#059669',
  }
  return colors[status] ?? '#8e8278'
}

export function getVendorStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'researching': '#8e8278',
    'contacted': '#0891b2',
    'booked': '#7c3aed',
    'confirmed': '#d97706',
    'paid': '#059669',
  }
  return colors[status] ?? '#8e8278'
}

export function getRsvpStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': '#8e8278',
    'confirmed': '#059669',
    'declined': '#dc2626',
    'maybe': '#d97706',
  }
  return colors[status] ?? '#8e8278'
}

