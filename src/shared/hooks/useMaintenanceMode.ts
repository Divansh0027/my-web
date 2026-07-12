import { useState, useEffect } from 'react'
import { subscribeRemoteControls } from '@/firebase'

export function useMaintenanceMode(): boolean {
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    const unsubscribeControls = subscribeRemoteControls((controls: any) => {
      setMaintenanceMode(!!(controls.maintenanceMode || controls.offlineMaintenance))
    })

    return () => unsubscribeControls()
  }, [])

  return maintenanceMode
}
