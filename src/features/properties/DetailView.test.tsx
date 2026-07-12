import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DetailView from './DetailView'
import { BrowserRouter } from 'react-router-dom'

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
  currentUser: null,
  isAdmin: false,
  isLoading: false,
  isAppReady: true,
}

vi.mock('@/features/auth', () => ({
  useAuth: () => mockAuthState,
}))

describe('DetailView', () => {
  it('renders correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <DetailView
          allProperties={[
            {
              id: 'p1',
              title: 'Test Property',
              location: 'Mumbai',
              type: 'Apartment',
              price: 10000000,
              bhk: 2,
              bathrooms: 2,
              area: 1000,
              status: 'Ready',
              images: [],
              features: [],
              postedBy: 'Owner',
              postedDate: '2023-01-01',
              userId: 'user1',
              createdAt: '2023-01-01',
            },
          ]}
          savedPropertyIds={[]}
          onToggleSaved={vi.fn()}
        />
      </BrowserRouter>,
    )
    expect(container).toBeInTheDocument()
  })
})
