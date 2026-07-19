import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Property } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { formatPrice } from '@/shared/utils/format'
import { MapPin, Flame } from 'lucide-react'

interface TrendingPropertiesProps {
  properties: Property[]
}

export function TrendingProperties({ properties }: TrendingPropertiesProps) {
  const navigate = useNavigate()

  if (properties.length === 0) return null

  return (
    <section className="py-24 px-4 bg-surface border-t border-outline-variant/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Flame className="h-5 w-5 text-red-700 dark:text-red-500" />
          <h2 className="text-2xl font-bold text-on-surface">Trending Properties</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-gold-accent/35 transition-all group text-left w-full"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <OptimizedImage
                  width={400}
                  height={300}
                  src={prop.images[0] || '/placeholder-property.jpg'}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow">
                  <Flame size={10} /> Hot
                </span>
              </div>
              <div className="p-4 space-y-2">
                <span className="text-base font-black text-gold-accent">
                  {typeof prop.price === 'number' ? formatPrice(prop.price) : String(prop.price)}
                </span>
                <h3 className="text-on-surface text-sm font-semibold truncate group-hover:text-gold-accent transition-colors">
                  {prop.title}
                </h3>
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                  <MapPin className="h-3.5 w-3.5 text-gold-accent" />
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
