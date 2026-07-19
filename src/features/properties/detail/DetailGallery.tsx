import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Property } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'

interface DetailGalleryProps {
  property: Property
}

export function DetailGallery({ property }: DetailGalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <>
      {/* Gallery Cluster */}
      <div className="space-y-3">
        {/* Main Display Frame */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsLightboxOpen(true)
              setIsZoomed(false)
            }
          }}
          onClick={() => {
            setIsLightboxOpen(true)
            setIsZoomed(false)
          }}
          className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer group border border-outline-variant/50 shadow-md"
        >
          <OptimizedImage
            src={property.images[activeImageIdx] || '/placeholder-property.jpg'}
            alt={`${property.title} — ${property.location}`}
            className="h-full w-full group-hover:scale-[1.01] transition-transform duration-500"
            priority={true}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <span className="bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold text-gold-accent border border-outline-variant">
              🔍 Click to Enlarge (Lightbox Gallery)
            </span>
          </div>
          <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md border border-outline-variant text-success-green text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg select-none">
            ✓ Pre-Verified Listing
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="flex gap-2 w-full overflow-x-auto pb-1 select-none whitespace-nowrap">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              aria-label={`View thumbnail ${idx + 1}`}
              className={`h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                activeImageIdx === idx
                  ? 'border-gold-accent'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <OptimizedImage
                width={800}
                height={600}
                src={img}
                alt={`Thumbnail ${idx}`}
                loading="lazy"
                className="h-full w-full"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PORTAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-xl"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-6 w-full absolute top-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="text-on-surface text-sm font-semibold pointer-events-auto">
                {activeImageIdx + 1} / {property.images.length}
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="text-on-surface hover:text-gold-accent bg-surface-variant/50 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer pointer-events-auto"
              >
                Close (ESC)
              </button>
            </div>

            {/* Lightbox Main Stage */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setIsZoomed(!isZoomed)
              }}
              className="flex-1 flex items-center justify-center p-4 cursor-zoom-in mt-16 mb-24"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <motion.img
                key={activeImageIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={`${property.images[activeImageIdx] || '/placeholder-property.jpg'}&w=2000&q=90`}
                alt="Lightbox View"
                className={`max-h-full max-w-full rounded-lg shadow-2xl object-contain transition-all ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                loading="lazy"
              />
            </div>

            {/* Lightbox Footer Navigation */}
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center pointer-events-none">
              <div className="flex gap-4 pointer-events-auto">
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))
                  }
                  className="bg-surface/10 hover:bg-surface/20 text-on-surface px-6 py-3 rounded-xl backdrop-blur-md border border-outline-variant/30 font-semibold cursor-pointer transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))
                  }
                  className="bg-surface/10 hover:bg-surface/20 text-on-surface px-6 py-3 rounded-xl backdrop-blur-md border border-outline-variant/30 font-semibold cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
