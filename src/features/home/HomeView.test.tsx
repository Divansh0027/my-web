import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomeView from './HomeView'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@/shared/context/ConfigContext', () => ({
  useConfig: () => ({
    theme: 'light',
    whatsappNumber: '123',
    whatsappMessages: { investment: 'invest' },
  }),
}))

describe('HomeView', () => {
  it('renders correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <HomeView properties={[]} onToggleSaved={vi.fn()} savedPropertyIds={[]} />
      </BrowserRouter>,
    )
    expect(container).toBeInTheDocument()
  })
})
