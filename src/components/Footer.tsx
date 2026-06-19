/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, ArrowUp } from "lucide-react";
import Logo from "./Logo";
import { BUSINESS_CONFIG } from "../config";
import { useEffect, useState } from "react";

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [showWhatsappBtn, setShowWhatsappBtn] = useState(true);

  useEffect(() => {
    try {
      const controlsStr = localStorage.getItem("ssp_controls");
      if (controlsStr) {
        const controls = JSON.parse(controlsStr);
        if (controls && typeof controls.showWhatsappFloating === "boolean") {
          setShowWhatsappBtn(controls.showWhatsappFloating);
        }
      }
    } catch (e) {
      console.warn("Failed to load ssp_controls in Footer", e);
    }
  }, []);
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (view: string) => {
    if (view === "services_sec" || view === "about_sec" || view === "contact_sec") {
      onNavigate("home");
      setTimeout(() => {
        const element = document.getElementById(view);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#0b0f19] border-t border-white/5 font-sans relative pt-16 pb-8 text-slate-300">
      
      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: About & Socials */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLinkClick("home")}>
              <Logo size={36} className="shrink-0" />
              <span className="text-xl font-bold tracking-tight text-white">
                Shiv <span className="text-[#D4AF37]">Saya</span> Properties
              </span>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400">
              {BUSINESS_CONFIG.businessName} is Delhi NCR's premium real estate advisory. Guided by lead consultant <strong>{BUSINESS_CONFIG.consultantName}</strong>, we combine expert market analytics with transparent client-focused guidance.
            </p>
            
            <div className="pt-2">
              {BUSINESS_CONFIG.reraNumber &&
               !BUSINESS_CONFIG.reraNumber.includes("Pending") &&
               !BUSINESS_CONFIG.reraNumber.includes("XXXX") && (
                <span className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold px-3 py-1.5 rounded-md border border-[#D4AF37]/30">
                  RERA Reg. No: {BUSINESS_CONFIG.reraNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="h-9 w-9 bg-slate-800/60 hover:bg-[#D4AF37] hover:text-slate-950 rounded-full flex items-center justify-center text-slate-400 transition-all">
                <Facebook className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="h-9 w-9 bg-slate-800/60 hover:bg-[#D4AF37] hover:text-slate-950 rounded-full flex items-center justify-center text-slate-400 transition-all">
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="h-9 w-9 bg-slate-800/60 hover:bg-[#D4AF37] hover:text-slate-950 rounded-full flex items-center justify-center text-slate-400 transition-all">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6 relative pl-3">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => handleLinkClick("home")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Properties Directory
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("services_sec")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Our Services
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("about_sec")} className="hover:text-[#D4AF37] transition-colors text-left">
                  About the Firm
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("contact_sec")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Types */}
          <div>
            <h3 className="text-white font-semibold text-base mb-6 relative pl-3">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              Property Types
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Luxury Apartments & Flats
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Premium Sovereign Villas
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Residential Plots & Land
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Modern Builder Floors
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("properties")} className="hover:text-[#D4AF37] transition-colors text-left">
                  Grade-A Commercial Retail
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-base mb-6 relative pl-3">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              Contact Info
            </h3>
            
            <div className="flex gap-3 text-sm">
              <MapPin className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-slate-400">
                NH 58, Morta Rajnagar Extension,<br />Ghaziabad, Uttar Pradesh<br />Near Duhai RRTS Metro Station<br />(Pillar Number 711)
              </p>
            </div>

            <div className="flex gap-3 items-center text-sm">
              <Phone className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
              <a href={`tel:${BUSINESS_CONFIG.businessPhone}`} className="hover:text-[#D4AF37] transition-colors text-slate-400">
                {BUSINESS_CONFIG.businessPhone}
              </a>
            </div>

            <div className="flex gap-3 items-center text-sm">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded border border-[#D4AF37]/20 uppercase">Consultant</span>
              <p className="text-slate-300 font-semibold text-xs">{BUSINESS_CONFIG.consultantName}</p>
            </div>

            <div className="flex gap-3 items-center text-sm">
              <Mail className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
              <a href={`mailto:${BUSINESS_CONFIG.businessEmail}`} className="hover:text-[#D4AF37] transition-colors text-slate-400 break-all">
                {BUSINESS_CONFIG.businessEmail}
              </a>
            </div>
          </div>

        </div>

        {/* Separator */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          <div>
            © 2026 {BUSINESS_CONFIG.businessName}. All Rights Reserved. 
            {BUSINESS_CONFIG.reraNumber &&
             !BUSINESS_CONFIG.reraNumber.includes("Pending") &&
             !BUSINESS_CONFIG.reraNumber.includes("XXXX") && (
               <span> | RERA Reg. No: {BUSINESS_CONFIG.reraNumber}</span>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            
            <button 
              onClick={handleScrollToTop}
              className="h-9 w-9 bg-slate-800 hover:bg-[#D4AF37] hover:text-slate-950 text-slate-300 rounded-full flex items-center justify-center transition-all shadow-md ml-2"
              title="Return to top"
            >
              <ArrowUp className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </div>

      {/* FIXED PLATFORM WHATSAPP CTA PULSE RING (Always Visible, Bottom-Right) */}
      {showWhatsappBtn && (
        <a
          href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent("Hi! I'd love to get more details about your premium RERA properties!")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#10B981] shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 group focus:outline-none"
          title="Chat with property specialists"
        >
          <span className="absolute inset-0 rounded-full bg-[#10B981] opacity-50 animate-ping group-hover:animate-none"></span>
          <svg
            className="h-7 w-7 relative fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.3 1.449 5.058 1.45h.007c5.559 0 10.082-4.515 10.085-10.086.002-2.699-1.047-5.24-2.952-7.149C16.941 1.46 14.4.417 11.998.417 6.438.417 1.91 4.93 1.907 10.5c-.001 1.838.498 3.633 1.442 5.2L2.38 22.1l6.43-1.68c1.554.847 3.292 1.293 5.068 1.294h.01c0 .002 0 .002 0 0zm11.367-7.611c-.328-.164-1.94-.957-2.242-1.068-.3-.11-.518-.164-.738.164-.22.329-.85 1.068-1.041 1.287-.19.219-.382.246-.71.082-.328-.164-1.386-.51-2.64-1.627-.975-.87-1.633-1.946-1.824-2.274-.19-.329-.02-.507.144-.671.149-.148.33-.384.494-.575.164-.192.219-.329.329-.548.11-.219.055-.411-.027-.575-.082-.164-.738-1.78-.1-2.382-.284-.68-.56-.588-.738-.588-.19 0-.411-.006-.63-.006-.22 0-.575.082-.876.411-.302.33-1.15 1.123-1.15 2.74 0 1.616 1.177 3.178 1.341 3.397.164.22 2.316 3.535 5.611 4.956.783.338 1.396.54 1.874.693.788.25 1.503.215 2.07.13.63-.095 1.94-.794 2.214-1.56.274-.767.274-1.423.192-1.56-.083-.137-.302-.219-.63-.383z" />
          </svg>
        </a>
      )}
      
    </footer>
  );
}
