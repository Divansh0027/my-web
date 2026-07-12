import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import * as useAuthHookModule from './useAuth'

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

const TestComponent = () => {
  const { currentUser, isAdmin, isLoading, isAppReady } = useAuth()
  return (
    <div>
      <div data-testid="currentUser">{currentUser?.email || 'null'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="isLoading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="isAppReady">{isAppReady ? 'true' : 'false'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides auth values to children', () => {
    vi.mocked(useAuthHookModule.useAuth).mockReturnValue({
      currentUser: { email: 'test@example.com', uid: '123' } as any,
      isAdmin: true,
      isLoading: false,
      isAppReady: true,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId('currentUser').textContent).toBe('test@example.com')
    expect(screen.getByTestId('isAdmin').textContent).toBe('true')
    expect(screen.getByTestId('isLoading').textContent).toBe('false')
    expect(screen.getByTestId('isAppReady').textContent).toBe('true')
  })
})
