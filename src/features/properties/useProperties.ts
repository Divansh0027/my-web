/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  subscribeProperties,
  addProperty,
  updatePropertyInDb,
  deletePropertyFromDb,
  logAdminAction,
  getNextPage,
} from '@/firebase'
import { Property, ModerationStatus, ClientUser } from '@/shared/types/types'
import { useLocation } from 'react-router-dom'

import { PropertyFilters } from '@/firebase'

export interface UsePropertiesReturn {
  properties: Property[]
  isLoadingProperties: boolean
  userProperties: Property[]
  visibleProperties: Property[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  handleAddProperty: (
    newProp: Property,
    options?: { postedBy?: string; forceStatus?: string },
  ) => Promise<void>
  handleUpdatePropertyInApp: (updated: Property) => Promise<void>
  handleDeletePropertyInApp: (id: string) => Promise<void>
  handleToggleApprovalInApp: (id: string, reason?: string) => Promise<void>
}

export function useProperties(
  currentUser: ClientUser | null,
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void,
  searchFilters?: PropertyFilters | null,
): UsePropertiesReturn {
  const location = useLocation()
  const queryClient = useQueryClient()

  const {
    data,
    isLoading: isLoadingProperties,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['properties', searchFilters],
    queryFn: async ({ pageParam = null }) => {
      return getNextPage(
        20,
        pageParam || undefined,
        'createdAt',
        'desc',
        searchFilters || undefined,
      )
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined
    },
    initialPageParam: null as any,
  })

  const properties = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.data)
  }, [data])

  const userProperties = useMemo(() => {
    if (!currentUser) return []
    return properties.filter((p) => p.userId === currentUser.uid)
  }, [properties, currentUser])

  const visibleProperties = useMemo(() => {
    return properties.filter(
      (p) =>
        !p.moderationStatus ||
        (p.moderationStatus !== 'pending' && p.moderationStatus !== 'rejected'),
    )
  }, [properties])

  const handleToggleApprovalInApp = useCallback(
    async (id: string, reason: string = 'Admin override') => {
      try {
        const matched = properties.find((p) => p.id === id)
        if (!matched) {
          triggerToast('Property not found in state.', 'error')
          return
        }

        const nextStatus = matched.moderationStatus === 'live' ? 'rejected' : 'live'
        const updated: Property = {
          ...matched,
          moderationStatus: nextStatus,
          // @ts-ignore
          isApproved: nextStatus === 'live',
          auditLog: [
            ...(matched.auditLog || []),
            {
              action: `Status changed to ${nextStatus}`,
              reason: reason,
              timestamp: new Date().toISOString(),
              user: currentUser?.email || 'Unknown Admin',
            },
          ],
        }

        // Optimistic update
        queryClient.setQueryData(['properties'], (old: Property[] = []) =>
          old.map((p) => (p.id === id ? updated : p)),
        )

        const success = await updatePropertyInDb(updated.id, updated)
        if (success) {
          triggerToast(`Listing status updated to ${nextStatus}!`, 'success')
          if (currentUser?.email) {
            logAdminAction('approve/toggle_status', id, currentUser.email, {
              moderationStatus: nextStatus,
              reason,
            })
          }
        } else {
          // Revert optimistic update by refetching/re-subscribing, but the subscription will handle it
          triggerToast('Failed to modify status. Try again.', 'error')
        }
      } catch (err) {
        console.warn('handleToggleApproval error:', err)
        triggerToast('Unexpected error. Try again.', 'error')
      }
    },
    [properties, currentUser, triggerToast, queryClient],
  )

  const handleDeletePropertyInApp = useCallback(
    async (id: string) => {
      try {
        if (!properties.some((p) => p.id === id)) {
          triggerToast('Property not found.', 'error')
          return
        }

        queryClient.setQueryData(['properties'], (old: Property[] = []) =>
          old.filter((p) => p.id !== id),
        )

        const success = await deletePropertyFromDb(id)
        if (success) {
          triggerToast('Property listing removed.', 'success')
          if (currentUser?.email) {
            logAdminAction('delete_property', id, currentUser.email)
          }
        } else {
          triggerToast('Failed to delete. Try again.', 'error')
        }
      } catch (err) {
        console.warn('handleDeleteProperty error:', err)
        triggerToast('Unexpected error. Try again.', 'error')
      }
    },
    [properties, currentUser, triggerToast, queryClient],
  )

  const handleUpdatePropertyInApp = useCallback(
    async (updated: Property) => {
      try {
        queryClient.setQueryData(['properties'], (old: Property[] = []) =>
          old.map((p) => (p.id === updated.id ? updated : p)),
        )

        const success = await updatePropertyInDb(updated.id, updated)
        if (success) {
          triggerToast('Property updated.', 'success')
          if (currentUser?.email) {
            logAdminAction('update_property', updated.id, currentUser.email, {
              status: updated.moderationStatus || 'unknown',
            })
          }
        } else {
          triggerToast('Failed to update. Try again.', 'error')
        }
      } catch (err) {
        console.warn('handleUpdateProperty error:', err)
        triggerToast('Unexpected error. Try again.', 'error')
      }
    },
    [currentUser, triggerToast, queryClient],
  )

  const handleAddProperty = useCallback(
    async (newProp: Property, options?: { postedBy?: string; forceStatus?: string }) => {
      const isFromAdmin = location.pathname.startsWith('/admin')
      const completedProp: Property = {
        ...newProp,
      }
      completedProp.postedDate = newProp.postedDate || new Date().toISOString().split('T')[0]
      const postedByOverride =
        options?.postedBy || newProp.postedBy || (isFromAdmin ? 'Admin Hub' : 'Owner')
      if (
        postedByOverride === 'Owner' ||
        postedByOverride === 'Agent' ||
        postedByOverride === 'Builder'
      ) {
        completedProp.postedBy = postedByOverride
      } else {
        completedProp.postedBy = 'Agent'
        completedProp.customPostedBy = postedByOverride
      }
      if (!completedProp.id) {
        completedProp.id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }
      completedProp.userId = currentUser?.uid || 'guest-user'
      completedProp.userEmail = currentUser?.email || 'guest@shivsayaproperties.com'
      completedProp.userName = currentUser?.displayName || 'Guest User'
      completedProp.createdAt = new Date().toISOString()

      if (options?.forceStatus) {
        completedProp.moderationStatus = options.forceStatus as ModerationStatus
      } else if (!isFromAdmin) {
        completedProp.moderationStatus = 'pending'
      } else if (!completedProp.moderationStatus) {
        completedProp.moderationStatus = 'pending'
      }

      queryClient.setQueryData(['properties'], (old: Property[] = []) => [completedProp, ...old])

      const success = await addProperty(completedProp)
      if (success) {
        if (!isFromAdmin) {
          triggerToast(
            'Your property has been successfully listed and is pending review!',
            'success',
          )
        } else {
          triggerToast('Direct admin asset database listing created!', 'success')
        }
      } else {
        triggerToast('Errored on registry request. Check connection.', 'error')
      }
    },
    [currentUser, location.pathname, triggerToast, queryClient],
  )

  return {
    properties,
    isLoadingProperties,
    userProperties,
    visibleProperties,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleAddProperty,
    handleUpdatePropertyInApp,
    handleDeletePropertyInApp,
    handleToggleApprovalInApp,
  }
}
