import '@testing-library/jest-dom'
import '@testing-library/react'

// Use Firebase emulators for testing
import.meta.env.VITE_USE_FIREBASE_EMULATOR = 'true'
import.meta.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
import.meta.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
import.meta.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
