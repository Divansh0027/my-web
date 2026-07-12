import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { BUSINESS_CONFIG } from '@/config'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  noindex?: boolean
  children?: React.ReactNode
}

export function SEO({
  title,
  description = BUSINESS_CONFIG.description ||
    'Premier Real Estate Consultant in Ghaziabad & Delhi NCR',
  image = 'https://shivsayaproperties.com/logo.png', // Fallback image
  url,
  type = 'website',
  noindex = false,
  children,
}: SEOProps) {
  const location = useLocation()
  const currentUrl = url || `https://shivsayaproperties.com${location.pathname}`

  const siteTitle = BUSINESS_CONFIG.businessName
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: BUSINESS_CONFIG.businessName,
    image: 'https://shivsayaproperties.com/logo.png',
    url: 'https://shivsayaproperties.com',
    telephone: BUSINESS_CONFIG.businessPhone,
    email: BUSINESS_CONFIG.businessEmail,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi NCR',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Organization Schema */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>

      {children}
    </Helmet>
  )
}
