/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ListingsView from "./components/ListingsView";
import DetailView from "./components/DetailView";
import SavedView from "./components/SavedView";
import ListPropertyView from "./components/ListPropertyView";
import ProfileView from "./components/ProfileView";
import Notification from "./components/Notification";
import { getProperties, getFavorites, toggleFavorite, subscribeAuth } from "./firebase";
import { Property } from "./types";
import { SAMPLE_PROPERTIES } from "./data/sampleData";

export default function App() {
  // Routing & View Managers
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Unified Database properties
  const [properties, setProperties] = useState<Property[]>(SAMPLE_PROPERTIES);
  const [userProperties, setUserProperties] = useState<Property[]>([]); // Locally created ones

  // Search parameters bridge (Home Hero -> Listings Sidebar)
  const [activeSearchFilters, setActiveSearchFilters] = useState<{ location: string; type: string; budgetMax: number; bhk: string } | null>(null);

  // Authenticated Profile User & Savior list
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  // Load properties and auth state
  useEffect(() => {
    // Scroll to top on root mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Stream properties
    const fetchProps = async () => {
      const dbProps = await getProperties();
      setProperties(dbProps);
    };
    fetchProps();

    // Stream authenticated user
    const unsubscribeAuth = subscribeAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const favs = await getFavorites(user.uid);
        setSavedPropertyIds(favs);
      } else {
        // Hydrate from LocalStorage if guest
        const localFavsStr = localStorage.getItem("ssp_local_favorites");
        setSavedPropertyIds(localFavsStr ? JSON.parse(localFavsStr) : []);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Update favorites lists
  const handleToggleSaved = async (id: string) => {
    const isSavedAlready = savedPropertyIds.includes(id);
    const userId = currentUser ? currentUser.uid : "guest-user";
    
    // Execute write to Fire/Local database
    const success = await toggleFavorite(userId, id);
    if (success) {
      if (isSavedAlready) {
        setSavedPropertyIds(prev => prev.filter(x => x !== id));
        triggerToast("Removed from saved list.", "info");
      } else {
        setSavedPropertyIds(prev => [...prev, id]);
        triggerToast("Added to saved properties!", "success");
      }
    } else {
      triggerToast("Error saving bookmark. Verify login context.", "info");
    }
  };

  // Add a newly listed property (wizard submit)
  const handleAddProperty = (newProp: Property) => {
    // 1. Add to active state feed
    setProperties(prev => [newProp, ...prev]);
    // 2. Add to creator profile collection
    setUserProperties(prev => [newProp, ...prev]);
  };

  // Orchestrate active routing changes
  const handleNavigation = (view: string, targetPropertyId?: string) => {
    if (view === "properties" && !targetPropertyId) {
      // Clear filters when clicking "Properties" directly
      setActiveSearchFilters(null);
    }
    
    setCurrentView(view);
    if (targetPropertyId) {
      setSelectedPropertyId(targetPropertyId);
    } else {
      setSelectedPropertyId(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Trigger search submit redirection
  const handleSearchTrigger = (searchFilters: { location: string; type: string; budgetMax: number; bhk: string }) => {
    setActiveSearchFilters(searchFilters);
    setCurrentView("properties");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Launch clean dynamic visual confirmation toast alert
  const triggerToast = (msg: string, type: "success" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    
    // Auto-clear
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Get active selected property details computed
  const getSelectedProperty = (): Property | null => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  };

  const selectedProperty = getSelectedProperty();

  return (
    <div className="bg-[#0F172A] min-h-screen text-slate-100 font-sans flex flex-col justify-between">
      
      {/* GLOBAL TOAST FLOATING BANNER */}
      <Notification 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage(null)} 
      />

      {/* HEADER DESKTOP / STICKY HEADER */}
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigation} 
        savedCount={savedPropertyIds.length} 
      />

      {/* MAIN SCREEN WORKSPACE CONTAINER */}
      <div className="flex-grow">
        {currentView === "home" && (
          <HomeView 
            properties={properties} 
            onNavigate={handleNavigation} 
            onSearch={handleSearchTrigger}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
          />
        )}

        {currentView === "properties" && !selectedProperty && (
          <ListingsView 
            properties={properties} 
            initialFilters={activeSearchFilters}
            onNavigate={handleNavigation}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
          />
        )}

        {currentView === "properties" && selectedProperty && (
          <DetailView 
            property={selectedProperty} 
            allProperties={properties}
            onNavigate={handleNavigation}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
            onShowNotification={triggerToast}
          />
        )}

        {currentView === "saved" && (
          <SavedView 
            properties={properties} 
            savedProperties={savedPropertyIds} 
            onToggleSaved={handleToggleSaved}
            onNavigate={handleNavigation}
          />
        )}

        {currentView === "list_property" && (
          <ListPropertyView 
            onAddProperty={handleAddProperty} 
            onShowNotification={triggerToast}
            onNavigate={handleNavigation}
          />
        )}

        {currentView === "profile" && (
          <ProfileView 
            onNavigate={handleNavigation} 
            userProperties={userProperties}
            onShowNotification={triggerToast}
          />
        )}
      </div>

      {/* MASTER FOOTER */}
      <Footer onNavigate={handleNavigation} />

      {/* ================= TOUCH MOBILE BOTTOM TAB BAR ACTIONS ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-[#0F172A]/90 backdrop-blur-md border-t border-white/5 py-2.5 px-4 flex items-center justify-around text-center shadow-2xl select-none">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => handleNavigation("home")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${
            currentView === "home" ? "text-[#D4AF37]" : "text-slate-400"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Tab 2: Properties */}
        <button
          onClick={() => handleNavigation("properties")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${
            currentView === "properties" ? "text-[#D4AF37]" : "text-slate-400"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-[10px] font-bold">Listings</span>
        </button>

        {/* Tab 3: Post */}
        <button
          onClick={() => handleNavigation("list_property")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${
            currentView === "list_property" ? "text-[#D4AF37]" : "text-slate-400"
          }`}
        >
          <div className="h-4.5 w-4.5 bg-gradient-to-br from-[#D4AF37] to-[#B5942B] rounded flex items-center justify-center text-slate-950">
            <span className="text-sm font-black leading-none">+</span>
          </div>
          <span className="text-[10px] font-bold">Post</span>
        </button>

        {/* Tab 4: Saved */}
        <button
          onClick={() => handleNavigation("saved")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-[42px] relative ${
            currentView === "saved" ? "text-[#D4AF37]" : "text-slate-400"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {savedPropertyIds.length > 0 && (
            <span className="absolute top-[2px] right-2 h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
          )}
          <span className="text-[10px] font-bold">Saved</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => handleNavigation("profile")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${
            currentView === "profile" ? "text-[#D4AF37]" : "text-slate-400"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>

      </div>

    </div>
  );
}
