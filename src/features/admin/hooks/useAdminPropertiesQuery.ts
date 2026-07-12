import { useQuery } from '@tanstack/react-query'
import { getProperties, getPropertyCount, PropertyFilters } from '@/firebase'

export function useAdminPropertiesQuery(
  page: number,
  itemsPerPage: number,
  filters?: PropertyFilters,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
) {
  return useQuery({
    queryKey: ['admin-properties', page, itemsPerPage, filters, sortBy, sortOrder],
    queryFn: async () => {
      const limitCount = page * itemsPerPage
      const data = await getProperties(limitCount, undefined, sortBy, sortOrder, filters)
      const pageData = data.slice(-itemsPerPage)
      return pageData
    },
    placeholderData: (prev) => prev,
  })
}

export function useAdminCountsQuery(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['admin-counts', filters],
    queryFn: async () => {
      const totalFiltered = await getPropertyCount(filters)
      const total = await getPropertyCount()
      const live = await getPropertyCount({ status: 'live' })
      const pending = await getPropertyCount({ status: 'pending' })
      return { totalFiltered, total, live, pending }
    },
  })
}

export function useAdminPendingPropertiesQuery() {
  return useQuery({
    queryKey: ['admin-pending-properties'],
    queryFn: async () => {
      const data = await getProperties(10, undefined, 'createdAt', 'desc', { status: 'pending' })
      return data
    },
  })
}
