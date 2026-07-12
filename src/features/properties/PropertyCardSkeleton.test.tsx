import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PropertyCardSkeleton from './PropertyCardSkeleton'

describe('PropertyCardSkeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<PropertyCardSkeleton />)
    expect(container.firstChild).toBeDefined()
  })
})
