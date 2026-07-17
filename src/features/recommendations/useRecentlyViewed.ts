import { useState, useEffect } from 'react'
import { Property } from '@/shared/types/types'

export const useRecentlyViewed = (currentPropertyId?: string) => {
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ssp_recently_viewed')
      if (stored) {
         
        setRecentIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const addRecentlyViewed = (propertyId: string) => {
    try {
      setRecentIds((prev) => {
        const filtered = prev.filter((id) => id !== propertyId)
        const next = [propertyId, ...filtered].slice(0, 10)
        localStorage.setItem('ssp_recently_viewed', JSON.stringify(next))
        return next
      })
    } catch (e) {
      console.error(e)
    }
  }

  return {
    recentIds: recentIds.filter((id) => id !== currentPropertyId),
    addRecentlyViewed,
  }
}
