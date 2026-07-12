import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SavedView from './SavedView'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/shared/context/ConfigContext', () => ({
  useConfig: () => ({
    theme: 'light',
  }),
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

describe('SavedView', () => {
  it('renders correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <SavedView
          savedProperties={[]}
          properties={[]}
          onOpenLogin={vi.fn()}
          onToggleSaved={vi.fn()}
        />
      </BrowserRouter>,
    )
    expect(container).toBeInTheDocument()
  })
})
