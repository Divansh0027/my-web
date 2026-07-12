import { describe, it, expect } from 'vitest'
import { checkIsAdmin } from '@/features/admin'

describe('checkIsAdmin', () => {
  it('returns false for null user', () => {
    expect(checkIsAdmin(null, [])).toBe(false)
  })

  it('returns false for user without email', () => {
    expect(checkIsAdmin({ uid: '123', email: '' }, [])).toBe(false)
  })

  it('returns true if user email is in adminsList', () => {
    const user = { uid: '123', email: 'admin@example.com' }
    expect(checkIsAdmin(user, ['admin@example.com', 'other@example.com'])).toBe(true)
  })

  it('returns true if user has isAdmin flag', () => {
    const user = { uid: '123', email: 'regular@example.com', isAdmin: true }
    expect(checkIsAdmin(user, [])).toBe(true)
  })

  it('handles case insensitivity', () => {
    const user = { uid: '123', email: 'ADMIN@example.com' }
    expect(checkIsAdmin(user, ['admin@example.com'])).toBe(true)
  })

  it('returns false if user is neither in list nor has flag', () => {
    const user = { uid: '123', email: 'user@example.com' }
    expect(checkIsAdmin(user, ['admin@example.com'])).toBe(false)
  })
})
