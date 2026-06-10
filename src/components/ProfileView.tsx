/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { UserCheck, Shield, Clipboard, Calendar, Trash2, Mail, Phone } from "lucide-react";
import { subscribeAuth } from "../firebase";
import { Enquiry, Property } from "../types";

interface ProfileViewProps {
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  userProperties: Property[];
  onShowNotification: (msg: string, type: "success" | "info") => void;
}

export default function ProfileView({ onNavigate, userProperties, onShowNotification }: ProfileViewProps) {
  const [user, setUser] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    // 1. Subscribe to Auth
    const unsubscribe = subscribeAuth((usr) => {
      setUser(usr);
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

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">User Command Center</div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Your Account Workspace</h1>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              View your registered audits, site visit logs, and active credentials securely.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* SECTION 1: CREDENTIALS SUMMARY CARD */}
        <div className="bg-slate-900 border border-white/5 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
          {/* Decorative glowing gradient */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-tr from-[#D4AF37]/15 to-transparent blur-xl"></div>
          
          <div className="h-18 w-18 shrink-0 rounded-full border border-[#D4AF37] overflow-hidden bg-slate-800 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <UserCheck className="h-8 w-8 text-[#D4AF37]" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">{user?.displayName || "Guest Client"}</h3>
              {user && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider self-center sm:self-auto gap-1 items-center flex">
                  ✓ Verified Account
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-slate-500" /> {user?.email || "No Connected Email"}</span>
              {user && <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-slate-500" /> +91 Verified Contact</span>}
            </div>
          </div>
        </div>

        {/* SECTION 2: REGISTERED PROPERTIES AUDIT LOG */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-white font-extrabold text-md border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-[#D4AF37]" />
            Your Registered Properties Under Audit ({userProperties.length})
          </h3>

          {userProperties.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed py-6 text-center italic">
              You have not registered any listings under audit yet. Tap "List Your Property" on top to register!
            </p>
          ) : (
            <div className="space-y-3.5">
              {userProperties.map((prop) => (
                <div key={prop.id} className="p-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug">{prop.title}</h4>
                    <p className="text-[10px] text-[#D4AF37] mt-1.5 font-bold uppercase">{prop.locality} | {prop.priceString}</p>
                  </div>

                  <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold rounded-full border border-[#D4AF37]/25 animate-pulse">
                    Audit: IN PROGRESS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: REQUEST LOGS (SITE VISITS / CALLBACKS) */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-white font-extrabold text-md flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
              Scheduled Site Visits & Enquiries ({enquiries.length})
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
                    <p className="text-[10px] text-slate-400 mt-1.5 whitespace-pre-wrap leading-relaxed">
                      Message Notes: <span className="text-slate-300 italic">"{enq.message}"</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
