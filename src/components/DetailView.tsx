/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Share2, 
  Heart, 
  Calendar, 
  Check, 
  ArrowLeft, 
  Car, 
  Zap, 
  Droplet, 
  Trees, 
  Dumbbell, 
  Key, 
  UserCheck, 
  PhoneCall, 
  ShieldAlert, 
  Info,
  BadgeCheck,
  Calculator,
  Compass,
  Maximize
} from "lucide-react";
import { Property, Enquiry } from "../types";
import { submitEnquiry } from "../firebase";
import { BUSINESS_CONFIG } from "../config";

interface DetailViewProps {
  property: Property;
  allProperties: Property[];
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  savedProperties: string[];
  onToggleSaved: (id: string) => void;
  onShowNotification: (msg: string, type: "success" | "info") => void;
}

export default function DetailView({ 
  property, 
  allProperties, 
  onNavigate, 
  savedProperties, 
  onToggleSaved,
  onShowNotification
}: DetailViewProps) {
  
  // Gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Form Inputs
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderMessage, setSenderMessage] = useState(`Hi, I am interested in "${property.title}". Please send me the brochure and available payment plans.`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitType, setVisitType] = useState<"enquiry" | "visit">("enquiry");

  // EMI Calculator State
  const [loanPrincipal, setLoanPrincipal] = useState(Math.round(property.price * 0.8)); // 80% default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [loanTenure, setLoanTenure] = useState(20); // 20 years default
  const [monthlyEmi, setMonthlyEmi] = useState(0);

  const isSaved = savedProperties.includes(property.id);

  // Auto-init loan principal when property changes
  useEffect(() => {
    setLoanPrincipal(Math.round(property.price * 0.8));
    setActiveImageIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone) {
      onShowNotification("Please fill out your Name and Phone number.", "info");
      return;
    }

    setIsSubmitting(true);
    
    const enqObj: Enquiry = {
      name: senderName,
      phone: senderPhone,
      message: senderMessage,
      propertyId: property.id,
      propertyName: property.title,
      type: visitType
    };

    const success = await submitEnquiry(enqObj);
    setIsSubmitting(false);

    if (success) {
      onShowNotification(
        visitType === "visit" 
          ? "Site visit scheduled successfully! Our partner will call you in 30 minutes." 
          : "Enquiry submitted successfully! PDF brochure sent.", 
        "success"
      );
      // Reset inputs
      setSenderName("");
      setSenderPhone("");
      setSenderMessage(`Hi, I am interested in "${property.title}". Please send me the brochure and available payment plans.`);
    } else {
      onShowNotification("Failed to submit enquiry. Checking database...", "info");
    }
  };

  // Copy shareable link
  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowNotification("Property link copied to clipboard!", "success");
  };

  // Fetch similar properties
  const getSimilarProperties = (): Property[] => {
    return allProperties
      .filter((p) => p.id !== property.id && (p.city === property.city || p.type === property.type))
      .slice(0, 3);
  };

  const similarProperties = getSimilarProperties();

  // Helper mapping for amenities icons
  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("parking")) return <Car className="h-5 w-5 text-[#D4AF37]" />;
    if (n.includes("power") || n.includes("backup")) return <Zap className="h-5 w-5 text-[#D4AF37]" />;
    if (n.includes("water") || n.includes("supply")) return <Droplet className="h-5 w-5 text-[#D4AF37]" />;
    if (n.includes("garden") || n.includes("park")) return <Trees className="h-5 w-5 text-[#D4AF37]" />;
    if (n.includes("gym") || n.includes("fitness")) return <Dumbbell className="h-5 w-5 text-[#D4AF37]" />;
    if (n.includes("security") || n.includes("gate")) return <Key className="h-5 w-5 text-[#D4AF37]" />;
    // default
    return <Check className="h-5 w-5 text-[#D4AF37]" />;
  };

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen">
      
      {/* BREADCRUMBS BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <button
            onClick={() => onNavigate("properties")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#D4AF37] text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties Catalog
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => onNavigate("home")}>Home</span>
            <span>&gt;</span>
            <span className="hover:text-slate-300 cursor-pointer" onClick={() => onNavigate("properties")}>Properties</span>
            <span>&gt;</span>
            <span className="text-slate-300 truncate max-w-[200px]">{property.title}</span>
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
                onClick={() => setIsLightboxOpen(true)}
                className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer group border border-white/5 shadow-2xl"
              >
                <img 
                  src={property.images[activeImageIdx]} 
                  alt={property.title} 
                  className="h-full w-full object-cover group-hover:scale-[1.01] transition-transform duration-500" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-semibold text-[#D4AF37] border border-white/10">
                    🔍 Click to Enlarge (Lightbox Gallery)
                  </span>
                </div>

                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg select-none">
                  ✓ Pre-Verified Listing
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-2 w-full overflow-x-auto pb-1 select-none whitespace-nowrap">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? "border-[#D4AF37]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Header, pricing, location pins */}
            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-bold text-[#D4AF37] self-start py-1.5">
                  📁 {property.type} Details
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShareClick}
                    className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-all border border-white/5"
                    title="Copy listing URL"
                  >
                    <Share2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => onToggleSaved(property.id)}
                    className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-all border border-white/5"
                    title="Save to favorites"
                  >
                    <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-red-500 text-red-500 border-none" : ""}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold text-white tracking-tight leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Property Price</div>
                  <div className="text-3xl font-black text-[#D4AF37] mt-0.5 tracking-tight">{property.priceString}</div>
                </div>
                
                <div className="h-10 w-px bg-white/10 hidden sm:block"></div>

                <div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Locality Index</div>
                  <div className="flex items-center gap-1 text-slate-300 text-sm mt-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" />
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline hover:text-[#D4AF37]"
                    >
                      {property.location}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Specifications Horizontal Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-6 bg-slate-900 border border-white/5 rounded-2xl text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuration</div>
                <div className="text-white font-extrabold text-sm mt-1">{property.bhk ? `${property.bhk} BHK` : "Commercial"}</div>
              </div>
              <div className="border-l border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Super Area</div>
                <div className="text-white font-extrabold text-sm mt-1">{property.area} {property.areaUnit}</div>
              </div>
              <div className="border-l border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Floor Level</div>
                <div className="text-white font-extrabold text-sm mt-1">{property.floor}</div>
              </div>
              <div className="border-l border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facing Aspect</div>
                <div className="text-white font-extrabold text-sm mt-1">{property.facing || "N/A"}</div>
              </div>
              <div className="border-l border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Property Age</div>
                <div className="text-white font-extrabold text-sm mt-1">{property.ageOfProperty || "Under 1 Yr"}</div>
              </div>
              <div className="border-l border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Interior State</div>
                <div className="text-white font-extrabold text-sm mt-1 select-all">{property.furnishing || "Unspecified"}</div>
              </div>
            </div>

            {/* Detailed Description Block */}
            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-white font-extrabold text-lg border-b border-white/5 pb-3.5">
                Property Overview
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-sans font-light">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl space-y-5">
              <h3 className="text-white font-extrabold text-lg border-b border-white/5 pb-3.5">
                Approved Amenities
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.amenities.map((am) => (
                  <div key={am} className="p-4 bg-slate-850/60 border border-white/5 rounded-xl flex items-center gap-3">
                    <div className="h-9 w-9 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center shrink-0">
                      {getAmenityIcon(am)}
                    </div>
                    <span className="text-slate-200 text-xs font-semibold">{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location index & Nearby places landmarks */}
            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl space-y-6">
              <h3 className="text-white font-extrabold text-lg border-b border-white/5 pb-3.5 flex items-center justify-between">
                Location & Connectivity Index
                <span className="text-xs text-slate-400 font-semibold uppercase">{property.city}</span>
              </h3>

              {/* Map Placeholder Graphic */}
              <div className="relative h-64 w-full bg-slate-800 rounded-xl overflow-hidden border border-white/5 flex flex-col items-center justify-center text-center p-6 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')` }}>
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs"></div>
                <div className="relative z-10 space-y-3">
                  <div className="h-12 w-12 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h4 className="text-white font-bold text-sm tracking-tight">{property.location}</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">Physical inspections and location coordinates can be verified coordinates-free with our advisor.</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex py-2 px-4 rounded-lg bg-slate-900 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/35 hover:bg-[#D4AF37] hover:text-slate-950 transition-all select-none"
                  >
                    Open with Google Maps ➜
                  </a>
                </div>
              </div>

              {/* Nearby list (Metro, Mall, Hospital, etc) */}
              <div className="space-y-3">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Nearby Landmark Benchmarks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(property.landmarks || [
                    { name: "Indira Gandhi International Airport", type: "Airport (25 mins)" },
                    { name: "Delhi Metro Blue Line Station", type: "Metro Station (5 mins)" },
                    { name: "Max Super Specialty Medical Hub", type: "Hospital (8 mins)" },
                    { name: "Gaur City Premium Shopping Corridor", type: "Mall (10 mins)" }
                  ]).map((land, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-3.5 bg-slate-850/40 rounded-xl border border-white/5">
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">{land.name}</span>
                      <span className="text-[#D4AF37] font-semibold text-[10px] uppercase bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-md">{land.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EMI CALCULATOR SECTION */}
            <div className="p-8 bg-slate-900 border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
                <Calculator className="h-5.5 w-5.5 text-[#D4AF37]" />
                <h3 className="text-white font-extrabold text-lg">Dynamic Home Loan EMI Calculator</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-5">
                  {/* Loan Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-slate-400 uppercase tracking-wide">Loan Amount (INR)</label>
                      <span className="text-white font-extrabold text-xs">₹{(loanPrincipal / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <input
                      type="range"
                      min={property.price * 0.2}
                      max={property.price * 0.9}
                      step={100000}
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] bg-slate-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                      <span>Min: 20% (₹{(property.price * 0.2 / 100000).toFixed(0)}L)</span>
                      <span>Max: 90% (₹{(property.price * 0.9 / 100000).toFixed(0)}L)</span>
                    </div>
                  </div>

                  {/* Interest rate Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-slate-400 uppercase tracking-wide">Annual Interest Rate (%)</label>
                      <span className="text-white font-extrabold text-xs">{interestRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={6.5}
                      max={15}
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] bg-slate-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                      <span>Standard Bank Tier: 6.5%</span>
                      <span>NBFC Rate Tier: 15%</span>
                    </div>
                  </div>

                  {/* Tenure slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-slate-400 uppercase tracking-wide">Loan Tenure (Years)</label>
                      <span className="text-white font-extrabold text-xs">{loanTenure} Years</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] bg-slate-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                      <span>5 Years</span>
                      <span>30 Years Max</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Calculation Results Box */}
                <div className="md:col-span-5 p-6 bg-slate-950 border border-white/5 rounded-2xl text-center space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estimated Installment</span>
                  
                  <div>
                    <span className="text-3xl font-black text-emerald-400">₹{monthlyEmi.toLocaleString("en-IN")}</span>
                    <span className="text-slate-400 text-xs font-semibold block mt-1">per Month</span>
                  </div>

                  <div className="border-t border-white/5 pt-4 text-[11px] text-slate-400 leading-relaxed font-sans">
                    Based on <span className="text-white font-bold">8.5% average</span> bank landing benchmarks in Delhi NCR. Private bank configurations may differ.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDEBAR: STICKY CONTACT ADVISORY ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
              
              {/* Agent Badge Profile */}
              <div className="flex items-center gap-4.5 border-b border-white/5 pb-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" 
                  alt={BUSINESS_CONFIG.consultantName} 
                  className="h-14 w-14 rounded-full object-cover border border-[#D4AF37]/30"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-white text-sm">{BUSINESS_CONFIG.consultantName}</h4>
                    <BadgeCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">Real Estate Consultant</p>
                  <p className="text-[10px] text-slate-500 font-medium">{BUSINESS_CONFIG.businessName}</p>
                </div>
              </div>

              {/* Booking Tab Type Switch */}
              <div className="flex bg-slate-950 p-1 rounded-xl text-center select-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setVisitType("enquiry")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    visitType === "enquiry" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Send Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType("visit")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                    visitType === "visit" ? "bg-[#D4AF37] text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Schedule Site Visit
                </button>
              </div>

              {/* Form Entry */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="e.g. +91 99999 12345"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Describe extra requirement (budget, floors)..."
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none resize-none"
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
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
              <div className="flex gap-3 border-t border-white/5 pt-5">
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(property.title))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-[#10B981] hover:bg-emerald-600 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                >
                  <PhoneCall className="h-4 w-4" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${BUSINESS_CONFIG.businessPhone}`}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  Call Directly
                </a>
              </div>

            </div>

            {/* Zero Risk Assurance badge */}
            <div className="p-5.5 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl flex gap-3.5">
              <ShieldAlert className="h-6 w-6 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-white text-xs">Buyer Advisory Protection</h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Every property on Shiv Saya undergoes multi-stage title searches, outstanding debt checks, and RERA approval audits before active publishing.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ================= SIMILAR PROPERTIES FEED AT BOTTOM ================= */}
        {similarProperties.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-16">
            <h3 className="text-white font-extrabold text-xl mb-8">
              Similar Properties inside Delhi NCR
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onNavigate("properties", prop.id)}
                  className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer shadow hover:border-[#D4AF37]/35 transition-all group"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 text-emerald-400 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      ✓ Verified
                    </span>
                    <span className="absolute top-3 right-3 bg-slate-950/80 text-[#D4AF37] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      {prop.type}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <span className="text-lg font-black text-[#D4AF37]">{prop.priceString}</span>
                    <h4 className="text-white text-sm font-semibold truncate group-hover:text-[#D4AF37] transition-colors">{prop.title}</h4>
                    
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      {prop.bhk && <span>{prop.bhk} BHK</span>}
                      <span>{prop.area} {prop.areaUnit}</span>
                      <span className="text-[#D4AF37]">{prop.status}</span>
                    </div>
                  </div>
                </div>
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
              className="absolute top-6 right-6 h-12 w-12 rounded-full bg-slate-800 hover:bg-[#D4AF37] text-white hover:text-slate-950 font-bold items-center justify-center flex transition-colors shadow z-50 cursor-pointer"
            >
              ✕
            </button>

            {/* Slider frame */}
            <div className="max-w-4xl w-full flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                className="h-12 w-12 bg-slate-900 border border-white/10 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              >
                ◀
              </button>

              <div className="max-h-[75vh] max-w-full overflow-hidden rounded-2xl border border-white/10">
                <img 
                  src={property.images[activeImageIdx]} 
                  alt="Lightbox High-def View" 
                  className="max-h-[75vh] w-auto max-w-full object-contain mx-auto" 
                />
              </div>

              <button
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % property.images.length)}
                className="h-12 w-12 bg-slate-900 border border-white/10 hover:bg-[#D4AF37] text-white hover:text-slate-950 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Pagination numbers */}
            <div className="text-slate-400 text-xs mt-6 font-bold uppercase tracking-widest select-none">
              Photo {activeImageIdx + 1} of {property.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
