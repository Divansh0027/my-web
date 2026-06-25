import { formatPrice } from "../utils/format";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  MapPin, 
  BedDouble, 
  Maximize, 
  HelpCircle, 
  X, 
  ArrowUpDown, 
  PhoneCall, 
  Heart,
  Search
} from "lucide-react";
import { Property } from "../types";
import { BUSINESS_CONFIG } from "../config";

interface ListingsViewProps {
  properties: Property[];
  isLoadingData?: boolean;
  initialFilters?: { query?: string; location: string; type: string; budgetMax: number; bhk: string } | null;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  savedProperties: string[];
  onToggleSaved: (id: string) => void;
}

export default function ListingsView({ 
  properties, 
  isLoadingData,
  initialFilters, 
  onNavigate, 
  savedProperties, 
  onToggleSaved 
}: ListingsViewProps) {
  
  // UI Display States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<"latest" | "low-high" | "high-low" | "popular">("latest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto clean up timeouts that are pending when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Multi-Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState<number>(100000000); // Default 10Cr
  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [selectedConstructionStatuses, setSelectedConstructionStatuses] = useState<string[]>([]);
  const [selectedPostedBy, setSelectedPostedBy] = useState<string[]>([]);

  // Hydrate initial search filters coming from the Hero search
  useEffect(() => {
    if (!initialFilters) return;

    if (initialFilters.query) {
      setSearchQuery(initialFilters.query);
    } else {
      setSearchQuery("");
    }
    if (initialFilters.location) {
      setSelectedLocations([initialFilters.location]);
    } else {
      setSelectedLocations([]);
    }
    if (initialFilters.type) {
      setSelectedTypes([initialFilters.type]);
    } else {
      setSelectedTypes([]);
    }
    if (initialFilters.budgetMax) {
      setBudgetMax(initialFilters.budgetMax);
    } else {
      setBudgetMax(100000000);
    }
    if (initialFilters.bhk && initialFilters.bhk !== "All") {
      setSelectedBhks([initialFilters.bhk]);
    } else {
      setSelectedBhks([]);
    }
    
    // Reset pagination page to 1
    setCurrentPage(1);

    // Trigger a brief beautiful loading shimmer skeleton
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [initialFilters]);

  // Clean all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedLocations([]);
    setSelectedTypes([]);
    setBudgetMax(100000000);
    setSelectedBhks([]);
    setSelectedConstructionStatuses([]);
    setSelectedPostedBy([]);
    setCurrentPage(1);
    
    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsLoading(false), 400);
  };

  // Helper toggle lists
  const toggleLocation = useCallback((loc: string) => {
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(x => x !== loc) : [...prev, loc]);
    setCurrentPage(1);
  }, []);

  const toggleType = useCallback((t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    setCurrentPage(1);
  }, []);

  const toggleBhkValue = useCallback((b: string) => {
    setSelectedBhks(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
    setCurrentPage(1);
  }, []);

  const toggleConstructionStatusValue = useCallback((s: string) => {
    setSelectedConstructionStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setCurrentPage(1);
  }, []);

  const togglePostedValue = useCallback((p: string) => {
    setSelectedPostedBy(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
    setCurrentPage(1);
  }, []);

  // Main filter calculation
  const filteredListings = useMemo(() => {
    return properties.filter((prop) => {
      // Must be a live listing, pending / rejected are hidden in public feed
      if (prop.moderationStatus && prop.moderationStatus !== "live") {
        return false;
      }
      
      // Keyword search
      if (searchQuery.trim().length > 0) {
        const queryTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        const searchText = `${prop.title} ${prop.city} ${prop.locality} ${prop.type} ${prop.category} ${prop.description} ${prop.bhk ? prop.bhk + 'bhk ' + prop.bhk + ' bhk' : ''} ${prop.furnishing || ''} ${prop.availabilityStatus || ''} ${prop.amenities ? prop.amenities.join(' ') : ''}`.toLowerCase();
        
        // Match related stuff by ensuring every keyword term is found somewhere in the combined index
        const matchesQuery = queryTerms.every(term => searchText.includes(term));
          
        if (!matchesQuery) return false;
      }

      // Location (city match against selectedLocations)
      if (selectedLocations.length > 0 && !selectedLocations.includes(prop.city)) {
        return false;
      }
      // Property type
      if (selectedTypes.length > 0 && !selectedTypes.includes(prop.type)) {
        return false;
      }
      // Budget
      if (prop.price > budgetMax) {
        return false;
      }
      // BHK check
      if (selectedBhks.length > 0) {
        if (!prop.bhk) {
          // If BHK is null (e.g. plot or commercial shop), it must not show unless user has unfiltered
          return false;
        }
        const bhkNum = Number(prop.bhk);
        const bhkString = bhkNum >= 4 ? "4+" : String(prop.bhk);
        if (!selectedBhks.includes(bhkString)) {
          return false;
        }
      }
      // Status
      if (selectedConstructionStatuses.length > 0 && (!prop.availabilityStatus || !selectedConstructionStatuses.includes(prop.availabilityStatus))) {
        return false;
      }
      // Posted By
      if (selectedPostedBy.length > 0 && !selectedPostedBy.includes(prop.postedBy)) {
        return false;
      }
      return true;
    });
  }, [
    properties,
    searchQuery,
    selectedLocations,
    selectedTypes,
    budgetMax,
    selectedBhks,
    selectedConstructionStatuses,
    selectedPostedBy
  ]);

  const sortedListings = useMemo(() => {
    const listToSort = [...filteredListings];
    if (sortBy === "low-high") {
      listToSort.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
      listToSort.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popular") {
      // Featured takes high prevalence
      listToSort.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    
    return listToSort;
  }, [filteredListings, sortBy]);

  // Paginated listings
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = useMemo(() => {
    return sortedListings.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedListings, startIndex, itemsPerPage]);

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">Direct-to-Owner Registry</div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Properties in Delhi NCR</h1>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              Showing {sortedListings.length} premium pre-verified lands, floors, and commercial assets.
            </p>
          </div>

          {/* Quick Clear CTA */}
          <button
            onClick={handleClearFilters}
            className="self-start md:self-auto px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-white/5"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ================= DESKTOP SIDEBAR FILTERS ================= */}
          <aside className="hidden lg:block bg-slate-900 border border-white/5 p-6 rounded-2xl h-fit space-y-6">
            <h3 className="text-white font-bold text-base border-b border-white/5 pb-3 flex items-center justify-between">
              Filter Properties
              <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />
            </h3>

            {/* Keyword Search */}
            <div className="space-y-3">
              <label htmlFor="search-query-ds" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Search keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  id="search-query-ds"
                  type="text"
                  placeholder="e.g. Dwarka Flat"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50"
                />
              </div>
            </div>

            {/* Location checkboxes */}
            <div className="space-y-3">
              <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Locality</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {["Dwarka", "Gurugram", "Noida", "Greater Noida West", "Faridabad", "Rohini", "Pitampura", "Aerocity"].map((city) => {
                  const uid = `filter-loc-${city.replace(/\s+/g, '-')}`;
                  return (
                  <label htmlFor={uid} key={city} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input id={uid}
                      type="checkbox"
                      checked={selectedLocations.includes(city)}
                      onChange={() => toggleLocation(city)}
                      className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/50 h-4 w-4"
                    />
                    {city}
                  </label>
                )})}
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Property Type</p>
              <div className="space-y-2">
                {["Flat", "Villa", "Plot", "Builder Floor", "Commercial"].map((t) => {
                  const uid = `filter-type-${t.replace(/\s+/g, '-')}`;
                  return (
                  <label htmlFor={uid} key={t} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input id={uid}
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => toggleType(t)}
                      className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/50 h-4 w-4"
                    />
                    {t === "Flat" ? "Flat / Apartment" : t}
                  </label>
                )})}
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="auto-listingsview-279" className="font-bold text-slate-400 uppercase tracking-wider">Max Budget</label>
                <span className="text-[#D4AF37] font-semibold">
                  {budgetMax >= 100000000 ? "Any Budget" : `₹${(budgetMax / 10000000).toFixed(1)} Cr`}
                </span>
              </div>
              <input id="auto-listingsview-279"
                type="range"
                min={2000000}
                max={100000000}
                step={2000000}
                value={budgetMax}
                onChange={(e) => {
                  setBudgetMax(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#D4AF37] bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>₹20L</span>
                <span>₹1Cr</span>
                <span>₹10Cr+</span>
              </div>
            </div>

            {/* BHK Toggles */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">BHK Type</p>
              <div className="grid grid-cols-4 gap-1.5">
                {["1", "2", "3", "4+"].map((b) => {
                  const isSelected = selectedBhks.includes(b);
                  return (
                    <button
                      key={b}
                      onClick={() => toggleBhkValue(b)}
                      className={`py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]" 
                          : "border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Checkboxes */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Construction Status</p>
              <div className="space-y-2">
                {["Ready to Move", "Under Construction", "New Launch"].map((st) => {
                  const uid = `filter-status-${st.replace(/\s+/g, '-')}`;
                  return (
                  <label htmlFor={uid} key={st} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input id={uid}
                      type="checkbox"
                      checked={selectedConstructionStatuses.includes(st)}
                      onChange={() => toggleConstructionStatusValue(st)}
                      className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/50 h-4 w-4"
                    />
                    {st}
                  </label>
                )})}
              </div>
            </div>

            {/* Posted By check */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Posted By</p>
              <div className="space-y-2">
                {["Owner", "Builder", "Agent"].map((p) => {
                  const uid = `filter-posted-${p.replace(/\s+/g, '-')}`;
                  return (
                  <label htmlFor={uid} key={p} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input id={uid}
                      type="checkbox"
                      checked={selectedPostedBy.includes(p)}
                      onChange={() => togglePostedValue(p)}
                      className="rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/50 h-4 w-4"
                    />
                    {p}
                  </label>
                )})}
              </div>
            </div>
            
          </aside>

          {/* ================= PROPERTY FEED ================= */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Control Bar: View switches, sorts */}
            <div className="p-4 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-4 select-none">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span>Total Results: <b className="text-white">{sortedListings.length}</b></span>
                <span className="hidden md:inline">|</span>
                <span className="hidden md:inline">Showing {Math.min(startIndex + 1, sortedListings.length)}-{Math.min(startIndex + itemsPerPage, sortedListings.length)}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Drawer Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4AF37]" />
                  Filters
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-[#D4AF37]/50 cursor-pointer"
                  >
                    <option value="latest">Sort: Latest</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Grid vs List View toggle */}
                <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-white/10">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400"}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400"}`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* SKELETON LOADER FEED */}
            {isLoading || isLoadingData ? (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-8`}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-4 animate-pulse">
                    <div className="bg-slate-800 h-60 w-full rounded-xl"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-800 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : paginatedListings.length === 0 ? (
              
              /* ================= NO RESULTS FOUND STATE ================= */
              <div className="bg-slate-900 border border-white/5 text-center p-16 rounded-2xl max-w-lg mx-auto">
                <HelpCircle className="h-14 w-14 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">No Properties Match</h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2.5 mb-6">
                  We currently do not have verified listings matching your specific parameters. Try clearing some filters or widening your budget thresholds.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-bold text-xs shadow-md"
                >
                  Reset Settings
                </button>
              </div>

            ) : (
              
              /* ================= PROPERTY CARDS FEED ================= */
              <div className={`grid ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2" 
                  : "grid-cols-1"
              } gap-6`}>
                {paginatedListings.map((prop) => {
                  const isSaved = savedProperties.includes(prop.id);
                  return (
                    <motion.div
                      key={prop.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-[#D4AF37]/30 transition-all group flex ${
                        viewMode === "list" ? "flex-col md:flex-row h-auto md:h-64" : "flex-col"
                      }`}
                    >
                      {/* Image Frame */}
                      <div className={`relative overflow-hidden ${viewMode === "list" ? "w-full md:w-2/5 shrink-0 h-56 md:h-full" : "h-60 w-full shrink-0"}`}>
                        <img width={800} height={600} src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        
                        <div className="absolute top-3 left-3 flex gap-1">
                          {prop.featured && (
                            <span className="bg-[#D4AF37] text-slate-950 font-bold text-[9px] uppercase px-2 py-0.5 rounded shadow">
                              Featured
                            </span>
                          )}
                          {prop.newLaunch && (
                            <span className="bg-emerald-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded shadow">
                              New Launch
                            </span>
                          )}
                        </div>

                        <span className="absolute bottom-3 left-3 bg-slate-950/80 text-emerald-400 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                          ✓ Verified
                        </span>

                        <button
                          onClick={() => onToggleSaved(prop.id)}
                          className="absolute top-3 right-3 h-8 w-8 bg-slate-950/60 rounded-full flex items-center justify-center border border-white/10 text-slate-300 hover:text-red-400 transition-colors"
                          title="Save to favorites"
                          aria-label="Save to favorites"
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>

                      {/* Header, stats, prices */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#D4AF37] font-bold text-xl">{formatPrice(prop.price)}</span>
                            <span className="text-slate-400">{prop.type}</span>
                          </div>

                          <button 
                            onClick={() => onNavigate("properties", prop.id)}
                            className="text-white font-bold text-base mt-2 hover:text-[#D4AF37] transition-colors cursor-pointer leading-tight line-clamp-1 text-left w-full outline-none focus:ring-2 focus:ring-[#D4AF37]/50 rounded-sm"
                          >
                            {prop.title}
                          </button>

                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-2">
                            <MapPin className="h-4 w-4 text-[#D4AF37]" />
                            <span className="truncate">{prop.location}</span>
                          </div>

                          <div className="flex items-center gap-4 border-t border-white/5 pt-3 mt-3 text-xs text-slate-300">
                            {prop.bhk && (
                              <div className="flex items-center gap-1">
                                <BedDouble className="h-3.5 w-3.5 text-slate-500" />
                                <span>{prop.bhk} BHK</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Maximize className="h-3.5 w-3.5 text-slate-500" />
                              <span>{prop.area} {prop.areaUnit}</span>
                            </div>
                            {prop.availabilityStatus && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 bg-slate-800 px-1.5 py-1 text-[10px] rounded uppercase font-semibold">{prop.availabilityStatus}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card CTA actions */}
                        <div className="flex gap-2.5 items-center mt-4">
                          <button
                            onClick={() => onNavigate("properties", prop.id)}
                            className="flex-1 py-2.5 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/5 transition-all cursor-pointer"
                          >
                            View Details
                          </button>
                          
                          <a
                            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(prop.title))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-10 w-10 shrink-0 bg-[#10B981]/25 hover:bg-[#10B981]/30 border border-[#10B981]/30 rounded-xl text-[#10B981] flex items-center justify-center transition-all cursor-pointer"
                            aria-label={`Enquire about ${prop.title} on WhatsApp`}
                          >
                            <PhoneCall className="h-4 w-4" />
                          </a>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ================= PAGINATION ACTIONS ================= */}
            {sortedListings.length > itemsPerPage && !isLoading && (
              <div className="flex items-center justify-between border-t border-white/5 pt-8 select-none text-xs">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 disabled:opacity-40 hover:text-white transition-all font-bold cursor-pointer"
                >
                  ◄ Previous Page
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNo = idx + 1;
                    return (
                      <button
                        key={pageNo}
                        onClick={() => {
                          setCurrentPage(pageNo);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`h-8 w-8 rounded-lg font-bold transition-all cursor-pointer ${
                          currentPage === pageNo 
                            ? "bg-[#D4AF37] text-slate-950" 
                            : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-300 disabled:opacity-40 hover:text-white transition-all font-bold cursor-pointer"
                >
                  Next Page ►
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* ================= MOBILE FILTER DRAWER SHEETS ================= */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-white font-extrabold text-base flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />
                  Refine Search
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Keyword Search */}
              <div className="space-y-3">
                <label htmlFor="search-query-mb" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Search keyword</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="search-query-mb"
                    type="text"
                    placeholder="e.g. Dwarka Flat"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-3 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>

              {/* Mobile Locality */}
              <div className="space-y-3">
                <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Locality</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {["Dwarka", "Gurugram", "Noida", "Greater Noida West", "Faridabad", "Rohini", "Pitampura", "Aerocity"].map((city) => {
                    const isSelected = selectedLocations.includes(city);
                    return (
                      <button
                        key={city}
                        onClick={() => toggleLocation(city)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          isSelected ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white" : "border-white/5 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Type */}
              <div className="space-y-3">
                <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Property Type</p>
                <div className="flex flex-wrap gap-2">
                  {["Flat", "Villa", "Plot", "Builder Floor", "Commercial"].map((t) => {
                    const isSelected = selectedTypes.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleType(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          isSelected ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white" : "border-white/5 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {t === "Flat" ? "Flat / Apartment" : t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Budget */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="auto-listingsview-691" className="font-bold text-slate-400 uppercase tracking-wider">Max Budget</label>
                  <span className="text-[#D4AF37] font-semibold">
                    {budgetMax >= 100000000 ? "Any Budget" : `₹${(budgetMax / 10000000).toFixed(1)} Cr`}
                  </span>
                </div>
                <input id="auto-listingsview-691"
                  type="range"
                  min={2000000}
                  max={100000000}
                  step={2000000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-slate-800"
                />
              </div>

              {/* Mobile BHK */}
              <div className="space-y-3">
                <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider">BHK Preferences</p>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4+"].map((b) => {
                    const isSelected = selectedBhks.includes(b);
                    return (
                      <button
                        key={b}
                        onClick={() => toggleBhkValue(b)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          isSelected ? "bg-[#D4AF37] text-slate-950 border-[#D4AF37]" : "border-white/10 text-slate-400"
                        }`}
                      >
                        {b} BHK
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply / Clear Button row */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-center text-slate-400 text-xs font-bold"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold rounded-xl text-center"
                >
                  Apply Filters
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
