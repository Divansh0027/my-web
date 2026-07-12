import { isValidEmail, isValidPhone, isValidUrl, isPositiveNumber, maxLength } from './validate'
import { describe, it, expect } from 'vitest'
import { validatePropertyStep1, validatePropertyStep2 } from '@/shared/utils/validate'

describe('validatePropertyStep1', () => {
  it('returns null for valid inputs', () => {
    expect(
      validatePropertyStep1(
        'Beautiful Villa in Suburbs',
        'This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.',
        'South Extension',
      ),
    ).toBeNull()
  })

  it('fails if title is too short', () => {
    expect(
      validatePropertyStep1(
        'Short',
        'This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.',
        'South Extension',
      ),
    ).toBe('Title must be at least 10 characters long to guide buyers.')
  })

  it('fails if description is too short', () => {
    expect(
      validatePropertyStep1('Beautiful Villa in Suburbs', 'Short desc', 'South Extension'),
    ).toBe('Please write a comprehensive description (at least 30 characters).')
  })

  it('fails if locality is empty', () => {
    expect(
      validatePropertyStep1(
        'Beautiful Villa in Suburbs',
        'This is a very long and detailed description for a beautiful villa located in the suburbs, which has amazing amenities.',
        '',
      ),
    ).toBe('Locality coordinates cannot be empty.')
  })
})

describe('validatePropertyStep2', () => {
  it('returns null for valid inputs', () => {
    expect(validatePropertyStep2('1000000', '1500')).toBeNull()
    expect(validatePropertyStep2(1000000, 1500)).toBeNull()
  })

  it('fails for invalid price', () => {
    expect(validatePropertyStep2('', '1500')).toBe('Please enter a valid positive property price.')
    expect(validatePropertyStep2('0', '1500')).toBe('Please enter a valid positive property price.')
    expect(validatePropertyStep2('-50', '1500')).toBe(
      'Please enter a valid positive property price.',
    )
    expect(validatePropertyStep2('abc', '1500')).toBe(
      'Please enter a valid positive property price.',
    )
  })

  it('fails for invalid area', () => {
    expect(validatePropertyStep2('1000000', '')).toBe('Please specify a valid property area.')
    expect(validatePropertyStep2('1000000', '0')).toBe('Please specify a valid property area.')
    expect(validatePropertyStep2('1000000', '-10')).toBe('Please specify a valid property area.')
    expect(validatePropertyStep2('1000000', 'xyz')).toBe('Please specify a valid property area.')
  })
})

describe('Validation Helpers', () => {
  it('validates email', () => {
    expect(isValidEmail('test@test.com')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
  })

  it('validates phone', () => {
    expect(isValidPhone('9876543210')).toBe(true)
    expect(isValidPhone('+919876543210')).toBe(true)
    expect(isValidPhone('invalid')).toBe(false)
    expect(isValidPhone('1234567890')).toBe(false)
  })

  it('validates URL', () => {
    expect(isValidUrl('https://google.com')).toBe(true)
    expect(isValidUrl('invalid')).toBe(false)
  })

  it('validates positive number', () => {
    expect(isPositiveNumber(10)).toBe(true)
    expect(isPositiveNumber(-10)).toBe(false)
    expect(isPositiveNumber('10')).toBe(true)
    expect(isPositiveNumber('-10')).toBe(false)
  })

  it('validates max length', () => {
    expect(maxLength('abc', 5)).toBe(true)
    expect(maxLength('abcdef', 5)).toBe(false)
  })
})
