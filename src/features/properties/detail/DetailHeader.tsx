import React from 'react'
import { MapPin, Share2, Heart, Info } from 'lucide-react'
import { Property } from '@/shared/types/types'
import { formatPrice } from '@/shared/utils/format'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface DetailHeaderProps {
  property: Property
  isSaved: boolean
  onToggleSaved: (id: string) => void
  onShare: () => void
}

export function DetailHeader({ property, isSaved, onToggleSaved, onShare }: DetailHeaderProps) {
  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-4">
      <Tooltip
        id="detail-tooltip"
        className="z-50"
        style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span
          data-tooltip-id="detail-tooltip"
          data-tooltip-content="Property Classification Type"
          className="inline-block px-3 py-1 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-xs font-bold text-gold-accent self-start py-1.5 cursor-help"
        >
          📁 {property.type} Details
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onShare}
            data-tooltip-id="detail-tooltip"
            data-tooltip-content="Copy link to clipboard"
            className="h-9 w-9 bg-surface-container-high hover:bg-outline-variant text-on-surface-variant rounded-full flex items-center justify-center transition-all border border-outline-variant/50"
            aria-label={`Share ${property.title}`}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleSaved(property.id)}
            data-tooltip-id="detail-tooltip"
            data-tooltip-content={isSaved ? 'Remove from saved' : 'Save this property'}
            className="h-9 w-9 bg-surface-container-high hover:bg-outline-variant text-on-surface-variant rounded-full flex items-center justify-center transition-all border border-outline-variant/50"
            aria-label={
              isSaved
                ? `Remove ${property.title} from favorites`
                : `Save ${property.title} to favorites`
            }
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500 border-none' : ''}`}
            />
          </button>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold text-on-surface tracking-tight leading-tight">
        {property.title}
      </h1>
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-outline-variant/50">
        <div>
          <div
            className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-help"
            data-tooltip-id="detail-tooltip"
            data-tooltip-content="Base price, excludes taxes and registration fees"
          >
            Property Price
            <Info className="h-3 w-3" />
          </div>
          <div className="text-3xl font-black text-gold-accent mt-0.5 tracking-tight">
            {typeof property.price === 'number'
              ? formatPrice(property.price)
              : String(property.price)}
          </div>
        </div>
        <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
        <div>
          <div
            className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-help"
            data-tooltip-id="detail-tooltip"
            data-tooltip-content="Verified location index based on municipal records"
          >
            Locality Index
            <Info className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant text-sm mt-1.5 font-medium">
            <MapPin className="h-4 w-4 text-gold-accent" />
            {property.location}, {property.city}
          </div>
        </div>
      </div>
    </div>
  )
}
