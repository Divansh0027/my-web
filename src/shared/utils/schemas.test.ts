import { describe, it, expect } from 'vitest'
import { loginSchema, propertySchema } from './schemas'

describe('loginSchema', () => {
  it('validates correct email and password', () => {
    expect(
      loginSchema.safeParse({ email: 'test@example.com', password: 'password123' }).success,
    ).toBe(true)
  })
  it('fails on invalid email', () => {
    expect(loginSchema.safeParse({ email: 'invalid', password: 'password123' }).success).toBe(false)
  })
})

describe('propertySchema', () => {
  it('validates valid property', () => {
    expect(
      propertySchema.safeParse({
        title: 'Beautiful home in the city',
        description:
          'This is a very long description that should pass the minimum length requirement.',
        price: 1000000,
        area: 1500,
      }).success,
    ).toBe(true)
  })
})
