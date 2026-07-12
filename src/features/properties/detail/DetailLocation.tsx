import React from 'react'
import { MapPin } from 'lucide-react'
import { Property } from '@/shared/types/types'

interface DetailLocationProps {
  property: Property
}

export function DetailLocation({ property }: DetailLocationProps) {
  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-6">
      <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5 flex items-center justify-between">
        Location & Connectivity Index
        <span className="text-xs text-on-surface-variant font-semibold uppercase">
          {property.city}
        </span>
      </h3>

      {/* Map Embed */}
      <div className="relative h-64 w-full bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/50">
        <iframe
          title="Property Location"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(property.location + ', ' + property.city)}`}
          allowFullScreen
        ></iframe>
        {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
          <div className="absolute inset-0 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="h-12 w-12 bg-gold-accent/20 border border-gold-accent/40 text-gold-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6" />
            </div>
            <h4 className="text-on-surface font-bold text-sm tracking-tight">
              {property.location}
            </h4>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ', ' + property.city)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex py-2 px-4 rounded-lg bg-surface-container text-xs font-bold text-gold-accent border border-gold-accent/35 hover:bg-gold-accent hover:text-[var(--on-gold)] transition-all select-none"
            >
              Open with Google Maps ➜
            </a>
          </div>
        )}
      </div>

      {/* Nearby list (Metro, Mall, Hospital, etc) */}
      <div className="space-y-3">
        <h4 className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
          Nearby Landmark Benchmarks
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {property.landmarks && property.landmarks.length > 0 ? (
            property.landmarks.map((land, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-3.5 bg-slate-850/40 rounded-xl border border-outline-variant/50"
              >
                <span className="text-on-surface-variant font-medium truncate max-w-[200px]">
                  {land.name}
                </span>
                <span className="text-gold-accent font-semibold text-[10px] uppercase bg-gold-accent/10 px-2.5 py-0.5 rounded-md">
                  {land.type}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full border border-outline-variant/50 p-4 rounded-xl text-center">
              <span className="text-on-surface-variant text-xs font-semibold">
                Nearby amenities available on request
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
