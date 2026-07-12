/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react'
import { ClientUser } from '@/firebase'
import { useAuth as useAuthHook } from './useAuth'

interface AuthContextType {
  currentUser: ClientUser | null
  isAdmin: boolean
  isLoading: boolean
  isAppReady: boolean
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
  isAppReady: false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isLoading, isAppReady } = useAuthHook()

  const value = useMemo(
    () => ({ currentUser, isAdmin, isLoading, isAppReady }),
    [currentUser, isAdmin, isLoading, isAppReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
