export function validatePropertyStep1(
  title: string,
  description: string,
  locality: string,
): string | null {
  if (title.trim().length < 10) {
    return 'Title must be at least 10 characters long to guide buyers.'
  }
  if (title.trim().length > 200) {
    return 'Title cannot exceed 200 characters.'
  }
  if (description.trim().length < 30) {
    return 'Please write a comprehensive description (at least 30 characters).'
  }
  if (description.trim().length > 5000) {
    return 'Description cannot exceed 5000 characters.'
  }
  if (!locality.trim()) {
    return 'Locality coordinates cannot be empty.'
  }
  return null
}

export function validatePropertyStep2(
  price: string | number,
  area: string | number,
): string | null {
  const priceVal = Number(price)
  if (!price || isNaN(priceVal) || priceVal <= 0) {
    return 'Please enter a valid positive property price.'
  }
  if (priceVal > 1000000000) {
    // e.g. > 100 crore
    return 'Price exceeds maximum allowed value.'
  }
  const areaVal = Number(area)
  if (!area || isNaN(areaVal) || areaVal <= 0) {
    return 'Please specify a valid property area.'
  }
  return null
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Regex: /^[6-9]\d{9}$/ for Indian mobile.
  const re = /^[6-9]\d{9}$/
  // We can also strip +91 or spaces before checking
  const cleaned = phone
    .replace(/^(?:\+?91|0)/, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
  return re.test(cleaned)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (_e) {
    return false
  }
}

export function isPositiveNumber(num: string | number): boolean {
  const val = Number(num)
  return !isNaN(val) && val > 0
}

export function maxLength(text: string, max: number): boolean {
  return text.length <= max
}
