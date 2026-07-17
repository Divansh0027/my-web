import { SEO } from '@/shared/components/SEO';
import { WhyChooseUs } from '@/features/home/components/WhyChooseUs';
import { ContactCTA } from '@/features/home/components/ContactCTA';
import { formatPrice } from '@/shared/utils/format'
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom'
import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import { Helmet } from 'react-helmet-async'
import {
  Building,
  MapPin,
  BedDouble,
  Maximize,
  Layers,
  CheckCircle,
  Phone,
  ArrowRight,
  Compass,
  Award,
  ShieldCheck,
  Briefcase,
  Sliders,
  Star,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react'
import { Property } from '@/shared/types/types'
import { SERVICES, TESTIMONIALS, COVERED_AREAS } from '@/shared/data/sampleData'
import { useConfig } from '@/shared/context/ConfigContext'
import { trackUserEvent } from '@/analytics'

interface HomeViewProps {
  properties: Property[]
  isLoading?: boolean
  onSearch: (filters: {
    query?: string
    location: string
    type: string
    budgetMax: number
    bhk: string
  }) => void
  savedProperties: string[]
  onToggleSaved: (id: string) => void
}
import { HeroSection } from './components/HeroSection'
import { RecentlyViewedProperties } from './components/RecentlyViewedProperties'
import { RecommendedProperties } from './components/RecommendedProperties'
import { TrendingProperties } from './components/TrendingProperties'
import { useRecommendations } from '@/features/recommendations/useRecommendations'
import { FeaturedProperties } from './components/FeaturedProperties'


export default function HomeView({
  properties,
  isLoading,
  onSearch,
  savedProperties,
  onToggleSaved,
}: HomeViewProps) {
  const navigate = useNavigate()
  const BUSINESS_CONFIG = useConfig()

  // Search parameters state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchBudget, setSearchBudget] = useState(100000000) // Default Max ₹10Cr (100,000,000)
  const [searchBhk, setSearchBhk] = useState('All')

  // Tab filters for featured properties
  const [activeTab, setActiveTab] = useState<'All' | 'Buy' | 'Rent' | 'Commercial' | 'Plots'>('All')

  // Testimonials slider index
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const { recommendedProperties, trendingProperties } = useRecommendations(properties)

  // Handle hero search trigger
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // Track search event with analytics

      onSearch({
        query: searchQuery,
        location: searchLocation,
        type: searchType,
        budgetMax: searchBudget,
        bhk: searchBhk === 'All' ? '' : searchBhk,
      })
    },
    [onSearch, searchQuery, searchLocation, searchType, searchBudget, searchBhk],
  )

  const handleTabChange = useCallback((tab: 'All' | 'Buy' | 'Rent' | 'Commercial' | 'Plots') => {
    setActiveTab(tab)
  }, [])

  // Filter properties based on the active tab
  const filteredProperties = useMemo(() => {
    let filtered = properties
    if (activeTab !== 'All') {
      if (activeTab === 'Commercial') {
        filtered = properties.filter((p) => p.category === 'Commercial' || p.type === 'Commercial')
      } else if (activeTab === 'Plots') {
        filtered = properties.filter((p) => p.category === 'Plots' || p.type === 'Plot')
      } else {
        filtered = properties.filter((p) => p.category === activeTab)
      }
    }
    return filtered.slice(0, 6) // Max 6 featured
  }, [properties, activeTab])

  const handleLocalityClick = useCallback(
    (locality: string) => {
      onSearch({
        location: locality,
        type: '',
        budgetMax: 100000000, // No max
        bhk: '',
      })
    },
    [onSearch],
  )

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
  }, [])

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  return (
    <div className="font-sans text-on-surface overflow-x-hidden bg-surface -mt-[64px] lg:-mt-[72px]">
      <SEO
        title={`${BUSINESS_CONFIG.businessName} - Premium Real Estate in Noida`}
        description={`${BUSINESS_CONFIG.businessName} offers verified real estate listings in Ghaziabad, Noida, Delhi NCR. Buy, sell, or rent flats, villas, plots, and commercial spaces.`}
      />

      {/* SECTION 1: CINEMATIC HERO */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        searchType={searchType}
        setSearchType={setSearchType}
        searchBudget={searchBudget}
        setSearchBudget={setSearchBudget}
        searchBhk={searchBhk}
        setSearchBhk={setSearchBhk}
        handleSearchSubmit={handleSearchSubmit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <FeaturedProperties
        filteredProperties={filteredProperties as any}
        savedProperties={savedProperties}
        isLoading={isLoading}
        onToggleSaved={onToggleSaved}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />

      <TrendingProperties properties={trendingProperties} />
      <RecommendedProperties properties={recommendedProperties} />
      <RecentlyViewedProperties allProperties={properties} />

      {/* SECTION 3: SERVICES */}
      <section
        id="services_sec"
        className="py-32 px-4 bg-surface border-t border-b border-outline-variant/50 scroll-mt-[72px]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">
              Our Competencies
            </span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">
              Our Premium Services
            </h2>
            <p className="text-on-surface-variant text-base max-w-2xl mx-auto mt-6 leading-loose">
              We cover all dimensions of property acquisitions, investments, and documentation with
              100% legal backing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {SERVICES.map((serv) => (
              <div
                key={serv.id}
                className="p-8 bg-surface-container border border-outline-variant/50 rounded-[24px] transition-all duration-300 hover:border-gold-accent/50 hover:shadow-md hover:shadow-gold-accent/5 group"
              >
                <div className="h-12 w-12 bg-gold-accent/10 rounded-xl flex items-center justify-center text-gold-accent group-hover:bg-gold-accent group-hover:text-[var(--on-gold)] transition-all duration-300 mb-6">
                  {/* Assign standard beautiful icons dynamically */}
                  {(() => {
                    const ICON_MAP: Record<string, unknown> = {
                      Building,
                      Layers,
                      Compass,
                      MapPin,
                      Sliders,
                      Award,
                      ShieldCheck,
                    }
                    const IconKey = String((serv as { icon?: string }).icon || 'Building')
                    const Icon = (ICON_MAP as Record<string, any>)[IconKey] || Building
                    return <Icon className="h-5 w-5" />
                  })()}
                </div>

                <h3 className="text-on-surface text-md font-semibold tracking-tight group-hover:text-gold-accent transition-colors">
                  {serv.title}
                </h3>

                <p className="text-on-surface-variant text-xs leading-relaxed mt-3">
                  {serv.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY CHOOSE US */}
      <WhyChooseUs />

      {/* SECTION 5: CUSTOMER TESTIMONIAL CAROUSEL (Glassmorphic) */}
      <section className="py-32 px-4 bg-surface border-t border-outline-variant/50 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">
              Client Stories
            </span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">
              What Our Clients Say
            </h2>
          </div>

          {/* Testimonial Active Slider Box */}
          <div className="relative p-8 sm:p-12 bg-surface-container/60 backdrop-blur-xl border border-outline-variant rounded-3xl shadow-md overflow-hidden min-h-[300px] flex flex-col justify-between">
            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold-accent text-gold-accent" />
              ))}
            </div>

            {/* Testimonial Body Quote */}
            <p className="text-on-surface text-base sm:text-lg italic leading-relaxed font-sans font-light">
              "{TESTIMONIALS[activeTestimonial].reviewText}"
            </p>

            {/* Client Bio */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-outline-variant/50">
              <div>
                <h3 className="text-on-surface font-bold text-md tracking-tight">
                  {TESTIMONIALS[activeTestimonial].clientName}
                </h3>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Bought: {TESTIMONIALS[activeTestimonial].propertyType} |{' '}
                  {TESTIMONIALS[activeTestimonial].location}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevTestimonial}
                  className="h-10 w-10 bg-surface-container-high hover:bg-gold-accent hover:text-[var(--on-gold)] rounded-full flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeTestimonial === idx ? 'w-6 bg-gold-accent' : 'w-2 bg-outline-variant'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="h-10 w-10 bg-surface-container-high hover:bg-gold-accent hover:text-[var(--on-gold)] rounded-full flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: DELHI NCR COVERAGE */}
      <section className="py-32 px-4 bg-surface-container-low border-t border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">
            Micro-Markets Covered
          </span>
          <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1 mb-8">
            Delhi NCR Coverage
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto select-none">
            {COVERED_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => handleLocalityClick(area)}
                className="px-5 py-3 rounded-lg border border-outline-variant/50 bg-surface-container/60 text-on-surface-variant font-semibold text-xs hover:border-gold-accent hover:text-gold-accent hover:bg-surface-container shadow transition-all cursor-pointer"
              >
                {area} &nbsp; ➜
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA CONTACT BANNER */}
      <ContactCTA />
    </div>
  )
}