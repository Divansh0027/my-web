import DOMPurify from 'dompurify'

export function sanitizeText(text: string): string {
  if (!text) return text
  // Use DOMPurify to strip any HTML tags, returning plain text if needed.
  // Alternatively, just escape basic HTML chars.
  // Here we use DOMPurify to clean up.
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }) // Strip all tags
}

export function sanitizeHtml(html: string): string {
  if (!html) return html
  return DOMPurify.sanitize(html)
}
