import React, { useState } from 'react'
import { getOptimizedImageUrl } from '../utils/image'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 768px) 100vw, 50vw',
  loading = 'lazy',
  priority = false,
  ...props
}) => {
  const [error, setError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (error || !src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src="/placeholder-property.jpg"
          alt="Fallback property"
          className={`w-full h-full object-cover ${className}`}
        />
      </div>
    )
  }

  // Generate sources
  const avifSrcSet = [400, 800, 1200]
    .map((w) => `${getOptimizedImageUrl(src, { width: w, format: 'avif' })} ${w}w`)
    .join(', ')
  const webpSrcSet = [400, 800, 1200]
    .map((w) => `${getOptimizedImageUrl(src, { width: w, format: 'webp' })} ${w}w`)
    .join(', ')
  const defaultSrcSet = [400, 800, 1200]
    .map((w) => `${getOptimizedImageUrl(src, { width: w })} ${w}w`)
    .join(', ')

  const defaultSrc = getOptimizedImageUrl(src, { width: 800 })

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" style={{ zIndex: 1 }} />
      )}
      <picture>
        <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        <img
          src={defaultSrc}
          srcSet={defaultSrcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : loading}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
      </picture>
    </div>
  )
}
