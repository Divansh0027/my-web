import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { trackUserEvent } from '@/analytics'

export interface SearchFilters {
  query?: string
  location: string
  type: string
  budgetMax: number
  bhk: string
}

export interface UseSearchFiltersReturn {
  activeSearchFilters: SearchFilters | null
  handleSearchTrigger: (filters: SearchFilters) => void
}

export function useSearchFilters(): UseSearchFiltersReturn {
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize from URL parameters if possible
  const urlFilters = useMemo(() => {
    if (location.pathname !== '/properties') return null
    const params = new URLSearchParams(location.search)
    if (!params.toString()) return null

    return {
      query: params.get('query') || undefined,
      location: params.get('location') || '',
      type: params.get('type') || '',
      budgetMax: Number(params.get('budgetMax')) || 0,
      bhk: params.get('bhk') || '',
    }
  }, [location.search, location.pathname])

  const [activeSearchFilters, setActiveSearchFilters] = useState<any | null>(urlFilters)

  useEffect(() => {
    if (urlFilters) {
       
      setActiveSearchFilters(urlFilters)
    }
  }, [urlFilters])

  const handleSearchTrigger = useCallback(
    (searchFilters: SearchFilters) => {
      trackUserEvent('search', searchFilters)
      setActiveSearchFilters(searchFilters)

      const params = new URLSearchParams()
      if (searchFilters.query) params.set('query', searchFilters.query)
      if (searchFilters.location) params.set('location', searchFilters.location)
      if (searchFilters.type) params.set('type', searchFilters.type)
      if (searchFilters.budgetMax) params.set('budgetMax', searchFilters.budgetMax.toString())
      if (searchFilters.bhk) params.set('bhk', searchFilters.bhk)

      navigate(`/properties?${params.toString()}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  return { activeSearchFilters, handleSearchTrigger }
}
