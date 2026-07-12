import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProfileView from './ProfileView'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/firebase', () => ({
  updateUserProfileDetails: vi.fn(),
  logoutUser: vi.fn(),
  getUserEnquiries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/shared/context/ConfigContext', () => ({
  useConfig: () => ({ theme: 'light' }),
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

describe('ProfileView', () => {
  it('renders ProfileView correctly', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ProfileView
            userProperties={[]}
            onShowNotification={vi.fn()}
            allProperties={[]}
            savedPropertyIds={[]}
            onToggleSaved={vi.fn()}
          />
        </BrowserRouter>,
      )
    })

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })
})
