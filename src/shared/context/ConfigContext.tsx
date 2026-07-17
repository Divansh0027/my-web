/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { BUSINESS_CONFIG } from '@/config'
import { subscribeRemoteSettings } from '@/firebase'

const ConfigContext = createContext(BUSINESS_CONFIG)
export const useConfig = () => useContext(ConfigContext)

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState(BUSINESS_CONFIG)

  useEffect(() => {
    return subscribeRemoteSettings((settings) => {
      if (settings && typeof settings === 'object') {
        setConfig((prev: typeof BUSINESS_CONFIG) => {
          const newSettings: Partial<typeof BUSINESS_CONFIG> = {}
          for (const key of Object.keys(settings)) {
            if (Object.prototype.hasOwnProperty.call(prev, key)) {
              newSettings[key as keyof typeof BUSINESS_CONFIG] = settings[key] as any
            }
          }
          return {
            ...prev,
            ...newSettings,
          }
        })
      }
    })
  }, [])

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
