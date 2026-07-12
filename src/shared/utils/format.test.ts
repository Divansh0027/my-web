import { describe, it, expect } from 'vitest'
import { formatPrice } from '@/shared/utils/format'

describe('formatPrice', () => {
  it('formats crores correctly', () => {
    expect(formatPrice(10000000)).toBe('₹1 Crore')
    expect(formatPrice(15000000)).toBe('₹1.50 Crore')
    expect(formatPrice(12340000)).toBe('₹1.23 Crore')
    expect(formatPrice(10000000, true)).toBe('₹1 Cr')
  })

  it('formats lakhs correctly', () => {
    expect(formatPrice(100000)).toBe('₹1 Lakhs')
    expect(formatPrice(150000)).toBe('₹1.5 Lakhs')
    expect(formatPrice(120000)).toBe('₹1.2 Lakhs')
    expect(formatPrice(100000, true)).toBe('₹1 L')
  })

  it('formats thousands correctly', () => {
    expect(formatPrice(50000)).toBe('₹50,000')
    expect(formatPrice(1000)).toBe('₹1,000')
  })
})

import { formatCurrency, formatDate, formatNumber } from './format'

describe('formatCurrency', () => {
  it('formats currency in INR', () => {
    // Note: space may be narrow no-break space in Intl.NumberFormat
    const formatted = formatCurrency(1000)
    expect(formatted.replace(/\s/g, ' ')).toContain('₹')
    expect(formatted.replace(/\s/g, ' ')).toContain('1,000')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    const d = new Date('2024-01-01T12:00:00Z')
    expect(formatDate(d)).toMatch(/Jan 1, 2024|1 Jan 2024/)
  })
  it('returns empty for invalid date', () => {
    expect(formatDate('')).toBe('')
  })
})

describe('formatNumber', () => {
  it('formats number with commas', () => {
    expect(formatNumber(100000)).toBe('1,00,000')
  })
})
