import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useFavorites } from './useFavorites'
import * as reactQuery from '@tanstack/react-query'
import * as firebase from '@/firebase'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/firebase', () => ({
  getFavorites: vi.fn(),
  toggleFavorite: vi.fn(),
}))

describe('useFavorites hook', () => {
  it('handles empty states', () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({ data: [] } as any)
    vi.spyOn(reactQuery, 'useQueryClient').mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    } as any)

    const triggerToast = vi.fn()
    const setLoginOpen = vi.fn()
    const { result } = renderHook(() => useFavorites(null, triggerToast, setLoginOpen))

    expect(result.current.savedPropertyIds).toEqual([])
  })

  it('toggles favorite when logged in', async () => {
    const setQueryData = vi.fn()
    const invalidateQueries = vi.fn()
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({ data: ['123'] } as any)
    vi.spyOn(reactQuery, 'useQueryClient').mockReturnValue({
      setQueryData,
      invalidateQueries,
    } as any)

    vi.spyOn(firebase, 'toggleFavorite').mockResolvedValue(true)

    const triggerToast = vi.fn()
    const setLoginOpen = vi.fn()
    const { result } = renderHook(() =>
      useFavorites({ uid: 'user1' } as any, triggerToast, setLoginOpen),
    )

    await act(async () => {
      await result.current.handleToggleSaved('123')
    })

    expect(setQueryData).toHaveBeenCalled()
    expect(invalidateQueries).toHaveBeenCalled()
    expect(firebase.toggleFavorite).toHaveBeenCalledWith('user1', '123')
  })

  it('prompts login if toggling when logged out', async () => {
    const triggerToast = vi.fn()
    const setLoginOpen = vi.fn()
    const { result } = renderHook(() => useFavorites(null, triggerToast, setLoginOpen))

    await act(async () => {
      await result.current.handleToggleSaved('123')
    })

    expect(triggerToast).toHaveBeenCalledWith('Please sign in to save properties.', 'info')
    expect(setLoginOpen).toHaveBeenCalledWith(true)
  })
})
