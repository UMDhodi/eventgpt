import { formatCurrency, daysUntilEvent, calculateBudgetProgress, getEventTypeConfig, formatDate } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(10000)).toBe('$10,000')
    expect(formatCurrency(500)).toBe('$500')
    expect(formatCurrency(0)).toBe('$0')
  })

  it('handles large amounts', () => {
    expect(formatCurrency(200000)).toBe('$200,000')
  })
})

describe('calculateBudgetProgress', () => {
  it('calculates percentage correctly', () => {
    expect(calculateBudgetProgress(1000, 500)).toBe(50)
    expect(calculateBudgetProgress(1000, 1000)).toBe(100)
    expect(calculateBudgetProgress(1000, 0)).toBe(0)
  })

  it('caps at 100% when over budget', () => {
    expect(calculateBudgetProgress(1000, 1500)).toBe(100)
  })

  it('handles zero allocated', () => {
    expect(calculateBudgetProgress(0, 0)).toBe(0)
  })
})

describe('getEventTypeConfig', () => {
  it('returns correct config for wedding', () => {
    const config = getEventTypeConfig('wedding')
    expect(config.label).toBe('Wedding')
    expect(config.emoji).toBe('💍')
  })

  it('returns correct config for birthday', () => {
    const config = getEventTypeConfig('birthday')
    expect(config.label).toBe('Birthday')
    expect(config.emoji).toBe('🎂')
  })

  it('returns correct config for community', () => {
    const config = getEventTypeConfig('community')
    expect(config.label).toBe('Community Event')
    expect(config.emoji).toBe('🌟')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2026-12-25', 'MMMM d, yyyy')
    expect(result).toBe('December 25, 2026')
  })

  it('handles invalid date gracefully', () => {
    const result = formatDate('invalid-date')
    expect(typeof result).toBe('string')
  })
})

describe('daysUntilEvent', () => {
  it('returns positive number for future dates', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const days = daysUntilEvent(futureDate.toISOString().split('T')[0])
    expect(days).toBeGreaterThan(0)
    expect(days).toBeLessThanOrEqual(31)
  })

  it('returns negative number for past dates', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 10)
    const days = daysUntilEvent(pastDate.toISOString().split('T')[0])
    expect(days).toBeLessThan(0)
  })
})

