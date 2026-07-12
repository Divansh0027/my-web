import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ListingsView from './ListingsView'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'

vi.mock('@/shared/context/ConfigContext', () => ({
  useConfig: () => ({
    theme: 'light',
    whatsappNumber: '123',
    whatsappMessages: { investment: 'invest' },
  }),
}))

vi.mock('@/firebase', () => ({
  logSearch: vi.fn(),
  updateUserProfileDetails: vi.fn(),
}))

const mockAuthState = {
  currentUser: { uid: 'user1', email: 'user@example.com', displayName: 'Test User' },
  isAdmin: false,
  isLoading: false,
  isAppReady: true,
}

vi.mock('@/features/auth', () => ({
  useAuth: () => mockAuthState,
}))

describe('ListingsView', () => {
  it('renders correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <ListingsView properties={[]} savedProperties={[]} onToggleSaved={vi.fn()} />
      </BrowserRouter>,
    )
    expect(container).toBeInTheDocument()
  })
})
