import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeHtml } from './sanitize'

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<p>Hello <b>World</b></p>')).toBe('Hello World')
    expect(sanitizeText('<script>alert("XSS")</script>')).toBe('')
  })

  it('handles empty strings', () => {
    expect(sanitizeText('')).toBe('')
  })
})

describe('sanitizeHtml', () => {
  it('allows safe HTML', () => {
    expect(sanitizeHtml('<p>Hello <b>World</b></p>')).toBe('<p>Hello <b>World</b></p>')
  })

  it('strips unsafe HTML', () => {
    expect(sanitizeHtml('<p>Hello <b>World</b><script>alert("XSS")</script></p>')).toBe(
      '<p>Hello <b>World</b></p>',
    )
  })

  it('handles empty strings', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})
