import React from 'react'
import { Car, Zap, Droplet, Trees, Dumbbell, Key, Check } from 'lucide-react'

interface DetailAmenitiesProps {
  amenities: string[]
}

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('parking')) return <Car className="h-5 w-5 text-gold-accent" />
  if (n.includes('power') || n.includes('backup'))
    return <Zap className="h-5 w-5 text-gold-accent" />
  if (n.includes('water') || n.includes('supply'))
    return <Droplet className="h-5 w-5 text-gold-accent" />
  if (n.includes('garden') || n.includes('park'))
    return <Trees className="h-5 w-5 text-gold-accent" />
  if (n.includes('gym') || n.includes('fitness'))
    return <Dumbbell className="h-5 w-5 text-gold-accent" />
  if (n.includes('security') || n.includes('gate'))
    return <Key className="h-5 w-5 text-gold-accent" />
  // default
  return <Check className="h-5 w-5 text-gold-accent" />
}

export function DetailAmenities({ amenities }: DetailAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-5">
      <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5">
        Approved Amenities
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {amenities.map((am) => (
          <div
            key={am}
            className="p-4 bg-slate-850/60 border border-outline-variant/50 rounded-xl flex items-center gap-3"
          >
            <div className="h-9 w-9 bg-gold-accent/10 rounded-lg flex items-center justify-center shrink-0">
              {getAmenityIcon(am)}
            </div>
            <span className="text-on-surface text-sm font-medium">{am}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
