import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Property } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { formatPrice } from '@/shared/utils/format'
import { MapPin, TrendingUp } from 'lucide-react'
import { useRecentlyViewed } from '@/features/recommendations/useRecentlyViewed'

interface RecentlyViewedPropertiesProps {
  allProperties: Property[]
}

export function RecentlyViewedProperties({ allProperties }: RecentlyViewedPropertiesProps) {
  const navigate = useNavigate()
  const { recentIds } = useRecentlyViewed()

  const properties = recentIds
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => p !== undefined)
    .slice(0, 4)

  if (properties.length === 0) return null

  return (
    <section className="py-24 px-4 bg-surface border-t border-outline-variant/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <TrendingUp className="h-5 w-5 text-gold-accent" />
          <h2 className="text-2xl font-bold text-on-surface">Recently Viewed</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-gold-accent/35 transition-all group text-left w-full"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <OptimizedImage
                  width={400}
                  height={300}
                  src={prop.images[0] || '/placeholder-property.jpg'}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-2">
                <span className="text-base font-black text-gold-accent">
                  {typeof prop.price === 'number' ? formatPrice(prop.price) : String(prop.price)}
                </span>
                <h3 className="text-on-surface text-xs font-semibold truncate group-hover:text-gold-accent transition-colors">
                  {prop.title}
                </h3>
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px]">
                  <MapPin className="h-3 w-3 text-gold-accent" />
                  <span className="truncate">{prop.location}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
