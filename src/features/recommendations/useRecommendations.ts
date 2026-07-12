import { useState, useEffect, useMemo } from 'react'
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore'
import { dbInstance } from '@/firebase'
import { Property } from '@/shared/types/types'
import { useRecentlyViewed } from './useRecentlyViewed'

export const useRecommendations = (allProperties: Property[]) => {
  const [trendingIds, setTrendingIds] = useState<string[]>([])
  const { recentIds } = useRecentlyViewed()

  useEffect(() => {
    const fetchTrending = async () => {
      if (!dbInstance) return
      try {
        const q = query(
          collection(dbInstance, 'user_behavior'),
          where('action', 'in', ['view', 'save']),
          orderBy('timestamp', 'desc'),
          limit(100),
        )
        const snapshot = await getDocs(q)
        const counts: Record<string, number> = {}

        snapshot.forEach((doc) => {
          const data = doc.data()
          const pId = data.metadata?.propertyId
          if (pId) {
            counts[pId] = (counts[pId] || 0) + (data.action === 'save' ? 2 : 1)
          }
        })

        const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
        setTrendingIds(sortedIds.slice(0, 4))
      } catch (err) {
        console.error('Failed to fetch trending', err)
        // Fallback: random
        setTrendingIds(
          allProperties
            .map((p) => p.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4),
        )
      }
    }

    fetchTrending()
  }, [allProperties])

  const recommendedProperties = useMemo(() => {
    const recommended: Property[] = []
    const recentProps = recentIds
      .map((id) => allProperties.find((p) => p.id === id))
      .filter(Boolean) as Property[]

    if (recentProps.length > 0) {
      // Find similar properties based on type and city of recently viewed
      const targetTypes = new Set(recentProps.map((p) => p.type))
      const targetCities = new Set(recentProps.map((p) => p.city))

      const candidates = allProperties.filter((p) => !recentIds.includes(p.id))

      for (const p of candidates) {
        if (targetTypes.has(p.type) || targetCities.has(p.city)) {
          recommended.push(p)
        }
        if (recommended.length >= 4) break
      }
    }

    // Fill remaining with trending or top tier
    if (recommended.length < 4) {
      const more = allProperties
        .filter((p) => !recentIds.includes(p.id) && !recommended.find((r) => r.id === p.id))
        .slice(0, 4 - recommended.length)
      recommended.push(...more)
    }

    return recommended
  }, [allProperties, recentIds])

  const trendingProperties = useMemo(() => {
    return trendingIds
      .map((id) => allProperties.find((p) => p.id === id))
      .filter((p): p is Property => p !== undefined)
  }, [allProperties, trendingIds])

  return { recommendedProperties, trendingProperties }
}
