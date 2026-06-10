/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ClipboardList, ShieldAlert, Award, FileText, ArrowRight, Heart } from "lucide-react";
import { Property } from "../types";

interface ListPropertyViewProps {
  onAddProperty: (newProp: Property) => void;
  onShowNotification: (msg: string, type: "success" | "info") => void;
  onNavigate: (view: string) => void;
}

export default function ListPropertyView({ 
  onAddProperty, 
  onShowNotification,
  onNavigate 
}: ListPropertyViewProps) {
  
  // Form Status States
  const [isDone, setIsDone] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"Lakhs" | "Crore">("Lakhs");
  const [city, setCity] = useState("Dwarka");
  const [locality, setLocality] = useState("");
  const [type, setType] = useState<"Flat" | "Villa" | "Plot" | "Builder Floor" | "Commercial">("Flat");
  const [bhk, setBhk] = useState("3");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<"sqft" | "sqyd">("sqft");
  const [floor, setFloor] = useState("2nd");
  const [facing, setFacing] = useState("East");
  const [furnishing, setFurnishing] = useState("Semi-Furnished");

  // Selected Amenities list state
  const [amenities, setAmenities] = useState<string[]>(["Parking", "Water Supply"]);

  const amenitiesList = [
    "Parking",
    "Lift",
    "Security",
    "Gym",
    "Power Backup",
    "Water Supply",
    "Garden",
    "Club House"
  ];

  const handleAmenityToggle = (am: string) => {
    setAmenities(prev => 
      prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !price || !area || !locality) {
      onShowNotification("Please fill out all mandatory fields annotated with red asterisks.", "info");
      return;
    }

    const priceNum = priceUnit === "Lakhs" 
      ? Number(price) * 100000 
      : Number(price) * 10000000;

    const priceStrVal = priceUnit === "Lakhs" 
      ? `₹${price} Lakhs` 
      : `₹${price} Crore`;

    // Static Premium Unsplash Placeholders according to selected Type
    const placeholderImages = {
      Flat: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
      ],
      Villa: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
      ],
      Plot: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
      ],
      "Builder Floor": [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
      ],
      Commercial: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
      ]
    };

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title,
      description: description || `Pre-verified property listing for a modular ${bhk} BHK ${type} at ${locality}, ${city}. Designed for contemporary family comfort with key amenities selected.`,
      price: priceNum,
      priceString: priceStrVal,
      location: `${locality}, ${city}`,
      locality,
      city,
      type,
      category: type === "Commercial" ? "Commercial" : type === "Plot" ? "Plots" : "Buy",
      bhk: type === "Commercial" || type === "Plot" ? null : Number(bhk),
      area: Number(area),
      areaUnit,
      floor: type === "Plot" ? "N/A" : floor,
      facing,
      ageOfProperty: "New Launch",
      furnishing: type === "Plot" ? "Unfurnished" : furnishing,
      images: placeholderImages[type] || placeholderImages.Flat,
      amenities,
      verified: true,
      featured: false,
      newLaunch: true,
      status: "New Launch",
      postedBy: "Owner",
      postedDate: new Date().toISOString().split("T")[0]
    };

    // Callback database / state
    onAddProperty(newProperty);
    setIsDone(true);
    onShowNotification("Property listing registered! RERA audit scheduled.", "success");
  };

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">Direct Owner Channels</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">List Your Property</h1>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            Register your commercial shop, flat, villa, or land plot. We complete free physical audits and title checks in 48 hours.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <AnimatePresence mode="wait">
          {!isDone ? (
            
            /* ACTIVE REGISTRATION FORM PANEL */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
            >
              
              <div className="flex items-start gap-4 p-5 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl">
                <ShieldAlert className="h-6 w-6 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs">Direct Owner Safety Regulation</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Under direct Delhi/Haryana RERA compliance regulations, your listing will become live on our platform as soon as our agents physically verify ownership papers. This protects both buyers and builders.
                  </p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Standard properties shapes */}
                <h3 className="text-white font-extrabold text-md border-b border-white/5 pb-2.5 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#D4AF37]" />
                  Section 1: General Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Title */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      Property Listing Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elegant 3 BHK Semi-Furnished Flat in Dwarka"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Detailed Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Discuss construction standard, facing balcony views, exact metro distances..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none resize-none"
                    />
                  </div>

                  {/* Type, BHK */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4AF37]/40 outline-none cursor-pointer"
                    >
                      <option value="Flat">Flat / Apartment</option>
                      <option value="Villa">Luxury Villa</option>
                      <option value="Plot">Residential Plot</option>
                      <option value="Builder Floor">Builder Floor</option>
                      <option value="Commercial">Commercial Shop</option>
                    </select>
                  </div>

                  {type !== "Commercial" && type !== "Plot" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">BHK Type</label>
                      <select
                        value={bhk}
                        onChange={(e) => setBhk(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4AF37]/40 outline-none cursor-pointer"
                      >
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4+ BHK</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5 opacity-40 select-none">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">BHK Config</label>
                      <input
                        type="text"
                        disabled
                        value="Not Applicable"
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Property Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 85"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                      />
                      <select
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value as any)}
                        className="w-[100px] bg-slate-950 border border-white/5 rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="Lakhs">Lakhs</option>
                        <option value="Crore">Crores</option>
                      </select>
                    </div>
                  </div>

                  {/* Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Spacial Area <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1450"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                      />
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value as any)}
                        className="w-[100px] bg-slate-950 border border-white/5 rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqyd">sqyd</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Localization */}
                <h3 className="text-white font-extrabold text-md border-b border-white/5 pb-2.5 pt-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#D4AF37]" />
                  Section 2: Location and Construction Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delhi NCR City Group</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-[#D4AF37]/40 outline-none cursor-pointer"
                    >
                      <option value="Dwarka">Dwarka</option>
                      <option value="Gurugram">Gurugram</option>
                      <option value="Noida">Noida</option>
                      <option value="Greater Noida West">Greater Noida West</option>
                      <option value="South Delhi">South Delhi</option>
                      <option value="Aerocity">Aerocity</option>
                      <option value="Faridabad">Faridabad</option>
                      <option value="Rohini">Rohini</option>
                      <option value="Pitampura">Pitampura</option>
                    </select>
                  </div>

                  {/* Locality */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Local Sector / Block Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 10 Enclaves"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                    />
                  </div>

                  {/* Floors levels */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Floor Coordinates</label>
                    <input
                      type="text"
                      placeholder="e.g. Ground Floor, or 5th"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                    />
                  </div>

                  {/* Facing */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facing Aspect</label>
                    <input
                      type="text"
                      placeholder="e.g. North-East"
                      value={facing}
                      onChange={(e) => setFacing(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-[#D4AF37]/40 outline-none"
                    />
                  </div>
                </div>

                {/* Section 3: Amenities Checkboxes */}
                <h3 className="text-white font-extrabold text-md border-b border-white/5 pb-2.5 pt-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4AF37]" />
                  Section 3: Key Amenities Included
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {amenitiesList.map((am) => {
                    const isSelected = amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => handleAmenityToggle(am)}
                        className={`p-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]" 
                            : "border-white/5 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {am}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-8 border-t border-white/5 flex gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate("home")}
                    className="flex-1 py-3.5 border border-white/10 rounded-xl text-center text-slate-400 text-xs font-bold uppercase transition-all"
                  >
                    Cancel Submission
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold rounded-xl text-center shadow-lg uppercase transition-all hover:brightness-110"
                  >
                    Register and File Audit
                  </button>
                </div>

              </form>

            </motion.div>
          ) : (
            
            /* CELEBRATORY CELEBRATION BOX ON SUCCESS */
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-[#D4AF37]/30 text-center py-16 px-8 rounded-3xl shadow-xl max-w-lg mx-auto space-y-6"
            >
              <div className="h-16 w-16 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/45 animate-pulse">
                <Check className="h-8 w-8" />
              </div>

              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block">Audit Code Assigned</span>

              <h2 className="text-2xl font-black text-white">Listing Registered!</h2>
              
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Thank you! Your property listing has been queued successfully. Our Delhi NCR audit team will coordinate a physical site inspection in <span className="text-white font-bold">48 hours</span> to publish it as a RERA-Verified asset.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                  onClick={() => onNavigate("properties")}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl border border-white/10"
                >
                  View Listings
                </button>
                <button
                  onClick={() => onNavigate("home")}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 group shadow-md"
                >
                  Return Home
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
