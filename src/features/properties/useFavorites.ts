import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFavorites, toggleFavorite } from '@/firebase'
import { ClientUser } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { trackBehavior } from '@/features/recommendations/behaviorService'

export interface UseFavoritesReturn {
  savedPropertyIds: string[]
  handleToggleSaved: (propertyId: string) => Promise<void>
}

export function useFavorites(
  currentUser: ClientUser | null,
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void,
  setIsLoginModalOpen: (isOpen: boolean) => void,
): UseFavoritesReturn {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Use React Query for favorites caching
  const { data: savedPropertyIds = [] } = useQuery({
    queryKey: ['favorites', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) {
        const localFavsStr = localStorage.getItem('ssp_local_favorites')
        return localFavsStr ? JSON.parse(localFavsStr) : []
      }

      const dbFavs = await getFavorites(currentUser.uid)
      const localFavsStr = localStorage.getItem('ssp_local_favorites')
      const localFavs: string[] = localFavsStr ? JSON.parse(localFavsStr) : []

      if (localFavs.length > 0) {
        const mergedFavs = Array.from(new Set([...dbFavs, ...localFavs]))
        for (const propId of localFavs) {
          if (!dbFavs.includes(propId)) {
            await toggleFavorite(currentUser.uid, propId)
          }
        }
        localStorage.removeItem('ssp_local_favorites')
        triggerToast('Merged your guest favorites with your account!', 'success')
        return mergedFavs
      }
      return dbFavs
    },
    // enabled removed to run for guests too
  })

  // Also handle redirect view logic after merging favorites
  useEffect(() => {
    if (currentUser && savedPropertyIds.length > 0) {
      const getRedirectView = () => sessionStorage.getItem('redirectView')
      const setRedirectView = (view: string | null) => {
        if (view) {
          sessionStorage.setItem('redirectView', view)
        } else {
          sessionStorage.removeItem('redirectView')
        }
      }
      const redirectView = getRedirectView()
      if (redirectView) {
        if (redirectView === 'list_property') navigate('/list-property')
        setRedirectView(null)
      }
    }
  }, [currentUser, savedPropertyIds.length, navigate])

  const handleToggleSaved = useCallback(
    async (propertyId: string) => {
      if (!currentUser) {
        // Save to local storage for guests
        queryClient.setQueryData(['favorites', undefined], (old: string[] = []) => {
          const updated = old.includes(propertyId)
            ? old.filter((id) => id !== propertyId)
            : [...old, propertyId]
          localStorage.setItem('ssp_local_favorites', JSON.stringify(updated))
          return updated
        })
        triggerToast('Saved locally. Sign in to sync across devices.', 'info')
        return
      }

      // Optimistic update
      queryClient.setQueryData(['favorites', currentUser.uid], (old: string[] = []) => {
        if (old.includes(propertyId)) {
          return old.filter((id) => id !== propertyId)
        } else {
          return [...old, propertyId]
        }
      })

      const isNowSaved = await toggleFavorite(currentUser.uid, propertyId)

      if (isNowSaved) {
        triggerToast('Property saved to your favorites.', 'success')
        trackBehavior(currentUser.uid, 'save', { propertyId })
      } else {
        triggerToast('Property removed from favorites.', 'info')
      }

      // Re-fetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUser.uid] })
    },
    [currentUser, queryClient, triggerToast],
  )

  return { savedPropertyIds, handleToggleSaved }
}
