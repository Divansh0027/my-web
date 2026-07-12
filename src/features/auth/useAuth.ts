import { useState, useEffect, useMemo } from 'react'
import * as Sentry from '@sentry/react'
import { subscribeAuth, ClientUser, subscribeRemoteAdmins } from '@/firebase'
import { checkIsAdmin } from '@/features/admin'

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
  const [adminsList, setAdminsList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    const unsub = subscribeRemoteAdmins((emails) => {
      setAdminsList(emails)
    })
    return () => unsub()
  }, [])

  const isAdmin = useMemo(
    () => checkIsAdmin(currentUser as unknown, adminsList),
    [currentUser, adminsList],
  )

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
      unsubscribe()
      clearTimeout(failsafe)
    }
  }, [])

  return { currentUser, isAdmin, isLoading, isAppReady }
}
