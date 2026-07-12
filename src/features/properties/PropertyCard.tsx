import React from 'react'
import { Property } from '@/shared/types/types'
import { Heart, MapPin, BedDouble, Maximize, Phone } from 'lucide-react'
import { formatPrice } from '@/shared/utils/format'
import { OptimizedImage } from '@/shared/components/OptimizedImage'

interface PropertyCardProps {
  property: Property
  onViewDetails: (id: string) => void
  isSaved: boolean
  onToggleSaved: (id: string) => void
}

export function PropertyCard({
  property,
  onViewDetails,
  isSaved,
  onToggleSaved,
}: PropertyCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden flex flex-col h-[400px] hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(property.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onViewDetails(property.id)
        }
      }}
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden bg-surface-container-high">
        {property.imageUrl && (
          <OptimizedImage
            src={property.imageUrl}
            alt={property.name || 'Property'}
            className="w-full h-full object-cover"
          />
        )}

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSaved(property.id)
          }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-on-surface text-lg line-clamp-2 mb-2">{property.name}</h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex-1" />

        {/* Bottom Section: Features and Price */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50">
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            {property.bhk && (
              <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4" />
                <span>{property.bhk}</span>
              </div>
            )}
            {property.size && (
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span>{property.size}</span>
              </div>
            )}
          </div>
          <div className="font-bold text-gold-accent text-sm">{formatPrice(property.price)}</div>
        </div>
      </div>
    </div>
  )
}
