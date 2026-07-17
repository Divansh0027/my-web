import React, { useState } from 'react'
import { liteClient as algoliasearch } from 'algoliasearch/lite'
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  RangeInput,
  Pagination,
  Configure,
  Stats,
} from 'react-instantsearch'
import { Property } from '@/shared/types/types'
import { PropertyCard } from './PropertyCard'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Navigation } from 'lucide-react'

// Dummy fallback client if no env vars are provided
const fallbackClient = {
  search(requests: any) {
    return Promise.resolve({
      results: requests.map(() => ({
        hits: [],
        nbHits: 0,
        nbPages: 0,
        page: 0,
        processingTimeMS: 0,
        hitsPerPage: 0,
        exhaustiveNbHits: false,
        query: '',
        params: '',
      })),
    })
  },
  searchForFacetValues() {
    return Promise.resolve([{ facetHits: [] }])
  },
}

const searchClient =
  import.meta.env.VITE_ALGOLIA_APP_ID && import.meta.env.VITE_ALGOLIA_SEARCH_KEY
    ? algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_SEARCH_KEY)
    : (fallbackClient as any)

const Hit = ({ hit }: { hit: any }) => {
  const navigate = useNavigate()
  // Transform algolia hit to Property
  const property: Property = {
    ...hit,
    id: hit.objectID,
  }

  return (
    <div className="w-full">
      <PropertyCard
        property={property}
        onViewDetails={(id) => navigate(`/property/${id}`)}
        isSaved={false}
        onToggleSaved={() => {}}
      />
    </div>
  )
}

interface UserLocation {
  lat: number
  lng: number
}

export default function SearchView() {
  const hasKeys = !!(import.meta.env.VITE_ALGOLIA_APP_ID && import.meta.env.VITE_ALGOLIA_SEARCH_KEY)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const handleGetLocation = async () => {
    setIsLocating(true)
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            setIsLocating(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setIsLocating(false)
          },
        )
      } else {
        console.error('Geolocation is not supported by this browser')
        setIsLocating(false)
      }
    } catch (error: unknown) {
      console.error('Error getting location:', error)
      setIsLocating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
          Advanced Search
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto">
          Find your perfect property instantly using AI-powered search, typo tolerance, and faceted
          filtering.
        </p>
      </div>

      {!hasKeys && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-sm flex items-center gap-3">
          <Search className="w-5 h-5 shrink-0" />
          <p>
            Algolia Search keys are missing. Please add <strong>VITE_ALGOLIA_APP_ID</strong> and{' '}
            <strong>VITE_ALGOLIA_SEARCH_KEY</strong> to your environment variables to enable
            advanced search functionality.
          </p>
        </div>
      )}

      <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/50 shadow-sm">
        <InstantSearch searchClient={searchClient} indexName="properties">
          {/* Configure geo-search defaults if necessary, or other settings */}
          <Configure
            hitsPerPage={12}
            clickAnalytics={true}
            aroundLatLng={userLocation ? `${userLocation.lat},${userLocation.lng}` : undefined}
            aroundRadius={userLocation ? 5000 : undefined}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar for Facets */}

            <div className="w-full lg:w-1/4 shrink-0 space-y-8">
              <div className="mb-4">
                <button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-bold transition-colors ${
                    userLocation
                      ? 'bg-gold-accent text-[var(--on-gold)] border-gold-accent'
                      : 'border-outline-variant text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  {userLocation ? 'Using Your Location (5km)' : 'Search Near Me (5km)'}
                </button>
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  City
                </h2>
                <RefinementList
                  attribute="city"
                  classNames={{
                    list: 'space-y-2',
                    label:
                      'flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface',
                    checkbox:
                      'rounded border-outline-variant text-gold-accent focus:ring-gold-accent',
                    count: 'bg-surface text-xs px-2 py-0.5 rounded-full ml-auto',
                  }}
                />
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  Property Type
                </h2>
                <RefinementList
                  attribute="type"
                  classNames={{
                    list: 'space-y-2',
                    label:
                      'flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface',
                    checkbox:
                      'rounded border-outline-variant text-gold-accent focus:ring-gold-accent',
                    count: 'bg-surface text-xs px-2 py-0.5 rounded-full ml-auto',
                  }}
                />
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  BHK
                </h2>
                <RefinementList
                  attribute="bhk"
                  classNames={{
                    list: 'space-y-2',
                    label:
                      'flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface',
                    checkbox:
                      'rounded border-outline-variant text-gold-accent focus:ring-gold-accent',
                    count: 'bg-surface text-xs px-2 py-0.5 rounded-full ml-auto',
                  }}
                />
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  Amenities
                </h2>
                <RefinementList
                  attribute="amenities"
                  searchable={true}
                  classNames={{
                    list: 'space-y-2 mt-4',
                    label:
                      'flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface',
                    checkbox:
                      'rounded border-outline-variant text-gold-accent focus:ring-gold-accent',
                    count: 'bg-surface text-xs px-2 py-0.5 rounded-full ml-auto',
                  }}
                />
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  Price Range (₹)
                </h2>
                <RangeInput
                  attribute="price"
                  classNames={{
                    form: 'flex items-center gap-2',
                    input:
                      'w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-gold-accent focus:ring-1 focus:ring-gold-accent outline-none',
                    separator: 'text-on-surface-variant',
                    submit:
                      'bg-gold-accent text-[var(--on-gold)] px-3 py-2 rounded-lg text-sm font-bold hover:bg-gold-hover transition-colors',
                  }}
                />
              </div>

              <div>
                <h2 className="font-bold text-on-surface mb-4 tracking-wide uppercase text-sm">
                  Possession Status
                </h2>
                <RefinementList
                  attribute="possession"
                  classNames={{
                    list: 'space-y-2',
                    label:
                      'flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface',
                    checkbox:
                      'rounded border-outline-variant text-gold-accent focus:ring-gold-accent',
                    count: 'bg-surface text-xs px-2 py-0.5 rounded-full ml-auto',
                  }}
                />
              </div>
            </div>

            {/* Main Search Area */}
            <div className="flex-1">
              <div className="mb-6">
                <div className="relative">
                  <SearchBox
                    placeholder="Search by location, builder, or property name..."
                    classNames={{
                      form: 'relative',
                      input:
                        'w-full bg-surface border border-outline-variant/50 rounded-2xl pl-12 pr-4 py-4 text-on-surface focus:border-gold-accent focus:ring-1 focus:ring-gold-accent outline-none shadow-sm',
                      submitIcon: 'hidden',
                      resetIcon: 'hidden',
                    }}
                  />
                  <MapPin className="absolute top-4 left-4 w-6 h-6 text-on-surface-variant/50 pointer-events-none" />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
                  <Stats />
                  <span className="flex items-center gap-1 text-xs">
                    Powered by <span className="font-bold text-[#003dff]">Algolia</span>
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <Hits
                  hitComponent={Hit}
                  classNames={{
                    list: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
                    item: 'flex',
                  }}
                />
              </div>

              <div className="flex justify-center">
                <Pagination
                  classNames={{
                    list: 'flex items-center gap-2',
                    item: 'w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors cursor-pointer',
                    selectedItem: 'bg-gold-accent text-[var(--on-gold)] hover:bg-gold-hover hover:text-[var(--on-gold)]',
                    disabledItem: 'text-on-surface-variant cursor-not-allowed',
                  }}
                />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  )
}
