import { formatPrice } from "../utils/format";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Heart, MapPin, BedDouble, Maximize, Trash2, ArrowRight } from "lucide-react";
import { Property } from "../types";
import { BUSINESS_CONFIG } from "../config";
import { useAuth } from "../context/AuthContext";

interface SavedViewProps {
  properties: Property[];
  savedProperties: string[];
  isLoadingData?: boolean;
  onToggleSaved: (id: string) => void;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  onOpenLogin: () => void;
}

export default function SavedView({ 
  properties, 
  savedProperties, 
  isLoadingData,
  onToggleSaved, 
  onNavigate,
  onOpenLogin
}: SavedViewProps) {
  
  const { currentUser } = useAuth();
  const user = currentUser;

  

  const wishlistedItems = properties.filter(p => savedProperties.includes(p.id));

  return (
    <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
      
      {/* HEADER BAR */}
      <div className="bg-surface-container border-b border-outline-variant/50 py-10 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold-accent font-semibold text-xs tracking-wider uppercase">Saved Collections</div>
          <h1 className="text-3xl font-extrabold text-on-surface mt-1">Your Saved Properties</h1>
          <p className="text-on-surface-variant text-xs mt-2 font-medium">
            Manage your favorited properties in one clear place. Connect with advisors for joint group site tours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-container border border-outline-variant/50 rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="bg-surface-container-high h-56 w-full rounded-xl"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                <div className="h-8 bg-surface-container-high rounded w-1/3 mt-4"></div>
              </div>
            ))}
          </div>
        ) : wishlistedItems.length === 0 ? (
          
          /* EMPTY STATE */
          <div className="text-center py-20 bg-surface-container/40 border border-outline-variant/50 rounded-3xl max-w-lg mx-auto p-8">
            <div className="h-14 w-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Your Saved List Is Empty</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed mt-2.5 mb-6">
              {user 
                ? "Browse through our premium builder floors, luxury apartments, and plots in Delhi NCR and tap the heart icon to start saving!"
                : "You must be logged in to save properties. Browse our directory and sign in to create your shortlist."}
            </p>
            {user ? (
              <button
                onClick={() => onNavigate("properties")}
                className="px-6 py-3 bg-gold-accent text-[#0F172A] text-xs font-bold rounded-xl shadow hover:bg-gold-hover hover:scale-105 shadow-md"
              >
                Browse Properties Directory
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 bg-gold-accent text-[#0F172A] text-xs font-bold rounded-xl shadow hover:bg-gold-hover hover:scale-105 shadow-md"
              >
                Log in to Save Properties
              </button>
            )}
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
                className="bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden shadow flex flex-col justify-between group"
              >
                {/* Photo Frame */}
                <div className="relative h-56 w-full overflow-hidden shrink-0">
                  <img width={800} height={600} src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  
                  <span className="absolute top-4 left-4 bg-surface/80 text-gold-accent text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                    {prop.type}
                  </span>

                  <button
                    onClick={() => onToggleSaved(prop.id)}
                    className="absolute top-4 right-4 h-9 w-9 bg-surface/70 text-red-500 rounded-full flex items-center justify-center border border-outline-variant shadow"
                    title="Remove from bookmarks"
                    aria-label="Remove from bookmarks"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xl font-bold text-gold-accent">{formatPrice(prop.price)}</span>
                    
                    <button 
                      onClick={() => onNavigate("properties", prop.id)}
                      className="text-on-surface text-md font-bold mt-2 hover:text-gold-accent cursor-pointer block leading-snug line-clamp-1 text-left w-full outline-none focus:ring-2 focus:ring-gold-accent/50 rounded-sm"
                    >
                      {prop.title}
                    </button>

                    <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-2 pb-4 border-b border-outline-variant/50">
                      <MapPin className="h-4 w-4 text-gold-accent shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 text-xs text-on-surface-variant">
                      {prop.bhk && (
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-outline" />
                          <span>{prop.bhk} BHK</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 justify-end">
                        <Maximize className="h-4 w-4 text-outline" />
                        <span>{prop.area} {prop.areaUnit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-outline-variant/50">
                    <button
                      onClick={() => onNavigate("properties", prop.id)}
                      className="flex-1 py-2.5 rounded-xl bg-surface-container-high hover:bg-outline-variant text-on-surface font-bold text-xs select-none cursor-pointer text-center"
                    >
                      Inspect Property
                    </button>
                    
                    <a
                      href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi, I have wishlisted "${prop.title}" and would like to discuss it.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 w-11 bg-success-green/20 hover:bg-success-green/35 text-success-green border border-success-green/20 rounded-xl flex items-center justify-center cursor-pointer"
                    >
                      <ArrowRight className="h-5 w-5" />
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
