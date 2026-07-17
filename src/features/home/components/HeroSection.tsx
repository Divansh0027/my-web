import React from 'react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useConfig } from '@/shared/context/ConfigContext'

import { trackUserEvent } from '@/analytics'
import { useTranslation, Trans } from 'react-i18next'
import {
  Search,
  Compass,
  Phone,
  MapPin,
  Building2,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  Map,
  Activity,
} from 'lucide-react'

export function HeroSection({
  navigate,
  searchQuery,
  setSearchQuery,
  searchLocation,
  setSearchLocation,
  searchType,
  setSearchType,
  searchBudget,
  setSearchBudget,
  searchBhk,
  setSearchBhk,
  handleSearchSubmit,
  activeTab,
  setActiveTab,
}: {
  navigate?: any
  searchQuery?: string
  setSearchQuery?: any
  searchLocation?: string
  setSearchLocation?: any
  searchType?: string
  setSearchType?: any
  searchBudget?: number
  setSearchBudget?: any
  searchBhk?: string
  setSearchBhk?: any
  handleSearchSubmit?: any
  activeTab?: any
  setActiveTab?: any
}) {
  const BUSINESS_CONFIG = useConfig()
  const { t } = useTranslation()

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center justify-center pt-[96px] lg:pt-[112px] pb-20 px-4 bg-surface overflow-hidden">
        {/* Subtle Luxury Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
            fetchPriority="high"
            alt="Decorative image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Abstract Background Accents */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay"
          aria-hidden="true"
          role="presentation"
        >
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-gold-accent/40 to-transparent blur-3xl"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl"></div>
        </div>

        {/* Dynamic Micro-particles Simulation in CSS */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          aria-hidden="true"
          role="presentation"
        >
          <div className="absolute top-[30%] left-[15%] w-1.5 h-1.5 bg-gold-accent/40 rounded-full animate-ping duration-2000"></div>
          <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-gold-accent/20 rounded-full animate-ping duration-3000"></div>
          <div className="absolute top-[80%] left-[25%] w-1 h-1 bg-gold-accent/30 rounded-full animate-ping duration-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gold-accent/10 border border-gold-accent/30 px-4 py-2 rounded-full mb-6 select-none"
          >
            <Compass className="h-4 w-4 text-gold-accent animate-spin-[20s]" />
            <span className="text-xs sm:text-sm text-gold-accent font-semibold uppercase tracking-wider">
              Smart Property Deals. Trusted Guidance.
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight text-on-surface max-w-4xl leading-[1.12]"
          >
            <Trans i18nKey="hero.title">
              Find Your Perfect Property in <span className="text-gold-accent">Delhi NCR</span>
            </Trans>
          </motion.h1>

          {/* Subheadline Details */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-on-surface font-medium max-w-2xl mt-8 leading-loose drop-shadow-md bg-surface/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-outline-variant/30 text-center sm:text-left"
          >
            <Trans i18nKey="hero.subtitle">
              Trusted by <span className="font-bold text-on-surface">500+ Families</span> | 100%
              RERA Registered | Over a decade of verified consultancy in Gurugram, Delhi, Noida &
              Faridabad.
            </Trans>
          </motion.p>

          {/* Core Action Callouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate('/properties')}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gold-accent text-[var(--on-gold)] font-bold text-sm shadow-md shadow-gold-accent/15 hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all"
            >
              Explore Properties
            </button>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.consultation)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackUserEvent('whatsapp_click', { source: 'hero_section' })}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface hover:bg-success-green/5 border border-success-green text-success-green font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <button
              id="hero-consultation-btn"
              onClick={() => {
                const sec = document.getElementById('contact_sec')
                if (sec) sec.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface border-2 border-on-surface/20 hover:border-on-surface hover:bg-surface-container hover:text-on-surface text-on-surface-variant font-bold text-sm transition-all shadow-md"
            >
              Book Free Consultation
            </button>
          </motion.div>

          {/* Search Bar Panel */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-5xl mt-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant p-4 md:p-5 rounded-[24px] md:rounded-[28px] shadow-sm flex flex-col md:flex-row items-center gap-4 text-left"
          >
            {/* Search Query Input */}
            <div className="w-full md:w-[25%] px-3">
              <label
                htmlFor="home-search-input"
                className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
              >
                Search keyword
              </label>
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  id="home-search-input"
                  type="text"
                  placeholder="e.g. Dwarka Flat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium placeholder-on-surface-variant pl-6 h-8"
                />
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Location Select */}
            <div className="w-full md:flex-1 px-3">
              <label
                htmlFor="auto-homeview-201"
                className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
              >
                Locality
              </label>
              <select
                id="auto-homeview-201"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-surface text-on-surface-variant">
                  All Delhi NCR
                </option>
                <option value="Dwarka" className="bg-surface text-on-surface-variant">
                  Dwarka
                </option>
                <option value="Gurugram" className="bg-surface text-on-surface-variant">
                  Gurugram
                </option>
                <option value="Noida" className="bg-surface text-on-surface-variant">
                  Noida
                </option>
                <option value="Greater Noida West" className="bg-surface text-on-surface-variant">
                  Greater Noida West
                </option>
                <option value="Rohini" className="bg-surface text-on-surface-variant">
                  Rohini
                </option>
                <option value="Pitampura" className="bg-surface text-on-surface-variant">
                  Pitampura
                </option>
                <option value="Aerocity" className="bg-surface text-on-surface-variant">
                  Aerocity
                </option>
                <option value="Faridabad" className="bg-surface text-on-surface-variant">
                  Faridabad
                </option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Property Type Select */}
            <div className="w-full md:w-[18%] px-3">
              <label
                htmlFor="auto-homeview-224"
                className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
              >
                Type
              </label>
              <select
                id="auto-homeview-224"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-surface text-on-surface-variant">
                  All Types
                </option>
                <option value="Flat" className="bg-surface text-on-surface-variant">
                  Flat/Apartment
                </option>
                <option value="Villa" className="bg-surface text-on-surface-variant">
                  Luxury Villa
                </option>
                <option value="Plot" className="bg-surface text-on-surface-variant">
                  Plot / Land
                </option>
                <option value="Builder Floor" className="bg-surface text-on-surface-variant">
                  Builder Floor
                </option>
                <option value="Commercial" className="bg-surface text-on-surface-variant">
                  Commercial Shop
                </option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Budget Max Select */}
            <div className="w-full md:w-[22%] px-3">
              <label
                htmlFor="auto-homeview-244"
                className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
              >
                Max Budget
              </label>
              <select
                id="auto-homeview-244"
                value={searchBudget}
                onChange={(e) => setSearchBudget(Number(e.target.value))}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="3000000" className="bg-surface text-on-surface-variant">
                  ₹30 Lakhs
                </option>
                <option value="6000000" className="bg-surface text-on-surface-variant">
                  ₹60 Lakhs
                </option>
                <option value="9000000" className="bg-surface text-on-surface-variant">
                  ₹90 Lakhs
                </option>
                <option value="15000000" className="bg-surface text-on-surface-variant">
                  ₹1.5 Crore
                </option>
                <option value="30000000" className="bg-surface text-on-surface-variant">
                  ₹3 Crore
                </option>
                <option value="100000000" className="bg-surface text-on-surface-variant">
                  ₹10 Crore+
                </option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* BHK Select */}
            <div className="w-full md:w-[12%] px-3">
              <label
                htmlFor="auto-homeview-264"
                className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
              >
                BHK
              </label>
              <select
                id="auto-homeview-264"
                value={searchBhk}
                onChange={(e) => setSearchBhk(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="All" className="bg-surface text-on-surface-variant">
                  All
                </option>
                <option value="1" className="bg-surface text-on-surface-variant">
                  1 BHK
                </option>
                <option value="2" className="bg-surface text-on-surface-variant">
                  2 BHK
                </option>
                <option value="3" className="bg-surface text-on-surface-variant">
                  3 BHK
                </option>
                <option value="4" className="bg-surface text-on-surface-variant">
                  4+ BHK
                </option>
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto h-12 md:h-12 px-6 rounded-full bg-gold-accent hover:bg-gold-hover hover:scale-105 text-[var(--on-gold)] font-bold flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-all"
            >
              <Search className="h-5 w-5" />
              <span className="md:hidden lg:inline text-base">Find Home</span>
            </button>
          </motion.form>

          {/* Floating Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-14 bg-surface-container/40 border border-outline-variant/50 py-6 px-10 rounded-[24px]"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">500+</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">
                Properties Sold
              </div>
            </div>
            <div className="text-center border-l md:border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">1000+</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">
                Happy Clients
              </div>
            </div>
            <div className="text-center border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">10+ Yrs</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">
                Market Expert
              </div>
            </div>
            <div className="text-center border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">100%</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">
                Verified Listings
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
