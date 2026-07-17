import React, { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Property } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { formatPrice } from '@/shared/utils/format'

interface DetailSimilarPropertiesProps {
  property: Property
  allProperties: Property[]
}

export function DetailSimilarProperties({ property, allProperties }: DetailSimilarPropertiesProps) {
  const navigate = useNavigate()

  const similarProperties = useMemo(() => {
    if (!property) return []
    return allProperties
      .filter((p) => {
        if (p.id === property.id) return false

        let score = 0
        if (p.city === property.city) score += 2
        if (p.type === property.type) score += 2
        if (p.category === property.category) score += 1

        // Similar price (within 30%)
        if (typeof p.price === 'number' && typeof property.price === 'number') {
          const ratio = p.price / property.price
          if (ratio > 0.7 && ratio < 1.3) score += 3
        }

        return score >= 3
      })
       
      .sort(() => 0.5 - Math.random()) // Shuffle a bit
      .slice(0, 3)
  }, [allProperties, property])

  return (
    <>
      {similarProperties.length > 0 && (
        <div className="mt-20 border-t border-outline-variant/50 pt-16">
          <h3 className="text-on-surface font-extrabold text-xl mb-8">
            Similar Properties inside Delhi NCR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((prop) => (
              <button
                key={prop.id}
                onClick={() => navigate(`/property/${prop.id}`)}
                className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-gold-accent/35 transition-all group text-left w-full focus:outline-none focus:ring-2 focus:ring-gold-accent/50"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <OptimizedImage
                    width={800}
                    height={600}
                    src={prop.images[0] || '/placeholder-property.jpg'}
                    alt=""
                    loading="lazy"
                    className="h-full w-full group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute bottom-3 left-3 bg-surface/80 text-emerald-400 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                    ✓ Verified
                  </span>
                  <span className="absolute top-3 right-3 bg-surface/80 text-gold-accent text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                    {prop.type}
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  <span className="text-lg font-black text-gold-accent">
                    {typeof prop.price === 'number' ? formatPrice(prop.price) : String(prop.price)}
                  </span>
                  <h3 className="text-on-surface text-sm font-semibold truncate group-hover:text-gold-accent transition-colors">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                    <MapPin className="h-3.5 w-3.5 text-gold-accent" />
                    <span className="truncate">{prop.location}</span>
                  </div>
                  <div className="flex items-center gap-3 border-t border-outline-variant/50 pt-3 mt-3 text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                    {prop.bhk && <span>{prop.bhk} BHK</span>}
                    <span>
                      {prop.area} {prop.areaUnit}
                    </span>
                    <span className="text-gold-accent">{prop.availabilityStatus}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
