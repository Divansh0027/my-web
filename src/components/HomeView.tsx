import { formatPrice } from "../utils/format";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import { trackEvent } from "../firebase";
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
  Heart
} from "lucide-react";
import { Property } from "../types";
import { SERVICES, TESTIMONIALS, COVERED_AREAS } from "../data/sampleData";
import { useConfig } from "../context/ConfigContext";

interface HomeViewProps {
  properties: Property[];
  isLoading?: boolean;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  onSearch: (filters: { query?: string; location: string; type: string; budgetMax: number; bhk: string }) => void;
  savedProperties: string[];
  onToggleSaved: (id: string) => void;
}

export default function HomeView({ 
  properties, 
  isLoading,
  onNavigate, 
  onSearch, 
  savedProperties, 
  onToggleSaved 
}: HomeViewProps) {
  const BUSINESS_CONFIG = useConfig();
  
  // Search parameters state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchBudget, setSearchBudget] = useState(100000000); // Default Max ₹10Cr (100,000,000)
  const [searchBhk, setSearchBhk] = useState("All");

  // Tab filters for featured properties
  const [activeTab, setActiveTab] = useState<"All" | "Buy" | "Rent" | "Commercial" | "Plots">("All");

  // Testimonials slider index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Handle hero search trigger
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Track search event with analytics
    trackEvent("home_search", {
      query: searchQuery || "none",
      location: searchLocation || "none",
      type: searchType || "none",
      budget: searchBudget.toString(),
      bhk: searchBhk
    });

    onSearch({
      query: searchQuery,
      location: searchLocation,
      type: searchType,
      budgetMax: searchBudget,
      bhk: searchBhk === "All" ? "" : searchBhk
    });
  }, [onSearch, searchQuery, searchLocation, searchType, searchBudget, searchBhk]);

  const handleTabChange = useCallback((tab: "All" | "Buy" | "Rent" | "Commercial" | "Plots") => {
    setActiveTab(tab);
    trackEvent("home_filter_property_type", {
      type: tab
    });
  }, []);

  // Filter properties based on the active tab
  const filteredProperties = useMemo(() => {
    let filtered = properties;
    if (activeTab !== "All") {
      if (activeTab === "Commercial") {
        filtered = properties.filter(p => p.category === "Commercial" || p.type === "Commercial");
      } else if (activeTab === "Plots") {
        filtered = properties.filter(p => p.category === "Plots" || p.type === "Plot");
      } else {
        filtered = properties.filter(p => p.category === activeTab);
      }
    }
    return filtered.slice(0, 6); // Max 6 featured
  }, [properties, activeTab]);

  const handleLocalityClick = useCallback((locality: string) => {
    trackEvent("home_search", {
      query: "none",
      location: locality,
      type: "none",
      budget: "100000000",
      bhk: "All"
    });

    onSearch({
      location: locality,
      type: "",
      budgetMax: 100000000, // No max
      bhk: ""
    });
  }, [onSearch]);

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  return (
    <div className="font-sans text-on-surface overflow-x-hidden bg-surface pt-18">
      <Helmet>
        <title>Shiv Saya Properties - Real Estate Agents in Delhi NCR</title>
        <meta name="description" content="Shiv Saya Properties offers verified real estate listings in Ghaziabad, Noida, Delhi NCR. Buy, sell, or rent flats, villas, plots, and commercial spaces." />
      </Helmet>
      
      {/* SECTION 1: CINEMATIC HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 bg-surface overflow-hidden">
        
        {/* Subtle Luxury Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2850&q=80" 
            alt="Luxury Property Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Abstract Background Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay" aria-hidden="true" role="presentation">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-gold-accent/40 to-transparent blur-3xl"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl"></div>
        </div>

        {/* Dynamic Micro-particles Simulation in CSS */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true" role="presentation">
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
            Find Your Perfect Property in <span className="text-gold-accent">Delhi NCR</span>
          </motion.h1>

          {/* Subheadline Details */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-on-surface font-medium max-w-2xl mt-8 leading-loose drop-shadow-md bg-surface/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-outline-variant/30 text-center sm:text-left"
          >
            Trusted by <span className="font-bold text-on-surface">500+ Families</span> | 100% RERA Registered | Over a decade of verified consultancy in Gurugram, Delhi, Noida & Faridabad.
          </motion.p>

          {/* Core Action Callouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto"
          >
            <button
              onClick={() => onNavigate("properties")}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gold-accent text-[#0F172A] font-bold text-sm shadow-md shadow-gold-accent/15 hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all"
            >
              Explore Properties
            </button>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.consultation)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-surface hover:bg-success-green/5 border border-success-green text-success-green font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <button
              id="hero-consultation-btn"
              onClick={() => {
                const sec = document.getElementById("contact_sec");
                if (sec) sec.scrollIntoView({ behavior: "smooth" });
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
              <label htmlFor="home-search-input" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Search keyword</label>
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input 
                  id="home-search-input"
                  type="text"
                  placeholder="e.g. Dwarka Flat" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium placeholder-slate-600 pl-6 h-8"
                />
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Location Select */}
            <div className="w-full md:flex-1 px-3">
              <label htmlFor="auto-homeview-201" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Locality</label>
              <select id="auto-homeview-201"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-surface text-on-surface-variant">All Delhi NCR</option>
                <option value="Dwarka" className="bg-surface text-on-surface-variant">Dwarka</option>
                <option value="Gurugram" className="bg-surface text-on-surface-variant">Gurugram</option>
                <option value="Noida" className="bg-surface text-on-surface-variant">Noida</option>
                <option value="Greater Noida West" className="bg-surface text-on-surface-variant">Greater Noida West</option>
                <option value="Rohini" className="bg-surface text-on-surface-variant">Rohini</option>
                <option value="Pitampura" className="bg-surface text-on-surface-variant">Pitampura</option>
                <option value="Aerocity" className="bg-surface text-on-surface-variant">Aerocity</option>
                <option value="Faridabad" className="bg-surface text-on-surface-variant">Faridabad</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Property Type Select */}
            <div className="w-full md:w-[18%] px-3">
              <label htmlFor="auto-homeview-224" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Type</label>
              <select id="auto-homeview-224"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-surface text-on-surface-variant">All Types</option>
                <option value="Flat" className="bg-surface text-on-surface-variant">Flat/Apartment</option>
                <option value="Villa" className="bg-surface text-on-surface-variant">Luxury Villa</option>
                <option value="Plot" className="bg-surface text-on-surface-variant">Plot / Land</option>
                <option value="Builder Floor" className="bg-surface text-on-surface-variant">Builder Floor</option>
                <option value="Commercial" className="bg-surface text-on-surface-variant">Commercial Shop</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* Budget Max Select */}
            <div className="w-full md:w-[22%] px-3">
              <label htmlFor="auto-homeview-244" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Max Budget</label>
              <select id="auto-homeview-244"
                value={searchBudget}
                onChange={(e) => setSearchBudget(Number(e.target.value))}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="3000000" className="bg-surface text-on-surface-variant">₹30 Lakhs</option>
                <option value="6000000" className="bg-surface text-on-surface-variant">₹60 Lakhs</option>
                <option value="9000000" className="bg-surface text-on-surface-variant">₹90 Lakhs</option>
                <option value="15000000" className="bg-surface text-on-surface-variant">₹1.5 Crore</option>
                <option value="30000000" className="bg-surface text-on-surface-variant">₹3 Crore</option>
                <option value="100000000" className="bg-surface text-on-surface-variant">₹10 Crore+</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-outline-variant/50 self-center"></div>

            {/* BHK Select */}
            <div className="w-full md:w-[12%] px-3">
              <label htmlFor="auto-homeview-264" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">BHK</label>
              <select id="auto-homeview-264"
                value={searchBhk}
                onChange={(e) => setSearchBhk(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="All" className="bg-surface text-on-surface-variant">All</option>
                <option value="1" className="bg-surface text-on-surface-variant">1 BHK</option>
                <option value="2" className="bg-surface text-on-surface-variant">2 BHK</option>
                <option value="3" className="bg-surface text-on-surface-variant">3 BHK</option>
                <option value="4" className="bg-surface text-on-surface-variant">4+ BHK</option>
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto h-12 md:h-12 px-6 rounded-full bg-gold-accent hover:bg-gold-hover hover:scale-105 text-[#0F172A] font-bold flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-all"
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
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">Properties Sold</div>
            </div>
            <div className="text-center border-l md:border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">1000+</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">Happy Clients</div>
            </div>
            <div className="text-center border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">10+ Yrs</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">Market Expert</div>
            </div>
            <div className="text-center border-l border-outline-variant/50">
              <div className="text-2xl sm:text-3xl font-extrabold text-on-surface">100%</div>
              <div className="text-xs text-on-surface-variant mt-1 uppercase font-medium tracking-wider">Verified Listings</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 2: FEATURED PROPERTIES */}
      <section className="py-32 px-4 bg-surface-container-low relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <div>
              <span className="text-gold-accent font-semibold text-xs uppercase tracking-wide">Elite Collection</span>
              <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">Featured Properties</h2>
              <p className="text-on-surface-variant text-base mt-6 max-w-xl leading-loose">
                Handpicked, premium residential, commercial, and land plots verified for reliable transaction closures.
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 bg-surface-container p-1.5 rounded-xl border border-outline-variant/50 select-none text-xs">
              {(["All", "Buy", "Rent", "Commercial", "Plots"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-gold-accent text-[#0F172A]" 
                      : "text-on-surface-variant hover:text-on-surface"
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
                <div key={i} className="bg-surface-container border border-outline-variant/50 rounded-[24px] p-4 space-y-4 animate-pulse">
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
                const isSaved = savedProperties.includes(prop.id);
                return (
                  <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-surface-container border border-outline-variant/50 rounded-3xl overflow-hidden shadow-sm group flex flex-col justify-between"
                >
                  {/* Image, Status Header */}
                  <div className="relative h-64 w-full overflow-hidden shrink-0">
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      {prop.featured && (
                        <span className="bg-gold-accent text-[#0F172A] font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
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
                      onClick={() => onToggleSaved(prop.id)}
                      className="absolute top-4 right-4 h-9 w-9 bg-surface/60 backdrop-blur-md rounded-full flex items-center justify-center border border-outline-variant text-on-surface-variant hover:text-red-400 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
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
                        <span className="text-2xl font-bold text-gold-accent tracking-tight">{formatPrice(prop.price)}</span>
                        <span className="text-xs text-on-surface-variant uppercase tracking-widest">{prop.postedBy} Listing</span>
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
                            <BedDouble className="h-4 w-4 text-outline shrink-0" />
                            <span>{prop.bhk} BHK</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 justify-center col-span-2">
                          <Maximize className="h-4 w-4 text-outline shrink-0" />
                          <span>{prop.area} {prop.areaUnit}</span>
                        </div>
                      </div>

                      {/* Key Amenities */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {prop.amenities.slice(0, 4).map((am) => (
                          <span key={am} className="text-[10px] bg-surface-container-high text-on-surface-variant font-medium px-2 py-1 rounded">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-auto">
                      <button
                        onClick={() => onNavigate("properties", prop.id)}
                        className="flex-1 py-3 text-center rounded-xl bg-surface-container-high hover:bg-outline-variant text-on-surface font-bold text-xs border border-outline-variant/50 transition-all"
                      >
                        View Details
                      </button>
                      
                      <a
                        href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(prop.title))}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Enquire about ${prop.title} on WhatsApp`}
                        className="h-11 w-11 shrink-0 rounded-xl bg-success-green/20 hover:bg-success-green/30 text-success-green border border-success-green/30 flex items-center justify-center transition-all"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
          )}

          {/* View All Properties Bottom CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate("properties")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-surface-container-high border border-outline-variant hover:border-outline rounded-full font-bold text-on-surface text-xs transition-all group hover:bg-gold-accent hover:text-[#0F172A]"
            >
              View All Premium Listings
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section id="services_sec" className="py-32 px-4 bg-surface border-t border-b border-outline-variant/50 scroll-mt-[72px]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-20">
            <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">Our Competencies</span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">Our Premium Services</h2>
            <p className="text-on-surface-variant text-base max-w-2xl mx-auto mt-6 leading-loose">
              We cover all dimensions of property acquisitions, investments, and documentation with 100% legal backing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {SERVICES.map((serv) => (
              <div
                key={serv.id}
                className="p-8 bg-surface-container border border-outline-variant/50 rounded-[24px] transition-all duration-300 hover:border-gold-accent/50 hover:shadow-md hover:shadow-gold-accent/5 group"
              >
                <div className="h-12 w-12 bg-gold-accent/10 rounded-xl flex items-center justify-center text-gold-accent group-hover:bg-gold-accent group-hover:text-[#0F172A] transition-all duration-300 mb-6">
                  {/* Assign standard beautiful icons dynamically */}
                  {(() => {
                    const ICON_MAP: Record<string, any> = {
                      Building, Layers, Compass, MapPin, Sliders, Award, ShieldCheck
                    };
                    const Icon = ICON_MAP[(serv as any).icon] || Building;
                    return <Icon className="h-5 w-5" />;
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
      <section id="about_sec" className="py-32 px-4 bg-surface-container-low scroll-mt-[72px]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">Guaranteed Trust</span>
              <h2 className="text-3xl sm:text-4.5xl font-bold tracking-tight text-on-surface leading-tight">
                Why Choose Shiv Saya Properties?
              </h2>
              <p className="text-on-surface-variant text-sm leading-loose">
                Investing in real estate in Delhi NCR is highly competitive and legally complex. We eliminate search clutter and title risks, providing end-to-end guidance under RERA guidelines.
              </p>
              
              <div className="p-5 rounded-[24px] bg-gold-accent/5 border border-gold-accent/20 flex items-start gap-4">
                <Users className="h-8 w-8 text-gold-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Direct Owner Listings</h4>
                  <p className="text-on-surface-variant text-xs mt-1">We cut downstream brokerage loops through pre-vetted direct family owner arrangements.</p>
                </div>
              </div>
            </div>

            {/* Right Cards Column */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { 
                  title: "Local Market Experts", 
                  desc: "Comprehensive database covering property values, projected metro expansions, and RERA approvals.",
                  icon: <Compass className="h-5 w-5" />
                },
                { 
                  title: "Verified Listings Only", 
                  desc: "Zero ghost listings. We complete registry, ownership, and structural verifications beforehand.",
                  icon: <CheckCircle className="h-5 w-5" />
                },
                { 
                  title: "End-to-End Support", 
                  desc: "Documentation, loans from SBI, HDFC & ICICI, structural renovations, and rental agreement setup.",
                  icon: <Briefcase className="h-5 w-5" />
                },
                { 
                  title: "RERA Registered Firm", 
                  desc: "Operated strictly within Indian Real Estate Regulatory Authority standards. Fully ethical advisory.",
                  icon: <Award className="h-5 w-5" />
                }
              ].map((card, i) => (
                <div key={i} className="p-6.5 bg-surface-container border border-outline-variant/50 rounded-[24px]">
                  <div className="h-10 w-10 bg-slate-850 rounded-lg flex items-center justify-center text-gold-accent mb-5">
                    {card.icon}
                  </div>
                  <h3 className="text-on-surface text-md font-semibold tracking-tight">{card.title}</h3>
                  <p className="text-on-surface-variant text-xs mt-2.5 leading-loose">{card.desc}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: CUSTOMER TESTIMONIAL CAROUSEL (Glassmorphic) */}
      <section className="py-32 px-4 bg-surface border-t border-outline-variant/50 relative">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-20">
            <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">Client Stories</span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1">What Our Clients Say</h2>
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
                <h4 className="text-on-surface font-bold text-md tracking-tight">
                  {TESTIMONIALS[activeTestimonial].clientName}
                </h4>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Bought: {TESTIMONIALS[activeTestimonial].propertyType} | {TESTIMONIALS[activeTestimonial].location}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevTestimonial}
                  className="h-10 w-10 bg-surface-container-high hover:bg-gold-accent hover:text-[#0F172A] rounded-full flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeTestimonial === idx ? "w-6 bg-gold-accent" : "w-2 bg-outline-variant"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="h-10 w-10 bg-surface-container-high hover:bg-gold-accent hover:text-[#0F172A] rounded-full flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
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
          
          <span className="text-gold-accent font-semibold text-xs uppercase tracking-widest">Micro-Markets Covered</span>
          <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-on-surface mt-1 mb-8">Delhi NCR Coverage</h2>
          
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
      <section id="contact_sec" className="py-32 px-4 bg-surface relative overflow-hidden scroll-mt-[72px]">
        
        {/* Absolute Glowing backdrop overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute bottom-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full bg-gradient-to-tr from-gold-accent/20 to-transparent blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant rounded-3xl p-8 sm:p-14 text-center relative z-10 shadow-md">
          
          <span className="inline-block bg-gold-accent/15 text-gold-accent text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            Instant Schedule
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Ready to Find Your Dream Property?
          </h2>
          
          <p className="text-on-surface-variant text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-loose">
            Talk to our licensed real estate advisors today. We help clarify loan possibilities, registry documentation, and property comparisons completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={() => onNavigate("properties")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-accent text-[#0F172A] font-bold text-sm shadow-md hover:bg-gold-hover hover:scale-105 shadow-md active:scale-95 transition-all text-center"
            >
              Explore Properties Catalog
            </button>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.investment)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-success-green hover:brightness-110 text-on-surface font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all text-center"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Us Now
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
