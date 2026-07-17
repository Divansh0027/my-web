/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react'
import { AdminTabProps } from '@/shared/types/types'

const AdminContext = createContext<any | null>(null)

export const AdminProvider = ({
  children,
  value,
}: {
  children: React.ReactNode
  value: any
}) => {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
