import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/react'
import { subscribeAuth, ClientUser, subscribeToAdminStatus } from '@/firebase'

export interface UseAuthReturn {
  currentUser: ClientUser | null
  isAdmin: boolean
  isLoading: boolean
  isAppReady: boolean
}

/**
 * Custom hook to manage authentication state.
 * @returns {UseAuthReturn} Auth state including current user and admin status.
 */
export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    let unsubAdmin: (() => void) | undefined

    if (currentUser?.uid) {
      unsubAdmin = subscribeToAdminStatus(currentUser.uid, (status) => {
        setIsAdmin(status)
      })
    } else {
      setIsAdmin(false)
    }

    return () => {
      if (unsubAdmin) unsubAdmin()
    }
  }, [currentUser?.uid])

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user)
      if (user) {
        Sentry.setUser({ id: user.uid, email: user.email || undefined })
      } else {
        Sentry.setUser(null)
      }
      setIsLoading(false)
      setIsAppReady(true)
    })

    const failsafe = setTimeout(() => {
      setIsAppReady(true)
      setIsLoading(false)
    }, 4000)

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
      clearTimeout(failsafe)
    }
  }, [])

  return { currentUser, isAdmin, isLoading, isAppReady }
}
