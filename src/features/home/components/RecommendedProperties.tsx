import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Property } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { formatPrice } from '@/shared/utils/format'
import { MapPin, Sparkles } from 'lucide-react'

interface RecommendedPropertiesProps {
  properties: Property[]
}

export function RecommendedProperties({ properties }: RecommendedPropertiesProps) {
  const navigate = useNavigate()

  if (properties.length === 0) return null

  return (
    <section className="py-24 px-4 bg-surface-container-low border-t border-outline-variant/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Sparkles className="h-5 w-5 text-gold-accent" />
          <h2 className="text-2xl font-bold text-on-surface">Recommended for You</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="bg-surface border border-outline-variant/50 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-gold-accent/35 transition-all group text-left w-full"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <OptimizedImage
                  width={400}
                  height={300}
                  src={prop.images[0] || '/placeholder-property.jpg'}
                  alt={`${prop.title} — ${prop.location}`}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-2">
                <span className="text-base font-black text-gold-accent">
                  {typeof prop.price === 'number' ? formatPrice(prop.price) : String(prop.price)}
                </span>
                <h4 className="text-on-surface text-sm font-semibold truncate group-hover:text-gold-accent transition-colors">
                  {prop.title}
                </h4>
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
