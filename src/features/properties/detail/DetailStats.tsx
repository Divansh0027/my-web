import React from 'react'
import { Property } from '@/shared/types/types'

interface DetailStatsProps {
  property: Property
}

export function DetailStats({ property }: DetailStatsProps) {
  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl">
      <h3 className="text-on-surface font-extrabold text-lg mb-6 border-b border-outline-variant/50 pb-3.5">
        Technical Specifications
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div>
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Configuration
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1">{property.bhk} BHK</div>
        </div>
        <div className="border-l border-outline-variant/50 pl-6">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Super Area
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1">
            {property.area} {property.areaUnit}
          </div>
        </div>
        <div className="border-l border-outline-variant/50 pl-6">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Floor Level
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1">{property.floor}</div>
        </div>
        <div className="border-l border-outline-variant/50 pl-6">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Facing Aspect
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1">
            {property.facing || 'N/A'}
          </div>
        </div>
        <div className="border-l border-outline-variant/50 pl-6">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Property Age
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1">
            {property.ageOfProperty || 'Under 1 Yr'}
          </div>
        </div>
        <div className="border-l border-outline-variant/50 pl-6">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Interior State
          </div>
          <div className="text-on-surface font-extrabold text-sm mt-1 select-all">
            {property.furnishing || 'Unspecified'}
          </div>
        </div>
      </div>
    </div>
  )
}
