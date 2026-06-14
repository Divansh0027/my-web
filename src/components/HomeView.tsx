/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
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
import { Property, Testimonial } from "../types";
import { SERVICES, TESTIMONIALS, COVERED_AREAS } from "../data/sampleData";
import { BUSINESS_CONFIG } from "../config";

interface HomeViewProps {
  properties: Property[];
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  onSearch: (filters: { location: string; type: string; budgetMax: number; bhk: string }) => void;
  savedProperties: string[];
  onToggleSaved: (id: string) => void;
}

export default function HomeView({ 
  properties, 
  onNavigate, 
  onSearch, 
  savedProperties, 
  onToggleSaved 
}: HomeViewProps) {
  
  // Search parameters state
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchBudget, setSearchBudget] = useState(10000000); // Default Max ₹10Cr (100,000,000)
  const [searchBhk, setSearchBhk] = useState("All");

  // Tab filters for featured properties
  const [activeTab, setActiveTab] = useState<"All" | "Buy" | "Rent" | "Commercial" | "Plots">("All");

  // Testimonials slider index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Handle hero search trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: searchLocation,
      type: searchType,
      budgetMax: searchBudget,
      bhk: searchBhk === "All" ? "" : searchBhk
    });
  };

  // Filter properties based on the active tab
  const getFilteredProperties = () => {
    let filtered = properties;
    if (activeTab !== "All") {
      filtered = properties.filter(p => p.category === activeTab);
    }
    return filtered.slice(0, 6); // Max 6 featured
  };

  const handleLocalityClick = (locality: string) => {
    onSearch({
      location: locality,
      type: "",
      budgetMax: 100000000, // No max
      bhk: ""
    });
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const formatPrice = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
    }
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
  };

  return (
    <div className="font-sans text-slate-200 overflow-x-hidden bg-[#0F172A] pt-18">
      
      {/* SECTION 1: CINEMATIC HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center py-20 px-4 bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0F172A] overflow-hidden">
        
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#D4AF37]/10 to-transparent blur-3xl"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-emerald-500/5 to-transparent blur-3xl"></div>
        </div>

        {/* Dynamic Micro-particles Simulation in CSS */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[30%] left-[15%] w-1.5 h-1.5 bg-[#D4AF37]/40 rounded-full animate-ping duration-2000"></div>
          <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-emerald-500/20 rounded-full animate-ping duration-3000"></div>
          <div className="absolute top-[80%] left-[25%] w-1 h-1 bg-[#D4AF37]/30 rounded-full animate-ping duration-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-full mb-6 select-none"
          >
            <Compass className="h-4 w-4 text-[#D4AF37] animate-spin-[20s]" />
            <span className="text-xs sm:text-sm text-[#D4AF37] font-semibold uppercase tracking-wider">
              Smart Property Deals. Trusted Guidance.
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight text-white max-w-4xl leading-[1.12]"
          >
            Find Your Perfect Property in <span className="bg-gradient-to-r from-white via-[#FFEAA7] to-[#D4AF37] bg-clip-text text-transparent">Delhi NCR</span>
          </motion.h1>

          {/* Subheadline Details */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mt-5 leading-relaxed"
          >
            Trusted by <span className="text-white font-semibold">500+ Families</span> | 100% RERA Registered | Over a decade of verified consultancy in Gurugram, Delhi, Noida & Faridabad.
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-bold text-sm shadow-xl shadow-[#D4AF37]/15 hover:brightness-110 active:scale-98 transition-all"
            >
              Explore Properties
            </button>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.consultation)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Phone className="h-4.5 w-4.5" />
              Chat on WhatsApp
            </a>
            <button
              id="hero-consultation-btn"
              onClick={() => {
                const sec = document.getElementById("contact_sec");
                if (sec) sec.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 text-white font-semibold text-sm transition-all"
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
            className="w-full max-w-5xl mt-12 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-4 text-left"
          >
            {/* Location Select */}
            <div className="w-full md:flex-1 px-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Locality</label>
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-slate-950 text-slate-300">All Delhi NCR</option>
                <option value="Dwarka" className="bg-slate-950 text-slate-300">Dwarka</option>
                <option value="Gurugram" className="bg-slate-950 text-slate-300">Gurugram</option>
                <option value="Noida" className="bg-slate-950 text-slate-300">Noida</option>
                <option value="Greater Noida West" className="bg-slate-950 text-slate-300">Greater Noida West</option>
                <option value="Rohini" className="bg-slate-950 text-slate-300">Rohini</option>
                <option value="Pitampura" className="bg-slate-950 text-slate-300">Pitampura</option>
                <option value="Aerocity" className="bg-slate-950 text-slate-300">Aerocity</option>
                <option value="Faridabad" className="bg-slate-950 text-slate-300">Faridabad</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-white/10 self-center"></div>

            {/* Property Type Select */}
            <div className="w-full md:w-[18%] px-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="" className="bg-slate-950 text-slate-300">All Types</option>
                <option value="Flat" className="bg-slate-950 text-slate-300">Flat/Apartment</option>
                <option value="Villa" className="bg-slate-950 text-slate-300">Luxury Villa</option>
                <option value="Plot" className="bg-slate-950 text-slate-300">Plot / Land</option>
                <option value="Builder Floor" className="bg-slate-950 text-slate-300">Builder Floor</option>
                <option value="Commercial" className="bg-slate-950 text-slate-300">Commercial Shop</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-white/10 self-center"></div>

            {/* Budget Max Select */}
            <div className="w-full md:w-[22%] px-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Budget</label>
              <select
                value={searchBudget}
                onChange={(e) => setSearchBudget(Number(e.target.value))}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="3000000" className="bg-slate-950 text-slate-300">₹30 Lakhs</option>
                <option value="6000000" className="bg-slate-950 text-slate-300">₹60 Lakhs</option>
                <option value="9000000" className="bg-slate-950 text-slate-300">₹90 Lakhs</option>
                <option value="15000000" className="bg-slate-950 text-slate-300">₹1.5 Crore</option>
                <option value="30000000" className="bg-slate-950 text-slate-300">₹3 Crore</option>
                <option value="100000000" className="bg-slate-950 text-slate-300">₹10 Crore+</option>
              </select>
            </div>

            {/* Separator */}
            <div className="hidden md:block h-8 w-px bg-white/10 self-center"></div>

            {/* BHK Select */}
            <div className="w-full md:w-[12%] px-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">BHK</label>
              <select
                value={searchBhk}
                onChange={(e) => setSearchBhk(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 font-medium cursor-pointer"
              >
                <option value="All" className="bg-slate-950 text-slate-300">All</option>
                <option value="1" className="bg-slate-950 text-slate-300">1 BHK</option>
                <option value="2" className="bg-slate-950 text-slate-300">2 BHK</option>
                <option value="3" className="bg-slate-950 text-slate-300">3 BHK</option>
                <option value="4" className="bg-slate-950 text-slate-300">4+ BHK</option>
              </select>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto h-12 md:h-12 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B5942B] hover:brightness-110 text-slate-950 font-bold flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
            >
              <Search className="h-5 w-5" />
              <span className="md:hidden lg:inline text-sm">Find Home</span>
            </button>
          </motion.form>

          {/* Floating Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 bg-slate-900/40 border border-white/5 py-6 px-10 rounded-2xl"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">Properties Sold</div>
            </div>
            <div className="text-center border-l md:border-l border-white/5">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">1000+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">Happy Clients</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37]">10+ Yrs</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">Market Expert</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-medium tracking-wider">Verified Listings</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 2: FEATURED PROPERTIES */}
      <section className="py-24 px-4 bg-[#111827] relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wide">Elite Collection</span>
              <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white mt-1">Featured Properties</h2>
              <p className="text-slate-400 text-sm mt-3 max-w-xl">
                Handpicked, premium residential, commercial, and land plots verified for reliable transaction closures.
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 md:mt-0 bg-slate-900 p-1.5 rounded-xl border border-white/5 select-none text-xs">
              {(["All", "Buy", "Rent", "Commercial", "Plots"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-[#D4AF37] text-slate-950" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredProperties().map((prop) => {
              const isSaved = savedProperties.includes(prop.id);
              return (
                <motion.div
                  key={prop.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg group flex flex-col justify-between"
                >
                  {/* Image, Status Header */}
                  <div className="relative h-64 w-full overflow-hidden shrink-0">
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      {prop.featured && (
                        <span className="bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
                          Featured
                        </span>
                      )}
                      {prop.newLaunch && (
                        <span className="bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow">
                          New Launch
                        </span>
                      )}
                    </div>

                    {/* Verified Badge */}
                    {prop.verified && (
                      <span className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                        ✓ RERA Verified
                      </span>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={() => onToggleSaved(prop.id)}
                      className="absolute top-4 right-4 h-9 w-9 bg-slate-950/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    <div className="absolute top-4 right-16 bg-slate-950/70 text-[#D4AF37] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                      {prop.type}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price Grid */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#D4AF37] tracking-tight">{prop.priceString}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">{prop.postedBy} Listing</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-white text-lg font-semibold mt-2.5 tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-1">
                        {prop.title}
                      </h3>

                      {/* Locality */}
                      <div className="flex items-center gap-1 text-slate-400 text-xs mt-2.5">
                        <MapPin className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-4 my-4.5 text-xs text-slate-300">
                        {prop.bhk && (
                          <div className="flex items-center gap-1.5 justify-center">
                            <BedDouble className="h-4 w-4 text-slate-500 shrink-0" />
                            <span>{prop.bhk} BHK</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 justify-center col-span-2">
                          <Maximize className="h-4 w-4 text-slate-500 shrink-0" />
                          <span>{prop.area} {prop.areaUnit}</span>
                        </div>
                      </div>

                      {/* Key Amenities */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {prop.amenities.slice(0, 4).map((am) => (
                          <span key={am} className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-1 rounded">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-auto">
                      <button
                        onClick={() => onNavigate("properties", prop.id)}
                        className="flex-1 py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/5 transition-all"
                      >
                        View Details
                      </button>
                      
                      <a
                        href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(prop.title))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-11 w-11 shrink-0 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/30 flex items-center justify-center transition-all"
                      >
                        <Phone className="h-4.5 w-4.5" />
                      </a>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>

          {/* View All Properties Bottom CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate("properties")}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800 border border-white/10 hover:border-white/20 rounded-full font-bold text-white text-xs transition-all group hover:bg-[#D4AF37] hover:text-slate-950"
            >
              View All Premium Listings
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section id="services_sec" className="py-24 px-4 bg-[#0F172A] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest">Our Competencies</span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white mt-1">Our Premium Services</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">
              We cover all dimensions of property acquisitions, investments, and documentation with 100% legal backing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {SERVICES.map((serv, idx) => (
              <div
                key={serv.id}
                className="p-8 bg-slate-900 border border-white/5 rounded-2xl transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/5 group"
              >
                <div className="h-12 w-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition-all duration-300 mb-6">
                  {/* Assign standard beautiful icons dynamically */}
                  {idx === 0 && <Building className="h-5.5 w-5.5" />}
                  {idx === 1 && <Building className="h-5.5 w-5.5" />}
                  {idx === 2 && <Layers className="h-5.5 w-5.5" />}
                  {idx === 3 && <Compass className="h-5.5 w-5.5" />}
                  {idx === 4 && <Building className="h-5.5 w-5.5" />}
                  {idx === 5 && <MapPin className="h-5.5 w-5.5" />}
                  {idx === 6 && <Sliders className="h-5.5 w-5.5" />}
                  {idx === 7 && <Award className="h-5.5 w-5.5" />}
                  {idx === 8 && <ShieldCheck className="h-5.5 w-5.5" />}
                </div>

                <h3 className="text-white text-md font-semibold tracking-tight group-hover:text-[#D4AF37] transition-colors">
                  {serv.title}
                </h3>
                
                <p className="text-slate-400 text-xs leading-relaxed mt-3">
                  {serv.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: WHY CHOOSE US */}
      <section id="about_sec" className="py-24 px-4 bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest">Guaranteed Trust</span>
              <h2 className="text-3xl sm:text-4.5xl font-bold tracking-tight text-white leading-tight">
                Why Choose Shiv Saya Properties?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Investing in real estate in Delhi NCR is highly competitive and legally complex. We eliminate search clutter and title risks, providing end-to-end guidance under RERA guidelines.
              </p>
              
              <div className="p-5 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-start gap-4">
                <Users className="h-8 w-8 text-[#D4AF37] shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Direct Owner Listings</h4>
                  <p className="text-slate-400 text-xs mt-1">We cut downstream brokerage loops through pre-vetted direct family owner arrangements.</p>
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
                <div key={i} className="p-6.5 bg-slate-900 border border-white/5 rounded-2xl">
                  <div className="h-10 w-10 bg-slate-850 rounded-lg flex items-center justify-center text-[#D4AF37] mb-5">
                    {card.icon}
                  </div>
                  <h3 className="text-white text-md font-semibold tracking-tight">{card.title}</h3>
                  <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: CUSTOMER TESTIMONIAL CAROUSEL (Glassmorphic) */}
      <section className="py-24 px-4 bg-[#0F172A] border-t border-white/5 relative">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest">Client Stories</span>
            <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white mt-1">What Our Clients Say</h2>
          </div>

          {/* Testimonial Active Slider Box */}
          <div className="relative p-8 sm:p-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
            
            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>

            {/* Testimonial Body Quote */}
            <p className="text-slate-200 text-base sm:text-lg italic leading-relaxed font-sans font-light">
              "{TESTIMONIALS[activeTestimonial].reviewText}"
            </p>

            {/* Client Bio */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
              <div>
                <h4 className="text-white font-bold text-md tracking-tight">
                  {TESTIMONIALS[activeTestimonial].clientName}
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Bought: {TESTIMONIALS[activeTestimonial].propertyType} | {TESTIMONIALS[activeTestimonial].location}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevTestimonial}
                  className="h-10 w-10 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 rounded-full flex items-center justify-center text-slate-300 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeTestimonial === idx ? "w-6 bg-[#D4AF37]" : "w-2 bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  className="h-10 w-10 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 rounded-full flex items-center justify-center text-slate-300 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: DELHI NCR COVERAGE */}
      <section className="py-24 px-4 bg-[#111827] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          
          <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-widest">Micro-Markets Covered</span>
          <h2 className="text-3xl md:text-4.5xl font-bold tracking-tight text-white mt-1 mb-8">Delhi NCR Coverage</h2>
          
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto select-none">
            {COVERED_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => handleLocalityClick(area)}
                className="px-5 py-3 rounded-lg border border-white/5 bg-slate-900/60 text-slate-300 font-semibold text-xs hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-slate-900 shadow transition-all cursor-pointer"
              >
                {area} &nbsp; ➜
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 7: CTA CONTACT BANNER */}
      <section id="contact_sec" className="py-24 px-4 bg-[#0F172A] relative overflow-hidden">
        
        {/* Absolute Glowing backdrop overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute bottom-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full bg-gradient-to-tr from-[#D4AF37]/20 to-transparent blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#111827] to-[#0b0f19] border border-white/10 rounded-3xl p-8 sm:p-14 text-center relative z-10 shadow-2xl">
          
          <span className="inline-block bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            Instant Schedule
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to Find Your Dream Property?
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Talk to our licensed real estate advisors today. We help clarify loan possibilities, registry documentation, and property comparisons completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={() => onNavigate("properties")}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all text-center"
            >
              Explore Properties Catalog
            </button>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.investment)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all text-center"
            >
              <Phone className="h-4.5 w-4.5" />
              WhatsApp Us Now
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
