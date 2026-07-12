import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useProperties } from './useProperties'
import * as reactQuery from '@tanstack/react-query'

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({ setQueryData: vi.fn() })),
}))

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
}))

describe('useProperties hook', () => {
  it('returns properties data', () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: [{ id: 'p1' }],
      isLoading: false,
    } as any)

    const triggerToast = vi.fn()
    const { result } = renderHook(() => useProperties(null, triggerToast))

    expect(result.current.properties).toEqual([{ id: 'p1' }])
    expect(result.current.isLoadingProperties).toBe(false)
  })
})
