/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Heart, MapPin, BedDouble, Maximize, Trash2, ArrowRight } from "lucide-react";
import { Property } from "../types";
import { BUSINESS_CONFIG } from "../config";

interface SavedViewProps {
  properties: Property[];
  savedProperties: string[];
  onToggleSaved: (id: string) => void;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
}

export default function SavedView({ 
  properties, 
  savedProperties, 
  onToggleSaved, 
  onNavigate 
}: SavedViewProps) {
  
  const wishlistedItems = properties.filter(p => savedProperties.includes(p.id));

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] pt-24 pb-20 min-h-screen">
      
      {/* HEADER BAR */}
      <div className="bg-slate-900 border-b border-white/5 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-[#D4AF37] font-semibold text-xs tracking-wider uppercase">Saved Collections</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Your Saved Properties</h1>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            Manage your favorited properties in one clear place. Connect with advisors for joint group site tours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {wishlistedItems.length === 0 ? (
          
          /* EMPTY STATE */
          <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-3xl max-w-lg mx-auto p-8">
            <div className="h-14 w-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Saved List Is Empty</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-2.5 mb-6">
              Browse through our premium builder floors, luxury apartments, and plots in Delhi NCR and tap the heart icon to start saving!
            </p>
            <button
              onClick={() => onNavigate("properties")}
              className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold rounded-xl shadow-lg hover:brightness-110"
            >
              Browse Properties Directory
            </button>
          </div>

        ) : (
          
          /* ACTIVE LISTING MATRIX */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistedItems.map((prop) => (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group"
              >
                {/* Photo Frame */}
                <div className="relative h-56 w-full overflow-hidden shrink-0">
                  <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover group-hover:scale-101 transition-transform" />
                  
                  <span className="absolute top-4 left-4 bg-slate-950/80 text-[#D4AF37] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                    {prop.type}
                  </span>

                  <button
                    onClick={() => onToggleSaved(prop.id)}
                    className="absolute top-4 right-4 h-9 w-9 bg-slate-950/70 text-red-500 rounded-full flex items-center justify-center border border-white/10 shadow"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xl font-bold text-[#D4AF37]">{prop.priceString}</span>
                    
                    <h3 
                      onClick={() => onNavigate("properties", prop.id)}
                      className="text-white text-md font-bold mt-2 hover:text-[#D4AF37] cursor-pointer block leading-snug line-clamp-1"
                    >
                      {prop.title}
                    </h3>

                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-2 pb-4 border-b border-white/5">
                      <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 text-xs text-slate-300">
                      {prop.bhk && (
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-slate-500" />
                          <span>{prop.bhk} BHK</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 justify-end">
                        <Maximize className="h-4 w-4 text-slate-500" />
                        <span>{prop.area} {prop.areaUnit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => onNavigate("properties", prop.id)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs select-none cursor-pointer text-center"
                    >
                      Inspect Property
                    </button>
                    
                    <a
                      href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi, I have wishlisted "${prop.title}" and would like to discuss it.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 w-11 bg-[#10B981]/20 hover:bg-[#10B981]/35 text-[#10B981] border border-[#10B981]/20 rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      <ArrowRight className="h-4.5 w-4.5" />
                    </a>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
