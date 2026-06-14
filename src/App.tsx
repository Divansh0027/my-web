/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ListingsView from "./components/ListingsView";
import DetailView from "./components/DetailView";
import SavedView from "./components/SavedView";
import ListPropertyView from "./components/ListPropertyView";
import ProfileView from "./components/ProfileView";
import Notification from "./components/Notification";
import { subscribeProperties, getFavorites, toggleFavorite, subscribeAuth, addProperty, isAdminUser, updatePropertyInDb, deletePropertyFromDb } from "./firebase";
import { Property } from "./types";
import { SAMPLE_PROPERTIES } from "./data/sampleData";
import LoginModal from "./components/LoginModal";
import AdminView from "./components/AdminView";

export default function App() {
  // Routing & View Managers
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Authenticated Profile User & Savior list
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Auth state modal triggers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectView, setRedirectView] = useState<string | null>(null);

  // Unified Database properties
  const [properties, setProperties] = useState<Property[]>(SAMPLE_PROPERTIES);
  const [userProperties, setUserProperties] = useState<Property[]>([]); // Locally created ones

  // Search parameters bridge (Home Hero -> Listings Sidebar)
  const [activeSearchFilters, setActiveSearchFilters] = useState<{ location: string; type: string; budgetMax: number; bhk: string } | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  // Track user listings dynamically on properties changes or auth state changes
  useEffect(() => {
    if (currentUser) {
      const filtered = properties.filter(p => (p as any).userId === currentUser.uid);
      setUserProperties(filtered);
    } else {
      setUserProperties([]);
    }
  }, [properties, currentUser]);

  // Load properties and auth state
  useEffect(() => {
    // Scroll to top on root mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Stream properties via onSnapshot
    const unsubscribeProperties = subscribeProperties((dbProps) => {
      setProperties(dbProps);
    });

    // Stream authenticated user
    const unsubscribeAuth = subscribeAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const favs = await getFavorites(user.uid);
        setSavedPropertyIds(favs);
        const adminCheck = isAdminUser(user.email);
        setIsAdmin(adminCheck);
      } else {
        // Hydrate from LocalStorage if guest
        const localFavsStr = localStorage.getItem("ssp_local_favorites");
        setSavedPropertyIds(localFavsStr ? JSON.parse(localFavsStr) : []);
        setIsAdmin(false);
      }
    });

    return () => {
      unsubscribeProperties();
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
  const handleAddProperty = async (newProp: Property) => {
    // Incorporate user details and auto status settings as per FIX 4
    const docId = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const completedProp: Property = {
      ...newProp,
      id: docId,
      status: "pending" as any, // Default pending status
      postedDate: new Date().toISOString().split("T")[0],
      postedBy: "Owner",
    };

    // Store custom userId, userEmail, userName for query filtering and administrative purposes
    (completedProp as any).userId = currentUser?.uid || "guest-user";
    (completedProp as any).userEmail = currentUser?.email || "guest@shivsayaproperties.com";
    (completedProp as any).userName = currentUser?.displayName || "Guest User";
    (completedProp as any).createdAt = new Date().toISOString();

    const success = await addProperty(completedProp);
    if (success) {
      // Opt-in UI optimizations
      setProperties(prev => [completedProp, ...prev]);
      setUserProperties(prev => [completedProp, ...prev]);
      triggerToast("Your property has been successfully listed and is pending review!", "success");
    } else {
      triggerToast("Listing failed. Verify network connection and try again.", "error");
    }
  };

  // Toggle Property status between "live" and "pending"
  const handleToggleApprovalInApp = async (id: string) => {
    const matched = properties.find(p => p.id === id);
    if (!matched) return;
    const nextStatus = matched.status === "live" ? "pending" : "live";
    const updated = { ...matched, status: nextStatus };
    const success = await updatePropertyInDb(updated);
    if (success) {
      setProperties(prev => prev.map(p => p.id === id ? updated : p));
      triggerToast(`Listing status updated to ${nextStatus}!`, "success");
    } else {
      triggerToast("Failed to modify verification status.", "error");
    }
  };

  // Delete a property listing
  const handleDeletePropertyInApp = async (id: string) => {
    const success = await deletePropertyFromDb(id);
    if (success) {
      setProperties(prev => prev.filter(p => p.id !== id));
      triggerToast("Real estate listing permanently removed.", "success");
    } else {
      triggerToast("Errored on deletion request.", "error");
    }
  };

  // Modify property details
  const handleUpdatePropertyInApp = async (updated: Property) => {
    const success = await updatePropertyInDb(updated);
    if (success) {
      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
      triggerToast("Property credentials updated with live index.", "success");
    } else {
      triggerToast("Modification was not accepted by sync server.", "error");
    }
  };

  const handleAddPropertyInApp = async (newProp: Property) => {
    const isFromAdmin = currentView === "admin";
    const completedProp: Property = {
      postedDate: new Date().toISOString().split("T")[0],
      postedBy: isFromAdmin ? "Admin Hub" : "Owner",
      ...newProp,
    };
    if (!completedProp.id) {
      completedProp.id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (!completedProp.status) {
      completedProp.status = "pending";
    }

    const success = await addProperty(completedProp);
    if (success) {
      setProperties(prev => [completedProp, ...prev]);
      if (!isFromAdmin) {
        setUserProperties(prev => [completedProp, ...prev]);
        triggerToast("Your property has been successfully listed and is pending review!", "success");
      } else {
        triggerToast("Direct admin asset database listing created!", "success");
      }
    } else {
      triggerToast("Errored on registry request. Check connection.", "error");
    }
  };

  const handleAuthSuccess = (user: any, welcomeMsg: string) => {
    setCurrentUser(user);
    triggerToast(welcomeMsg, "success");
    const adminCheck = isAdminUser(user?.email);
    setIsAdmin(adminCheck);
    if (redirectView) {
      setCurrentView(redirectView);
      setRedirectView(null);
    }
  };

  // Orchestrate active routing changes (with dynamic Auth Guards)
  const handleNavigation = (view: string, targetPropertyId?: string) => {
    if (view === "admin" && !isAdmin) {
      triggerToast("Access Denied: Administrative credentials required.", "info");
      return;
    }

    const isProtected = view === "list_property" || view === "profile";
    if (isProtected && !currentUser) {
      setRedirectView(view);
      setIsLoginModalOpen(true);
      triggerToast("Authentication is required to access this resource.", "info");
      return;
    }

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
  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  // Get active selected property details computed
  const getSelectedProperty = (): Property | null => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  };

  const selectedProperty = getSelectedProperty();

  if (currentView === "admin" && isAdmin) {
    return (
      <div className="bg-[#0F172A] min-h-screen text-slate-100 font-sans flex flex-col justify-between">
        {/* GLOBAL TOAST FLOATING BANNER */}
        <Notification 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />
        <AdminView 
          currentView={currentView}
          onNavigate={handleNavigation}
          properties={properties}
          onToggleApproval={handleToggleApprovalInApp}
          onDeleteProperty={handleDeletePropertyInApp}
          onUpdateProperty={handleUpdatePropertyInApp}
          onAddProperty={handleAddPropertyInApp}
          onShowNotification={triggerToast}
        />
      </div>
    );
  }

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
        onOpenAuth={() => setIsLoginModalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* SECURE LIGHTWEIGHT AUTH OVERLAY LOGIN PORTAL */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* MAIN SCREEN WORKSPACE CONTAINER */}
      <div className="flex-grow">
        {currentView === "home" && (
          <HomeView 
            properties={properties.filter(p => !p.status || (p.status !== "pending" && p.status !== "rejected"))} 
            onNavigate={handleNavigation} 
            onSearch={handleSearchTrigger}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
          />
        )}

        {currentView === "properties" && !selectedProperty && (
          <ListingsView 
            properties={properties.filter(p => !p.status || (p.status !== "pending" && p.status !== "rejected"))} 
            initialFilters={activeSearchFilters}
            onNavigate={handleNavigation}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
          />
        )}

        {currentView === "properties" && selectedProperty && (
          <DetailView 
            property={selectedProperty} 
            allProperties={properties.filter(p => !p.status || (p.status !== "pending" && p.status !== "rejected"))}
            onNavigate={handleNavigation}
            savedProperties={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
            onShowNotification={triggerToast}
          />
        )}

        {currentView === "saved" && (
          <SavedView 
            properties={properties.filter(p => !p.status || (p.status !== "pending" && p.status !== "rejected"))} 
            savedProperties={savedPropertyIds} 
            onToggleSaved={handleToggleSaved}
            onNavigate={handleNavigation}
          />
        )}

        {currentView === "list_property" && (
          <ListPropertyView 
            onAddProperty={handleAddPropertyInApp} 
            onShowNotification={triggerToast}
            onNavigate={handleNavigation}
          />
        )}

        {currentView === "profile" && (
          <ProfileView 
            onNavigate={handleNavigation} 
            userProperties={userProperties}
            onShowNotification={triggerToast}
            allProperties={properties}
            savedPropertyIds={savedPropertyIds}
            onToggleSaved={handleToggleSaved}
            onDeleteProperty={handleDeletePropertyInApp}
          />
        )}
      </div>

      {/* MASTER FOOTER */}
      <Footer onNavigate={handleNavigation} />

      {/* ================= TOUCH MOBILE BOTTOM TAB BAR ACTIONS ================= */}
      {currentView !== "admin" && (
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
      )}

    </div>
  );
}
