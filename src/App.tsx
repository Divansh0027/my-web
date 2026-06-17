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
import { 
  subscribeProperties, 
  getFavorites, 
  toggleFavorite, 
  subscribeAuth, 
  addProperty, 
  isAdminUser, 
  updatePropertyInDb, 
  deletePropertyFromDb,
  subscribeRemoteAdmins,
  subscribeRemoteControls,
  subscribeRemoteSettings
} from "./firebase";
import { Property } from "./types";
import { SAMPLE_PROPERTIES } from "./data/sampleData";
import LoginModal from "./components/LoginModal";
import AdminView from "./components/AdminView";
import ErrorBoundary from "./components/ErrorBoundary";
import DevChecklist from "./components/DevChecklist";
import { BUSINESS_CONFIG } from "./config";

export default function App() {
  // Loading states & controls
  const [isAppReady, setIsAppReady] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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

  const [adminsList, setAdminsList] = useState<string[]>([]);

  // Synchronize admin status reactively when user or admins list changes (H7 Fix)
  useEffect(() => {
    if (currentUser && currentUser.email) {
      const isUserAdmin = adminsList.some(email => email.toLowerCase() === currentUser.email.toLowerCase());
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser, adminsList]);

  // Load properties and auth state
  useEffect(() => {
    // Scroll to top on root mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Stream properties via onSnapshot
    const unsubscribeProperties = subscribeProperties((dbProps) => {
      setProperties(dbProps);
    });

    // Stream operational controls / maintenance blocks live from Firestore (Issue 8)
    const unsubscribeControls = subscribeRemoteControls((controls) => {
      setMaintenanceMode(!!(controls.maintenanceMode || controls.offlineMaintenance));
    });

    // Stream remote settings dynamically (Issue 11)
    const unsubscribeSettings = subscribeRemoteSettings((settings) => {
      if (settings && typeof settings === "object") {
        // Hydrate config parameters at runtime securely (C7 Fix)
        try {
          const allowedKeys = [
            "whatsappNumber", 
            "businessName", 
            "consultantName", 
            "businessEmail", 
            "businessPhone", 
            "businessAddress", 
            "reraNumber"
          ];
          allowedKeys.forEach(key => {
            if (settings[key] !== undefined && typeof settings[key] === "string") {
              (BUSINESS_CONFIG as any)[key] = settings[key];
            }
          });
        } catch (_) {}
      }
    });

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
      setIsAppReady(true);
    });

    // Stream dynamic admins list to update authorization state on snapshot (Issue 3)
    const unsubscribeAdmins = subscribeRemoteAdmins((admins) => {
      setAdminsList(admins);
    });

    return () => {
      unsubscribeProperties();
      unsubscribeControls();
      unsubscribeSettings();
      unsubscribeAuth();
      unsubscribeAdmins();
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
    
    // Force status: pending for non-admins (Issue 10)
    if (!isFromAdmin) {
      completedProp.status = "pending";
    } else if (!completedProp.status) {
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

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative h-16 w-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Shiv Saya Properties
        </h1>
        <p className="text-xs text-slate-400 font-semibold animate-pulse">
          Loading your experience...
        </p>
      </div>
    );
  }

  const bypassMaintenance = isAdmin;

  if (maintenanceMode && !bypassMaintenance) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans flex items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="flex flex-col items-center text-center space-y-6 max-w-lg px-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-x-0 -top-4 bottom-0 rounded-full bg-[#D4AF37]/5 blur-3xl"></div>
            <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-[#D4AF37] flex items-center justify-center animate-spin-slow">
              <svg className="h-10 w-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">We'll Be Right Back</h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Shiv Saya Properties is currently undergoing scheduled maintenance.
            </p>
            <p className="text-xs text-slate-405 font-semibold max-w-sm">
              Our team is working to improve your experience. We'll be back shortly!
            </p>
          </div>
          <div className="pt-4">
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hi`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-98 shadow-lg"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Have questions? Email us at <a href={`mailto:${BUSINESS_CONFIG.businessEmail}`} className="text-[#D4AF37] hover:underline">{BUSINESS_CONFIG.businessEmail}</a>
          </p>
        </div>
      </div>
    );
  }

  if (currentView === "admin" && isAdmin) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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

        {/* MAIN SCREEN WORKSPACE CONTAINER WITH WRAPPED ERROR BOUNDARY */}
        <ErrorBoundary>
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
        </ErrorBoundary>

        {/* MASTER FOOTER */}
        <Footer onNavigate={handleNavigation} />

        {/* FLOATING DEVELOPER PRE-LAUNCH CHECKLIST */}
        <DevChecklist />

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
    </ErrorBoundary>
  );
}
