import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from './useAuth'
import * as firebase from '@/firebase'

vi.mock('@/firebase', () => ({
  subscribeAuth: vi.fn(),
  subscribeRemoteAdmins: vi.fn(),
}))

vi.mock('@/features/admin', () => ({
  checkIsAdmin: () => true,
}))

describe('useAuth hook', () => {
  it('returns auth state from firebase subscription', () => {
    vi.spyOn(firebase, 'subscribeRemoteAdmins').mockImplementation((cb) => {
      cb(['admin@test.com'])
      return () => {}
    })

    vi.spyOn(firebase, 'subscribeAuth').mockImplementation((cb) => {
      cb({ uid: '123', email: 'test@example.com' })
      return () => {}
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.currentUser).toBeDefined()
    expect(result.current.currentUser?.email).toBe('test@example.com')
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })
})
