import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseToastReturn {
  toastMessage: string | null
  toastType: 'success' | 'info' | 'error'
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void
  closeToast: () => void
}

export function useToast(): UseToastReturn {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success')
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerToast = useCallback(
    (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
      setToastMessage(msg)
      setToastType(type)
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null)
        toastTimerRef.current = null
      }, 4000)
    },
    [],
  )

  const closeToast = useCallback(() => {
    setToastMessage(null)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  return { toastMessage, toastType, triggerToast, closeToast }
}
