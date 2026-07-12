import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginModal from './LoginModal'

vi.mock('@/firebase', () => ({
  loginWithEmail: vi.fn(),
  signupWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  sendPasswordReset: vi.fn(),
  trackEvent: vi.fn(),
}))
vi.mock('@/shared/context/ConfigContext', () => ({
  useConfig: () => ({ name: 'Test' }),
}))

describe('LoginModal', () => {
  it('renders login form by default', () => {
    render(<LoginModal isOpen={true} onClose={() => {}} onLoginSuccess={() => {}} />)
    expect(screen.getAllByText(/Sign In/i)[0]).toBeDefined()
  })
})
