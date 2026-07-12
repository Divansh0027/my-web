import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Logo from '@/shared/components/Logo'

describe('Logo Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Logo />)
    expect(container).toBeDefined()
  })
})
