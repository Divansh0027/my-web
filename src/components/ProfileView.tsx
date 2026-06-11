/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  UserCheck, Shield, Clipboard, Calendar, Trash2, Mail, 
  Phone, Heart, Edit3, Save, MapPin, Key, Sparkles, LogOut, CheckCircle2, Building 
} from "lucide-react";
import { subscribeAuth, updateUserProfileDetails } from "../firebase";
import { Enquiry, Property } from "../types";

interface ProfileViewProps {
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  userProperties: Property[];
  onShowNotification: (msg: string, type: "success" | "info") => void;
  allProperties: Property[];
  savedPropertyIds: string[];
  onToggleSaved: (id: string) => void;
}

export default function ProfileView({ 
  onNavigate, 
  userProperties, 
  onShowNotification,
  allProperties,
  savedPropertyIds,
  onToggleSaved
}: ProfileViewProps) {
  const [user, setUser] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeTab, setActiveTab] = useState<"listings" | "favorites" | "enquiries">("listings");
  
  // Profile Editable state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Auth
    const unsubscribe = subscribeAuth((usr) => {
      setUser(usr);
      if (usr) {
        setEditName(usr.displayName || "");
        setEditEmail(usr.email || "");
        // Fetch phone if saved in DB or local fallback
        const savedPhone = usr.phone || localStorage.getItem(`ssp_phone_${usr.uid}`) || "";
        setEditPhone(savedPhone);
      }
    });

    // 2. Fetch local storage enquiries
    const localEnquiriesStr = localStorage.getItem("ssp_local_enquiries");
    if (localEnquiriesStr) {
      setEnquiries(JSON.parse(localEnquiriesStr));
    }

    return () => unsubscribe();
  }, []);

  const handleClearEnquiries = () => {
    localStorage.removeItem("ssp_local_enquiries");
    setEnquiries([]);
    onShowNotification("Activity log cleared successfully.", "success");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      onShowNotification("Display name cannot be empty.", "info");
      return;
    }
    const phoneNo = editPhone.replace(/\D/g, "");
    if (phoneNo && phoneNo.length !== 10) {
      onShowNotification("Please enter a valid 10-digit contact number.", "info");
      return;
    }

    setIsSaving(true);
    const formattedPhone = phoneNo ? `+91 ${phoneNo.slice(0, 5)} ${phoneNo.slice(5)}` : "";
    const success = await updateUserProfileDetails(editName.trim(), editEmail.trim(), formattedPhone);
    if (success) {
      if (user?.uid) {
        localStorage.setItem(`ssp_phone_${user.uid}`, formattedPhone);
      }
      setIsEditing(false);
      onShowNotification("Your profile details have been securely updated!", "success");
    } else {
      onShowNotification("Failed to save credentials. Please try again.", "info");
    }
    setIsSaving(false);
  };

  // Compute favorited properties from parents state
  const favoriteProperties = allProperties.filter(p => savedPropertyIds.includes(p.id));

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen select-none">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-spin" />
              User Workspace Control
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">My Dashboard Account</h1>
            <p className="text-slate-400 text-xs mt-2 font-medium leading-relaxed">
              Organize your listings, track saved bookmark shortlists, manage scheduled site tours, and adjust contact records.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* SECTION 1: EDITABLE PROFILE BLOCK CARD */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Decorative subtle background accents */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-tr from-[#D4AF37]/10 to-transparent blur-xl"></div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
              <div className="h-16 w-16 shrink-0 rounded-full border border-[#D4AF37]/35 overflow-hidden bg-slate-800 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <UserCheck className="h-7 w-7 text-[#D4AF37]" />
                )}
              </div>

              {/* Form editing vs normal view */}
              {!isEditing ? (
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">{user?.displayName || "Guest Client"}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider self-center sm:self-auto gap-1 items-center flex">
                      ✓ Active Customer
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-500" /> {user?.email || "guest@shivsayaproperties.com"}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-500" /> {editPhone || "Add contact number"}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="w-full space-y-3.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-705 outline-none focus:border-[#D4AF37]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Email Address (Readonly)</label>
                      <input 
                        type="email" 
                        disabled
                        value={editEmail}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Contact (+91 Indian)</label>
                      <input 
                        type="tel" 
                        maxLength={10}
                        placeholder="10 digit number"
                        value={editPhone.replace(/\D/g, "")}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 outline-none focus:border-[#D4AF37]/40"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-[#D4AF37] hover:brightness-110 active:scale-98 transition-all text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4.5 py-2 hover:bg-slate-800 text-xs text-[#D4AF37] hover:text-white border border-[#D4AF37]/20 rounded-xl transition-all self-stretch md:self-auto flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: VIEW NAV TABS SYSTEM */}
        <div className="flex border-b border-white/5 bg-slate-900/30 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "listings"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clipboard className="h-4 w-4" />
            My Listings ({userProperties.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "favorites"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="h-4 w-4" />
            Saved Shortlists ({favoriteProperties.length})
          </button>
          <button
            onClick={() => setActiveTab("enquiries")}
            className={`flex-1 py-3 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "enquiries"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Active Scheduled tours ({enquiries.length})
          </button>
        </div>

        {/* SECTION 3: CONDITIONAL WORKSPACE PORTLET VIEWS */}
        
        {/* Tab A: LISTINGS VIEW WITH BADGES */}
        {activeTab === "listings" && (
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-white font-extrabold text-sm border-b border-white/5 pb-2.5 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-[#D4AF37]" />
              Property Audit & Approvals
            </h3>

            {userProperties.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  No properties registered under this account yet.
                </p>
                <button
                  onClick={() => onNavigate("list_property")}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold rounded-lg hover:brightness-110 active:scale-98 cursor-pointer"
                >
                  List your property now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userProperties.map((prop) => {
                  const isVerified = prop.verified;
                  const isPending = !isVerified && (prop.status as any) === "pending";
                  
                  return (
                    <div 
                      key={prop.id} 
                      className="p-4 bg-slate-950 border border-white/5 rounded-xl hover:border-[#D4AF37]/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="cursor-pointer" onClick={() => onNavigate("properties", prop.id)}>
                        <h4 className="font-bold text-white text-xs hover:text-[#D4AF37] transition-all leading-snug">{prop.title}</h4>
                        <p className="text-[10px] text-slate-450 mt-1 font-semibold flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {prop.locality}, {prop.city}
                        </p>
                        <p className="text-[10px] text-[#D4AF37] mt-1 font-bold">{prop.priceString || `₹${(prop.price/100000).toFixed(0)} Lakhs`}</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black uppercase tracking-wider rounded-full border border-[#D4AF37]/20 flex items-center gap-1.5 animate-pulse">
                          <span className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full"></span>
                          Audit: PENDING REVIEW
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab B: SAVED PROPERTIES CARD LISTING */}
        {activeTab === "favorites" && (
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-white font-extrabold text-sm border-b border-white/5 pb-2.5 flex items-center gap-2">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/20" />
              My Saved Shortlists
            </h3>

            {favoriteProperties.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Your bookmarked properties are empty. Explore our catalog to save items!
                </p>
                <button
                  onClick={() => onNavigate("properties")}
                  className="mt-3 px-4 py-2 bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold rounded-lg hover:text-white"
                >
                  Browse Listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteProperties.map((prop) => (
                  <div 
                    key={prop.id} 
                    className="p-4 bg-slate-950 border border-white/5 rounded-2xl hover:border-[#D4AF37]/25 transition-all flex flex-col justify-between h-auto relative overflow-hidden group"
                  >
                    <div className="space-y-2">
                      <div className="relative h-28 rounded-xl overflow-hidden bg-slate-900">
                        <img 
                          src={prop.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80"} 
                          alt={prop.title} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleSaved(prop.id); }}
                          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-rose-500 flex items-center justify-center border border-white/10 cursor-pointer shadow-md"
                          title="Remove bookmark"
                        >
                          <Heart className="h-4 w-4 fill-rose-500" />
                        </button>
                      </div>

                      <div className="cursor-pointer space-y-1.5" onClick={() => onNavigate("properties", prop.id)}>
                        <h4 className="font-extrabold text-white text-xs line-clamp-1 group-hover:text-[#D4AF37] transition-all pt-1">{prop.title}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {prop.locality}, {prop.city}
                        </p>
                        <p className="text-[#D4AF37] font-bold text-xs">{prop.priceString || `₹${(prop.price/100000).toFixed(0)} Lakhs`}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 mt-3 flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">{prop.type}</span>
                      <button
                        onClick={() => onNavigate("properties", prop.id)}
                        className="text-[10px] text-[#D4AF37] font-bold hover:underline"
                      >
                        View Property Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab C: SCHEDULED TOUR ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-white font-extrabold text-sm flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-[#D4AF37]" />
                Scheduled Site Visits & Enquiries
              </h3>
              {enquiries.length > 0 && (
                <button
                  onClick={handleClearEnquiries}
                  className="text-xs text-red-400 font-bold hover:underline py-1"
                >
                  Clear History
                </button>
              )}
            </div>

            {enquiries.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed py-6 text-center italic">
                No callbacks or site tours requested in this browser session. Browse properties to schedule!
              </p>
            ) : (
              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                      <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        🎯 {enq.type === "visit" ? "Site Visit Confirmed" : "Callback Scheduled"}
                      </span>
                      <span className="text-slate-500 text-[10px]">{enq.dateStr ? new Date(enq.dateStr).toLocaleDateString() : ""}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug">{enq.propertyName}</h4>
                      <p className="text-[10px] text-slate-450 mt-1.5 whitespace-pre-wrap leading-relaxed">
                        Message Notes: <span className="text-slate-300 italic">"{enq.message}"</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
