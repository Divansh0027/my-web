import { SEO } from '@/shared/components/Seo'
import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { Property } from '@/shared/types/types'
import { trackUserEvent } from '@/analytics'
import { trackBehavior } from '@/features/recommendations/behaviorService'
import { useRecentlyViewed } from '@/features/recommendations/useRecentlyViewed'
import { useAuth } from '@/features/auth/useAuth'
import { DetailSkeleton } from './DetailSkeleton'
import {
  DetailGallery,
  DetailHeader,
  DetailStats,
  DetailOverview,
  DetailAmenities,
  DetailLocation,
  DetailEmiCalculator,
  DetailContactForm,
  DetailSimilarProperties,
  DetailAssuranceBadge,
} from '@/features/properties/detail'

interface DetailViewProps {
  property?: Property | null
  isLoadingData?: boolean
  allProperties: Property[]
  savedProperties: string[]
  onToggleSaved: (id: string) => void
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void
}

export default function DetailView({
  property,
  isLoadingData,
  allProperties,
  savedProperties,
  onToggleSaved,
  onShowNotification,
}: DetailViewProps) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { addRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (property?.id) {
      trackUserEvent('property_view', { property_id: property.id })
      trackBehavior(currentUser?.uid || null, 'view', { propertyId: property.id })
      addRecentlyViewed(property.id)
    }
  }, [property, currentUser?.uid, addRecentlyViewed])

  const handleShareClick = useCallback(() => {
    if (!property) return
    const url = window.location.href
    navigator.clipboard
      .writeText(url)
      .then(() => onShowNotification('Listing URL copied to clipboard.', 'success'))
      .catch(() => onShowNotification('Failed to copy URL.', 'error'))
  }, [property, onShowNotification])

  if (isLoadingData || !property) {
    return (
      <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
        <DetailSkeleton />
      </div>
    )
  }

  const isSaved = savedProperties.includes(property.id)

  return (
    <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
      <SEO
        title={property.title}
        description={`Buy ${property.title} in ${property.city}. ${property.description?.substring(0, 120)}...`}
        image={property.images?.[0]}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: property.description,
          image: property.images?.[0],
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'INR',
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://shivsayaproperties.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Properties',
              item: 'https://shivsayaproperties.com/properties',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: property.title,
            },
          ],
        })}
      </script>

      {/* BREADCRUMBS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-gold-accent text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties Catalog
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
            <button
              className="hover:text-on-surface-variant cursor-pointer focus:outline-none"
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <span>&gt;</span>
            <button
              className="hover:text-on-surface-variant cursor-pointer focus:outline-none"
              onClick={() => navigate('/properties')}
            >
              Properties
            </button>
            <span>&gt;</span>
            <span className="text-on-surface-variant truncate max-w-[200px]">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT MAIN COLUMN: GALLERY, SPECS, DETAIL, CALCULATOR ================= */}
          <div className="lg:col-span-8 space-y-8">
            <DetailGallery property={property} />
            <DetailHeader
              property={property}
              isSaved={isSaved}
              onToggleSaved={onToggleSaved}
              onShare={handleShareClick}
            />
            <DetailStats property={property} />
            <DetailOverview description={property.description || ''} />
            <DetailAmenities amenities={property.amenities || []} />
            <DetailLocation property={property} />
            <DetailEmiCalculator price={property.price} />
          </div>

          {/* ================= RIGHT RAIL: CONTACT & BOOKING ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <DetailContactForm property={property} onShowNotification={onShowNotification} />
            <DetailAssuranceBadge />
          </div>
        </div>

        {/* ================= SIMILAR PROPERTIES FEED AT BOTTOM ================= */}
        <DetailSimilarProperties property={property} allProperties={allProperties} />
      </div>
    </div>
  )
}
