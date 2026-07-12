import React from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MapPin, BedDouble, Maximize, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { trackUserEvent } from '@/analytics'
import { useConfig } from '@/shared/context/ConfigContext'
import PropertyCardSkeleton from '@/features/properties/PropertyCardSkeleton'
import { formatPrice } from '@/shared/utils/format'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { Property } from '@/shared/types/types'
const Icon = ({ icon: IconCmp, className }: { icon: any; className?: string }) => (
  <IconCmp className={className} />
)

export function FeaturedProperties({
  filteredProperties,
  savedProperties,
  isLoading,
  onToggleSaved,
  activeTab,
  handleTabChange,
}: {
  filteredProperties?: any[]
  savedProperties?: string[]
  isLoading?: boolean
  onToggleSaved?: any
  activeTab?: string
  handleTabChange?: any
}) {
  const navigate = useNavigate()
  const BUSINESS_CONFIG = useConfig()
  return (
    <>
      {/* SECTION 2: FEATURED PROPERTIES */}
      <section className="py-32 px-4 bg-surface-container-low relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <div>
              <span className="text-gold-accent font-semibold text-xs uppercase tracking-wide">
                Elite Collection
              </span>
              <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">
                Featured Properties
              </h2>
              <p className="text-on-surface-variant text-base mt-6 max-w-xl leading-loose">
                Handpicked, premium residential, commercial, and land plots verified for reliable
                transaction closures.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 bg-surface-container p-1.5 rounded-xl border border-outline-variant/50 select-none text-xs">
              {(['All', 'Buy', 'Rent', 'Commercial', 'Plots'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    String(activeTab) === String(tab)
                      ? 'bg-gold-accent text-[var(--on-gold)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface-container border border-outline-variant/50 rounded-[24px] p-4 space-y-4 animate-pulse"
                >
                  <div className="bg-surface-container-high h-64 w-full rounded-xl"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                  <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                  <div className="flex gap-4">
                    <div className="h-8 bg-surface-container-high rounded w-1/3"></div>
                    <div className="h-8 bg-surface-container-high rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((prop) => {
                const isSaved = savedProperties.includes(prop.id)
                return (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-surface-container border border-outline-variant/50 rounded-3xl overflow-hidden shadow-sm group flex flex-col justify-between"
                  >
                    {/* Image, Status Header */}
                    <div className="relative h-64 w-full overflow-hidden shrink-0">
                      <OptimizedImage
                        src={Array.isArray(prop.images) ? prop.images[0] : prop.images}
                        alt={`${prop.title} — ${prop.location}`}
                        className="h-full w-full group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Badge */}
                      <div className="absolute top-4 left-4 flex gap-1.5">
                        {prop.featured && (
                          <span className="bg-gold-accent text-[var(--on-gold)] font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
                            Featured
                          </span>
                        )}
                        {prop.newLaunch && (
                          <span className="bg-emerald-500 text-on-surface font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
                            New Launch
                          </span>
                        )}
                      </div>

                      {/* Verified Badge */}
                      {prop.verified && (
                        <span className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-md border border-outline-variant text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                          ✓ RERA Verified
                        </span>
                      )}

                      {/* Save Button */}
                      <button
                        id={idx === 0 ? 'save-property-btn' : undefined}
                        onClick={() => onToggleSaved(prop.id)}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
                        className="absolute top-4 right-4 h-9 w-9 bg-surface/60 backdrop-blur-md rounded-full flex items-center justify-center border border-outline-variant text-on-surface-variant hover:text-red-400 transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </button>

                      <div className="absolute top-4 right-16 bg-surface/70 text-gold-accent text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                        {prop.type}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Price Grid */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gold-accent tracking-tight">
                            {typeof prop.price === 'number'
                              ? typeof prop.price === 'number'
                                ? formatPrice(prop.price)
                                : String(prop.price)
                              : String(prop.price)}
                          </span>
                          <span className="text-xs text-on-surface-variant uppercase tracking-widest">
                            {prop.postedBy} Listing
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-on-surface text-lg font-semibold mt-2.5 tracking-tight group-hover:text-gold-accent transition-colors leading-snug line-clamp-1">
                          {prop.title}
                        </h3>

                        {/* Locality */}
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-2.5">
                          <MapPin className="h-4 w-4 text-gold-accent shrink-0" />
                          <span className="truncate">{prop.location}</span>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-2 border-t border-b border-outline-variant/50 py-4 my-4.5 text-xs text-on-surface-variant">
                          {prop.bhk && (
                            <div className="flex items-center gap-1.5 justify-center">
                              <BedDouble className="h-4 w-4 text-on-surface-variant shrink-0" />
                              <span>{prop.bhk} BHK</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 justify-center col-span-2">
                            <Maximize className="h-4 w-4 text-on-surface-variant shrink-0" />
                            <span>
                              {prop.area} {prop.areaUnit}
                            </span>
                          </div>
                        </div>

                        {/* Key Amenities */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {Array.isArray(prop.amenities) &&
                            prop.amenities.slice(0, 4).map((am: any) => (
                              <span
                                key={am}
                                className="text-[10px] bg-surface-container-high text-on-surface-variant font-medium px-2 py-1 rounded"
                              >
                                {am}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-auto">
                        <button
                          onClick={() => navigate(`/property/${prop.id}`)}
                          className="flex-1 py-3 text-center rounded-xl bg-surface-container-high hover:bg-outline-variant text-on-surface font-bold text-xs border border-outline-variant/50 transition-all"
                        >
                          View Details
                        </button>

                        <a
                          href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(String(BUSINESS_CONFIG.whatsappMessages?.propertyEnquiry?.(prop.title) || ''))}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Enquire about ${prop.title} on WhatsApp`}
                          onClick={() =>
                            trackUserEvent('whatsapp_click', {
                              source: 'property_card',
                              property_id: prop.id,
                            })
                          }
                          className="h-11 w-11 shrink-0 rounded-xl bg-success-green/20 hover:bg-success-green/30 text-success-green border border-success-green/30 flex items-center justify-center transition-all"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* View All Properties Bottom CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-surface-container-high border border-outline-variant hover:border-outline rounded-full font-bold text-on-surface text-xs transition-all group hover:bg-gold-accent hover:text-[var(--on-gold)]"
            >
              View All Premium Listings
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
