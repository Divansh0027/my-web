import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import { 
  MapPin, 
  Share2, 
  Heart, 
  Check, 
  ArrowLeft, 
  Car, 
  Zap, 
  Droplet, 
  Trees, 
  Dumbbell, 
  Key, 
  PhoneCall, 
  ShieldAlert, 
  BadgeCheck,
  Calculator
} from "lucide-react";
import { Property, Enquiry } from "../types";
import { submitEnquiry, trackEvent } from "../firebase";
import { useConfig } from "../context/ConfigContext";

interface DetailViewProps {
  property?: Property | null;
  isLoadingData?: boolean;
  allProperties: Property[];
    savedProperties: string[];
  onToggleSaved: (id: string) => void;
  onShowNotification: (msg: string, type: "success" | "info" | "error") => void;
}

export default function DetailView({ 
  property, 
  isLoadingData,
  allProperties, 
  savedProperties, 
  onToggleSaved,
  onShowNotification
}: DetailViewProps) {
  const navigate = useNavigate();
  const BUSINESS_CONFIG = useConfig();
  
  // Gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Authenticated User State
  const { currentUser } = useAuth();

  

  // Form Inputs
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderMessage, setSenderMessage] = useState(`Hi, I am interested in "${property?.title || "this property"}". Please send me the brochure and available payment plans.`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitType, setVisitType] = useState<"enquiry" | "visit">("enquiry");

  // EMI Calculator State
  const basePrice = property?.price ?? 0;
  const [loanPrincipal, setLoanPrincipal] = useState(Math.round(basePrice * 0.8)); // 80% default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [loanTenure, setLoanTenure] = useState(20); // 20 years default
  const [monthlyEmi, setMonthlyEmi] = useState(0);

  const isSaved = property ? savedProperties.includes(property.id) : false;

  // Auto-init loan principal when property changes
  useEffect(() => {
    setLoanPrincipal(Math.round((property?.price ?? 0) * 0.8));
    setActiveImageIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (property?.id) {
      trackEvent("property_view", { property_id: property.id });
    }
  }, [property]);

  // Execute Live EMI Mathematics
  useEffect(() => {
    const P = loanPrincipal;
    const r = interestRate / 12 / 100; // Monthly rate
    const n = loanTenure * 12; // Total monthly installments
    
    if (r === 0) {
      setMonthlyEmi(Math.round(P / n));
      return;
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthlyEmi(Math.round(emi));
  }, [loanPrincipal, interestRate, loanTenure]);

  // Handle Enquiry submission
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      onShowNotification("Please sign in to submit an enquiry.", "info");
      return;
    }

    if (!senderName || !senderPhone) {
      onShowNotification("Please fill out your Name and Phone number.", "info");
      return;
    }

    const cleanPhone = senderPhone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      onShowNotification("Please enter a valid 10-digit Indian phone number.", "error");
      return;
    }

    setIsSubmitting(true);
    
    // Auto populate userId / userEmail if user is logged in
    const enqObj: Enquiry = {
      name: senderName,
      phone: senderPhone,
      message: senderMessage,
      propertyId: property?.id || "unknown",
      propertyName: property?.title || "Unknown Property",
      type: visitType,
      userId: currentUser?.uid || "guest-user",
      userEmail: currentUser?.email || "guest@guest.com"
    };

    const result = await submitEnquiry(enqObj);
    setIsSubmitting(false);

    if (result && result.success) {
      trackEvent("enquiry_submitted", { property_id: property?.id || "unknown" });
      if (result.savedLocally) {
        onShowNotification("Enquiry submitted successfully! (Saved locally, sync pending)", "success");
      } else {
        onShowNotification(
          visitType === "visit" 
            ? "Site visit scheduled successfully! Our partner will call you in 30 minutes." 
            : "Enquiry submitted successfully! PDF brochure sent.", 
          "success"
        );
      }
      // Reset inputs
      setSenderName("");
      setSenderPhone("");
      setSenderMessage(`Hi, I am interested in "${property?.title || "this property"}". Please send me the brochure and available payment plans.`);
    } else {
      onShowNotification(result?.error || "Failed to submit enquiry. Checking database...", "error");
    }
  }, [currentUser, senderName, senderPhone, senderMessage, property?.id, property?.title, visitType, onShowNotification]);

  // Copy shareable link
  const handleShareClick = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    onShowNotification("Property link copied to clipboard!", "success");
  }, [onShowNotification]);

  // Fetch similar properties dynamically (memoized so it does not evaluate every render)
  const similarProperties = useMemo(() => {
    if (!property) return [];
    return allProperties
      .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
      .slice(0, 3);
  }, [allProperties, property?.id, property?.city, property?.type]);

  // Helper mapping for amenities icons
  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("parking")) return <Car className="h-5 w-5 text-gold-accent" />;
    if (n.includes("power") || n.includes("backup")) return <Zap className="h-5 w-5 text-gold-accent" />;
    if (n.includes("water") || n.includes("supply")) return <Droplet className="h-5 w-5 text-gold-accent" />;
    if (n.includes("garden") || n.includes("park")) return <Trees className="h-5 w-5 text-gold-accent" />;
    if (n.includes("gym") || n.includes("fitness")) return <Dumbbell className="h-5 w-5 text-gold-accent" />;
    if (n.includes("security") || n.includes("gate")) return <Key className="h-5 w-5 text-gold-accent" />;
    // default
    return <Check className="h-5 w-5 text-gold-accent" />;
  };

  if (isLoadingData || !property) {
    return (
      <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 animate-pulse">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
            <div className="h-4 bg-surface-container-high rounded w-32"></div>
            <div className="h-4 bg-surface-container-high rounded w-48"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="h-96 sm:h-[480px] w-full bg-surface-container-high rounded-2xl"></div>
              <div className="flex gap-2 w-full overflow-x-auto pb-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 w-28 bg-surface-container-high rounded-xl shrink-0"></div>
                ))}
              </div>
              <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-4">
                <div className="h-8 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-10 bg-surface-container-high rounded w-2/3"></div>
                <div className="h-6 bg-surface-container-high rounded w-1/4"></div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-6 space-y-6">
                <div className="h-6 bg-surface-container-high rounded w-1/2"></div>
                <div className="h-10 bg-surface-container-high rounded w-full"></div>
                <div className="h-32 bg-surface-container-high rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
      <Helmet>
        <title>{property.title} | Shiv Saya Properties</title>
        <meta name="description" content={`Buy ${property.title} in ${property.city}. ${property.description?.substring(0, 120)}...`} />
        {property.images?.[0] && <meta property="og:image" content={property.images[0]} />}
      </Helmet>
      
      {/* BREADCRUMBS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
          <button
            onClick={() => navigate("/properties")}
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-gold-accent text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties Catalog
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-outline">
            <span className="hover:text-on-surface-variant cursor-pointer" onClick={() => navigate("/")}>Home</span>
            <span>&gt;</span>
            <span className="hover:text-on-surface-variant cursor-pointer" onClick={() => navigate("/properties")}>Properties</span>
            <span>&gt;</span>
            <span className="text-on-surface-variant truncate max-w-[200px]">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT MAIN COLUMN: GALLERY, SPECS, DETAIL, CALCULATOR ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Cluster */}
            <div className="space-y-3">
              {/* Main Display Frame */}
              <div 
                onClick={() => { setIsLightboxOpen(true); setIsZoomed(false); }}
                className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer group border border-outline-variant/50 shadow-md"
              >
                <img 
                  src={`${property.images[activeImageIdx] || '/placeholder-property.jpg'}&w=1200&q=80`} 
                  alt={`${property.title} — ${property.location}`} 
                  className="h-full w-full object-cover group-hover:scale-[1.01] transition-transform duration-500" 
                loading="lazy" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold text-gold-accent border border-outline-variant">
                    🔍 Click to Enlarge (Lightbox Gallery)
                  </span>
                </div>

                <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md border border-outline-variant text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg select-none">
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
                      activeImageIdx === idx ? "border-gold-accent" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img width={800} height={600} src={`${img}&w=300&q=80`} alt={`Thumbnail ${idx}`} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Header, pricing, location pins */}
            <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="inline-block px-3 py-1 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-xs font-bold text-gold-accent self-start py-1.5">
                  📁 {property.type} Details
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShareClick}
                    className="h-9 w-9 bg-surface-container-high hover:bg-outline-variant text-on-surface-variant rounded-full flex items-center justify-center transition-all border border-outline-variant/50"
                    title="Copy listing URL"
                    aria-label={`Share ${property.title}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleSaved(property.id)}
                    className="h-9 w-9 bg-surface-container-high hover:bg-outline-variant text-on-surface-variant rounded-full flex items-center justify-center transition-all border border-outline-variant/50"
                    title="Save to favorites"
                    aria-label={isSaved ? `Remove ${property.title} from favorites` : `Save ${property.title} to favorites`}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500 border-none" : ""}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold text-on-surface tracking-tight leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-outline-variant/50">
                <div>
                  <div className="text-outline text-[10px] font-bold uppercase tracking-wider">Property Price</div>
                  <div className="text-3xl font-black text-gold-accent mt-0.5 tracking-tight">{formatPrice(property.price)}</div>
                </div>
                
                <div className="h-10 w-px bg-white/10 hidden sm:block"></div>

                <div>
                  <div className="text-outline text-[10px] font-bold uppercase tracking-wider">Locality Index</div>
                  <div className="flex items-center gap-1 text-on-surface-variant text-sm mt-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-gold-accent" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline hover:text-gold-accent"
                    >
                      {property.location}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Specifications Horizontal Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-6 bg-surface-container border border-outline-variant/50 rounded-2xl text-center">
              <div>
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Configuration</div>
                <div className="text-on-surface font-extrabold text-sm mt-1">{property.bhk ? `${property.bhk} BHK` : "Commercial"}</div>
              </div>
              <div className="border-l border-outline-variant/50">
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Super Area</div>
                <div className="text-on-surface font-extrabold text-sm mt-1">{property.area} {property.areaUnit}</div>
              </div>
              <div className="border-l border-outline-variant/50">
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Floor Level</div>
                <div className="text-on-surface font-extrabold text-sm mt-1">{property.floor}</div>
              </div>
              <div className="border-l border-outline-variant/50">
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Facing Aspect</div>
                <div className="text-on-surface font-extrabold text-sm mt-1">{property.facing || "N/A"}</div>
              </div>
              <div className="border-l border-outline-variant/50">
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Property Age</div>
                <div className="text-on-surface font-extrabold text-sm mt-1">{property.ageOfProperty || "Under 1 Yr"}</div>
              </div>
              <div className="border-l border-outline-variant/50">
                <div className="text-[10px] font-bold text-outline uppercase tracking-widest">Interior State</div>
                <div className="text-on-surface font-extrabold text-sm mt-1 select-all">{property.furnishing || "Unspecified"}</div>
              </div>
            </div>

            {/* Detailed Description Block */}
            <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-4">
              <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5">
                Property Overview
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-sans font-light">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-5">
              <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5">
                Approved Amenities
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.amenities.map((am) => (
                  <div key={am} className="p-4 bg-slate-850/60 border border-outline-variant/50 rounded-xl flex items-center gap-3">
                    <div className="h-9 w-9 bg-gold-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      {typeof getAmenityIcon === "function" ? getAmenityIcon(am) : <Check className="h-5 w-5 text-gold-accent" />}
                    </div>
                    <span className="text-on-surface text-xs font-semibold">{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location index & Nearby places landmarks */}
            <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-6">
              <h3 className="text-on-surface font-extrabold text-lg border-b border-outline-variant/50 pb-3.5 flex items-center justify-between">
                Location & Connectivity Index
                <span className="text-xs text-on-surface-variant font-semibold uppercase">{property.city}</span>
              </h3>

              {/* Map Placeholder Graphic */}
              <div className="relative h-64 w-full bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/50 flex flex-col items-center justify-center text-center p-6 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')` }}>
                <div className="absolute inset-0 bg-surface/85 backdrop-blur-xs"></div>
                <div className="relative z-10 space-y-3">
                  <div className="h-12 w-12 bg-gold-accent/20 border border-gold-accent/40 text-gold-accent rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h4 className="text-on-surface font-bold text-sm tracking-tight">{property.location}</h4>
                  <p className="text-on-surface-variant text-xs max-w-sm mx-auto">Physical inspections and location coordinates can be verified coordinates-free with our advisor.</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex py-2 px-4 rounded-lg bg-surface-container text-xs font-bold text-gold-accent border border-gold-accent/35 hover:bg-gold-accent hover:text-[#0F172A] transition-all select-none"
                  >
                    Open with Google Maps ➜
                  </a>
                </div>
              </div>

              {/* Nearby list (Metro, Mall, Hospital, etc) */}
              <div className="space-y-3">
                <h4 className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Nearby Landmark Benchmarks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.landmarks && property.landmarks.length > 0 ? (
                    property.landmarks.map((land, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-3.5 bg-slate-850/40 rounded-xl border border-outline-variant/50">
                        <span className="text-on-surface-variant font-medium truncate max-w-[200px]">{land.name}</span>
                        <span className="text-gold-accent font-semibold text-[10px] uppercase bg-gold-accent/10 px-2.5 py-0.5 rounded-md">{land.type}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full border border-outline-variant/50 p-4 rounded-xl text-center">
                      <span className="text-on-surface-variant text-xs font-semibold">Nearby amenities available on request</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EMI CALCULATOR SECTION */}
            <div className="p-8 bg-surface-container border border-outline-variant/50 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-3.5">
                <Calculator className="h-5 w-5 text-gold-accent" />
                <h3 className="text-on-surface font-extrabold text-lg">Dynamic Home Loan EMI Calculator</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-5">
                  {/* Loan Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="auto-detailview-415" className="font-bold text-on-surface-variant uppercase tracking-wide">Loan Amount (INR)</label>
                      <span className="text-on-surface font-extrabold text-xs">₹{(loanPrincipal / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <input id="auto-detailview-415"
                      type="range"
                      min={(property?.price ?? 0) * 0.2}
                      max={(property?.price ?? 0) * 0.9}
                      step={100000}
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                      className="w-full accent-gold-accent bg-surface-container-high cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!property?.price}
                    />
                    <div className="flex justify-between text-[9px] text-outline font-medium">
                      <span>Min: 20% (₹{((property?.price ?? 0) * 0.2 / 100000).toFixed(0)}L)</span>
                      <span>Max: 90% (₹{((property?.price ?? 0) * 0.9 / 100000).toFixed(0)}L)</span>
                    </div>
                  </div>

                  {/* Interest rate Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="auto-detailview-437" className="font-bold text-on-surface-variant uppercase tracking-wide">Annual Interest Rate (%)</label>
                      <span className="text-on-surface font-extrabold text-xs">{interestRate}%</span>
                    </div>
                    <input id="auto-detailview-437"
                      type="range"
                      min={6.5}
                      max={15}
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-gold-accent bg-surface-container-high cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-outline font-medium">
                      <span>Standard Bank Tier: 6.5%</span>
                      <span>NBFC Rate Tier: 15%</span>
                    </div>
                  </div>

                  {/* Tenure slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="auto-detailview-458" className="font-bold text-on-surface-variant uppercase tracking-wide">Loan Tenure (Years)</label>
                      <span className="text-on-surface font-extrabold text-xs">{loanTenure} Years</span>
                    </div>
                    <input id="auto-detailview-458"
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className="w-full accent-gold-accent bg-surface-container-high cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-outline font-medium">
                      <span>5 Years</span>
                      <span>30 Years Max</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Calculation Results Box */}
                <div className="md:col-span-5 p-6 bg-surface border border-outline-variant/50 rounded-2xl text-center space-y-4">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Estimated Installment</span>
                  
                  <div>
                    <span className="text-3xl font-black text-emerald-400">₹{monthlyEmi.toLocaleString("en-IN")}</span>
                    <span className="text-on-surface-variant text-xs font-semibold block mt-1">per Month</span>
                  </div>

                  <div className="border-t border-outline-variant/50 pt-4 text-[11px] text-on-surface-variant leading-relaxed font-sans">
                    Based on <span className="text-on-surface font-bold">8.5% average</span> bank landing benchmarks in Delhi NCR. Private bank configurations may differ.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDEBAR: STICKY CONTACT ADVISORY ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-6 shadow-md space-y-6">
              
              {/* Agent Badge Profile */}
              <div className="flex items-center gap-4 border-b border-outline-variant/50 pb-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" 
                  alt={BUSINESS_CONFIG.consultantName} 
                  loading="lazy"
                  className="h-14 w-14 rounded-full object-cover border border-gold-accent/30"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-on-surface text-sm">{BUSINESS_CONFIG.consultantName}</h4>
                    <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-gold-accent font-semibold mt-0.5">Real Estate Consultant</p>
                  <p className="text-[10px] text-outline font-medium">{BUSINESS_CONFIG.businessName}</p>
                </div>
              </div>

              {/* Booking Tab Type Switch */}
              <div className="flex bg-surface p-1 rounded-xl text-center select-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setVisitType("enquiry")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    visitType === "enquiry" ? "bg-gold-accent text-[#0F172A]" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Send Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType("visit")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    visitType === "visit" ? "bg-gold-accent text-[#0F172A]" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Schedule Site Visit
                </button>
              </div>

              {/* Form Entry */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="auto-detailview-543" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                  <input id="auto-detailview-543"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 focus:border-gold-accent/40 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auto-detailview-555" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Phone Number</label>
                  <input id="auto-detailview-555"
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="e.g. +91 99999 12345"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 focus:border-gold-accent/40 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auto-detailview-568" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Message Notes</label>
                  <textarea id="auto-detailview-568"
                    rows={4}
                    placeholder="Describe extra requirement (budget, floors)..."
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl p-4 text-xs text-on-surface placeholder-slate-650 focus:border-gold-accent/40 outline-none resize-none"
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gold-accent text-[#0F172A] text-xs font-bold shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Details...</span>
                  ) : visitType === "visit" ? (
                    <span>Book Confirmed Site Visit</span>
                  ) : (
                    <span>Request Callback Brochure</span>
                  )}
                </button>
              </form>

              {/* Direct Alternative channels */}
              <div className="flex gap-3 border-t border-outline-variant/50 pt-5">
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(property.title))}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { source: "property_detail", property_id: property.id })}
                  className="flex-1 py-3 bg-success-green hover:brightness-110 rounded-xl text-on-surface font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                >
                  <PhoneCall className="h-4 w-4" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${BUSINESS_CONFIG.businessPhone}`}
                  className="flex-1 py-3 border border-outline-variant hover:bg-white/5 rounded-xl text-on-surface-variant font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  Call Directly
                </a>
              </div>

            </div>

            {/* Zero Risk Assurance badge */}
            <div className="p-5.5 bg-gold-accent/5 border border-gold-accent/15 rounded-2xl flex gap-3.5">
              <ShieldAlert className="h-6 w-6 text-gold-accent shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-on-surface text-xs">Buyer Advisory Protection</h5>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Every property on Shiv Saya undergoes multi-stage title searches, outstanding debt checks, and RERA approval audits before active publishing.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ================= SIMILAR PROPERTIES FEED AT BOTTOM ================= */}
        {similarProperties.length > 0 && (
          <div className="mt-20 border-t border-outline-variant/50 pt-16">
            <h3 className="text-on-surface font-extrabold text-xl mb-8">
              Similar Properties inside Delhi NCR
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => navigate(`/property/${prop.id}`)}
                  className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-gold-accent/35 transition-all group text-left w-full focus:outline-none focus:ring-2 focus:ring-gold-accent/50"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img width={800} height={600} src={`${prop.images[0] || '/placeholder-property.jpg'}&w=600&q=80`} alt={`${prop.title} — ${prop.location}`} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-3 left-3 bg-surface/80 text-emerald-400 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      ✓ Verified
                    </span>
                    <span className="absolute top-3 right-3 bg-surface/80 text-gold-accent text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      {prop.type}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <span className="text-lg font-black text-gold-accent">{formatPrice(prop.price)}</span>
                    <h4 className="text-on-surface text-sm font-semibold truncate group-hover:text-gold-accent transition-colors">{prop.title}</h4>
                    
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                      <MapPin className="h-3.5 w-3.5 text-gold-accent" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <div className="flex items-center gap-3 border-t border-outline-variant/50 pt-3 mt-3 text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                      {prop.bhk && <span>{prop.bhk} BHK</span>}
                      <span>{prop.area} {prop.areaUnit}</span>
                      <span className="text-gold-accent">{prop.availabilityStatus}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= LIGHTBOX SLIDESHOW PANEL MODAL ================= */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 relative font-sans"
          >
            {/* Close */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close Lightbox"
              className="absolute top-6 right-6 h-12 w-12 rounded-full bg-surface-container-high hover:bg-gold-accent text-on-surface hover:text-[#0F172A] font-bold items-center justify-center flex transition-colors shadow z-50 cursor-pointer"
            >
              ✕
            </button>

            {/* Slider frame */}
            <div className="max-w-4xl w-full flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setIsZoomed(false); setActiveImageIdx((prev) => (prev - 1 + Math.max(property.images.length, 1)) % Math.max(property.images.length, 1)); }}
                aria-label="Previous image"
                className="h-12 w-12 bg-surface-container border border-outline-variant hover:bg-gold-accent text-on-surface hover:text-[#0F172A] rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              >
                ◀
              </button>

              <div className="max-h-[75vh] max-w-full overflow-hidden rounded-2xl border border-outline-variant relative flex-1 flex items-center justify-center group" onClick={() => setIsZoomed(!isZoomed)}>
                <motion.img 
                  drag={isZoomed}
                  dragConstraints={{ top: -500, left: -500, right: 500, bottom: 500 }}
                  animate={{ scale: isZoomed ? 2 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={property.images[activeImageIdx] || '/placeholder-property.jpg'}
                  alt={`${property.title} - Lightbox view`} 
                  loading="lazy"
                  className={`max-h-[75vh] w-auto max-w-full object-contain mx-auto ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`} 
                />
                {!isZoomed && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold text-on-surface border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    🔍 Click to Zoom In
                  </div>
                )}
                {isZoomed && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold text-on-surface border border-outline-variant pointer-events-none">
                    Drag to pan, Click to Zoom Out
                  </div>
                )}
              </div>

              <button
                onClick={() => { setIsZoomed(false); setActiveImageIdx((prev) => (prev + 1) % Math.max(property.images.length, 1)); }}
                aria-label="Next image"
                className="h-12 w-12 bg-surface-container border border-outline-variant hover:bg-gold-accent text-on-surface hover:text-[#0F172A] rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Pagination numbers */}
            <div className="text-on-surface-variant text-xs mt-6 font-bold uppercase tracking-widest select-none">
              Photo {property.images.length > 0 ? activeImageIdx + 1 : 0} of {property.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
