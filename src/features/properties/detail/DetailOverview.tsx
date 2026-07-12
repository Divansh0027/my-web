import React from 'react'

interface DetailOverviewProps {
  description: string
}

export function DetailOverview({ description }: DetailOverviewProps) {
  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-4">
      <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5">
        Property Overview
      </h3>
      <p className="text-on-surface-variant text-sm leading-relaxed font-sans font-light">
        {description}
      </p>
    </div>
  )
}
