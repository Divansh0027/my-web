/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import Notification from "./components/Notification";
import { useAuth } from "./context/AuthContext";
import { 
  subscribeProperties, 
  getFavorites, 
  toggleFavorite, 
  addProperty, 
  updatePropertyInDb, 
  deletePropertyFromDb,
  subscribeRemoteControls,
  subscribeRemoteSettings,
  logAdminAction
} from "./firebase";
import { Property, ModerationStatus } from "./types";
import LoginModal from "./components/LoginModal";
import ErrorBoundary from "./components/ErrorBoundary";
import { BUSINESS_CONFIG } from "./config";

const ListingsView = React.lazy(() => import("./components/ListingsView"));
const DetailView = React.lazy(() => import("./components/DetailView"));
const SavedView = React.lazy(() => import("./components/SavedView"));
const ListPropertyView = React.lazy(() => import("./components/ListPropertyView"));
const ProfileView = React.lazy(() => import("./components/ProfileView"));
const AdminView = React.lazy(() => import("./components/AdminView"));
const DevChecklist = import.meta.env.DEV ? React.lazy(() => import("./components/DevChecklist")) : () => null;

export default function App() {
  // Loading states & controls
  const [isAppReady, setIsAppReady] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Routing & View Managers
  const navigate = useNavigate();
  const location = useLocation();

  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/properties") return "properties";
    if (path.startsWith("/property/")) return "properties";
    if (path === "/saved") return "saved";
    if (path === "/list-property") return "list_property";
    if (path === "/profile") return "profile";
    if (path === "/admin") return "admin";
    return "home";
  }, [location.pathname]);

  const selectedPropertyId = useMemo(() => {
    if (location.pathname.startsWith("/property/")) {
      return location.pathname.split("/property/")[1];
    }
    return null;
  }, [location.pathname]);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Launch clean dynamic visual confirmation toast alert
  const triggerToast = useCallback((msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  // Authenticated Profile User & Savior list
  const { currentUser, isAdmin } = useAuth();
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  
  // Auth state modal triggers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const getRedirectView = () => sessionStorage.getItem("redirectView");
  const setRedirectView = (view: string | null) => {
    if (view) {
      sessionStorage.setItem("redirectView", view);
    } else {
      sessionStorage.removeItem("redirectView");
    }
  };

  // Unified Database properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [userProperties, setUserProperties] = useState<Property[]>([]); // Locally created ones

  // Derived visible properties securely memoized (H12 Fix)
  const visibleProperties = useMemo(() => {
    return properties.filter(p => !p.moderationStatus || (p.moderationStatus !== "pending" && p.moderationStatus !== "rejected"));
  }, [properties]);

  // Search parameters bridge (Home Hero -> Listings Sidebar)
  const [activeSearchFilters, setActiveSearchFilters] = useState<{ query?: string; location: string; type: string; budgetMax: number; bhk: string } | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  // Track user listings dynamically on properties changes or auth state changes
  useEffect(() => {
    if (currentUser) {
      const filtered = properties.filter(p => p.userId === currentUser.uid);
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
      setIsLoadingProperties(false);
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
              (BUSINESS_CONFIG as Record<string, string>)[key] = settings[key];
            }
          });
        } catch (_) {}
      }
    });

    // Stream authenticated user
    try {
      if (currentUser) {
        getFavorites(currentUser.uid).then(favs => {
          setSavedPropertyIds(favs);
          
          const redirectView = getRedirectView();
          if (redirectView) {
            if (redirectView === "list_property") navigate("/list-property");
            else if (redirectView === "profile") navigate("/profile");
            else if (redirectView === "admin") navigate("/admin");
            else if (redirectView === "saved") navigate("/saved");
            else navigate("/");
            setRedirectView(null);
          }
        });
      } else {
        // Hydrate from LocalStorage if guest
        const localFavsStr = localStorage.getItem("ssp_local_favorites");
        setSavedPropertyIds(localFavsStr ? JSON.parse(localFavsStr) : []);
      }
      setIsAppReady(true);
    } catch (authSetupErr) {
      console.warn("Auth processing skipped:", authSetupErr);
      setIsAppReady(true);
    }

    // Safety net: if auth takes more than 8 seconds,
    // show the app in guest mode anyway so users are
    // never stuck on the loading screen forever
    const safetyTimer = setTimeout(() => {
      setIsAppReady(prev => {
        if (!prev) {
          console.warn(
            "[Shiv Saya] Auth timeout. " +
            "Showing app in guest mode."
          );
          return true;
        }
        return prev;
      });
    }, 8000);

    return () => {
      unsubscribeProperties();
      unsubscribeControls();
      unsubscribeSettings();
      clearTimeout(safetyTimer);
    };
  }, []);

  // Update favorites lists
  const handleToggleSaved = useCallback(async (id: string) => {
    try {
      const isSavedAlready = savedPropertyIds.includes(id);
      const userId = currentUser ? currentUser.uid : "guest-user";
      const success = await toggleFavorite(userId, id);
      if (success) {
        if (isSavedAlready) {
          setSavedPropertyIds(prev => prev.filter(x => x !== id));
          triggerToast("Removed from saved.", "info");
        } else {
          setSavedPropertyIds(prev => [...prev, id]);
          triggerToast("Added to saved!", "success");
        }
      } else {
        triggerToast("Error saving bookmark.", "error");
      }
    } catch (err) {
      console.warn("handleToggleSaved error:", err);
      triggerToast("Error saving bookmark.", "error");
    }
  }, [savedPropertyIds, currentUser, triggerToast]);

  // Toggle Property status between "live" and "pending"
  const handleToggleApprovalInApp = async (id: string, customReason?: string) => {
    try {
      const matched = properties.find(p => p.id === id);
      if (!matched) return;
      const nextStatus = matched.moderationStatus === "live" 
        ? "pending" 
        : matched.moderationStatus === "rejected" 
          ? "pending" 
          : "live";

      const reason = customReason || "Admin status toggle";

      const updated = { 
        ...matched, 
        moderationStatus: nextStatus as ModerationStatus,
        verified: nextStatus === "live",
        auditLog: [
          ...(matched.auditLog || []),
          {
             action: `Status changed to ${nextStatus}`,
             reason: reason,
             timestamp: new Date().toISOString(),
             user: currentUser?.email || "Unknown Admin"
          }
        ]
      };
      const success = await updatePropertyInDb(updated);
      if (success) {
        setProperties(prev => prev.map(p => p.id === id ? updated : p));
        triggerToast(`Listing status updated to ${nextStatus}!`, "success");
        if (currentUser?.email) {
          logAdminAction("approve/toggle_status", id, currentUser.email, { moderationStatus: nextStatus, reason });
        }
      } else {
        triggerToast("Failed to modify status. Try again.", "error");
      }
    } catch (err) {
      console.warn("handleToggleApproval error:", err);
      triggerToast("Unexpected error. Try again.", "error");
    }
  };

  // Delete a property listing
  const handleDeletePropertyInApp = async (id: string) => {
    try {
      if (!properties.some(p => p.id === id)) {
        triggerToast("Property not found.", "error");
        return;
      }
      const success = await deletePropertyFromDb(id);
      if (success) {
        setProperties(prev => prev.filter(p => p.id !== id));
        triggerToast("Property listing removed.", "success");
        if (currentUser?.email) {
          logAdminAction("delete_property", id, currentUser.email);
        }
      } else {
        triggerToast("Failed to delete. Try again.", "error");
      }
    } catch (err) {
      console.warn("handleDeleteProperty error:", err);
      triggerToast("Unexpected error. Try again.", "error");
    }
  };

  // Modify property details
  const handleUpdatePropertyInApp = async (updated: Property) => {
    try {
      const success = await updatePropertyInDb(updated);
      if (success) {
        setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
        triggerToast("Property updated.", "success");
        if (currentUser?.email) {
          logAdminAction("update_property", updated.id, currentUser.email, { status: updated.moderationStatus || "unknown" });
        }
      } else {
        triggerToast("Failed to update. Try again.", "error");
      }
    } catch (err) {
      console.warn("handleUpdateProperty error:", err);
      triggerToast("Unexpected error. Try again.", "error");
    }
  };

  const handleAddProperty = async (newProp: Property, options?: { postedBy?: string; forceStatus?: string }) => {
    const isFromAdmin = currentView === "admin";
    const completedProp: Property = {
      ...newProp,
    };
    completedProp.postedDate = newProp.postedDate || new Date().toISOString().split("T")[0];
    const postedByOverride = options?.postedBy || newProp.postedBy || (isFromAdmin ? "Admin Hub" : "Owner");
    if (postedByOverride === "Owner" || postedByOverride === "Agent" || postedByOverride === "Builder") {
      completedProp.postedBy = postedByOverride;
    } else {
      completedProp.postedBy = "Agent";
      completedProp.customPostedBy = postedByOverride;
    }
    if (!completedProp.id) {
      completedProp.id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Store user ID mapping for visibility in user profile
    completedProp.userId = currentUser?.uid || "guest-user";
    completedProp.userEmail = currentUser?.email || "guest@shivsayaproperties.com";
    completedProp.userName = currentUser?.displayName || "Guest User";
    completedProp.createdAt = new Date().toISOString();
    
    // Force status: pending for non-admins (Issue 10)
    if (options?.forceStatus) {
      completedProp.moderationStatus = options.forceStatus as ModerationStatus;
    } else if (!isFromAdmin) {
      completedProp.moderationStatus = "pending";
    } else if (!completedProp.moderationStatus) {
      completedProp.moderationStatus = "pending";
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

  const handleNavigation = useCallback((view: string, targetPropertyId?: string) => {
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
    
    if (view === "home") navigate("/");
    else if (view === "properties" && targetPropertyId) navigate(`/property/${targetPropertyId}`);
    else if (view === "properties") navigate("/properties");
    else if (view === "saved") navigate("/saved");
    else if (view === "list_property") navigate("/list-property");
    else if (view === "profile") navigate("/profile");
    else if (view === "admin") navigate("/admin");
    else navigate("/");
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isAdmin, currentUser, navigate, triggerToast]);

  // Trigger search submit redirection
  const handleSearchTrigger = useCallback((searchFilters: { query?: string; location: string; type: string; budgetMax: number; bhk: string }) => {
    setActiveSearchFilters(searchFilters);
    navigate("/properties");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  // Get active selected property details computed
  const selectedProperty = React.useMemo(() => properties.find(p => p.id === selectedPropertyId) || null, [properties, selectedPropertyId]);

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="relative h-16 w-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gold-accent/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-gold-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold text-on-surface tracking-wide mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Shiv Saya Properties
        </h1>
        <p className="text-xs text-on-surface-variant font-semibold animate-pulse">
          Loading your experience...
        </p>
      </div>
    );
  }

  const bypassMaintenance = isAdmin;

  if (maintenanceMode && !bypassMaintenance) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-sans flex items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="flex flex-col items-center text-center space-y-6 max-w-lg px-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-x-0 -top-4 bottom-0 rounded-full bg-gold-accent/5 blur-3xl"></div>
            <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-gold-accent flex items-center justify-center animate-spin">
              <svg className="h-10 w-10 text-gold-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">We'll Be Right Back</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
              Shiv Saya Properties is currently undergoing scheduled maintenance.
            </p>
            <p className="text-xs text-slate-400 font-semibold max-w-sm">
              Our team is working to improve your experience. We'll be back shortly!
            </p>
          </div>
          <div className="pt-4">
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=Hi`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-accent hover:bg-gold-hover hover:scale-105 shadow-md text-[#0F172A] font-bold rounded-xl text-xs transition-all active:scale-98 shadow"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-[11px] text-outline font-medium">
            Have questions? Email us at <a href={`mailto:${BUSINESS_CONFIG.businessEmail}`} className="text-gold-accent hover:underline">{BUSINESS_CONFIG.businessEmail}</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gold-accent text-surface px-4 py-2 rounded-md z-50 font-bold">Skip to main content</a>
      <div className="bg-surface min-h-screen text-on-surface font-sans flex flex-col justify-between">
        
        {/* GLOBAL TOAST FLOATING BANNER */}
        <Notification 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage(null)} 
        />

        {/* HEADER DESKTOP / STICKY HEADER */}
        {currentView !== "admin" && (
          <Navbar 
            currentView={currentView} 
            onNavigate={handleNavigation} 
            savedCount={savedPropertyIds.length} 
            onOpenAuth={() => setIsLoginModalOpen(true)}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
        )}

        {/* SECURE LIGHTWEIGHT AUTH OVERLAY LOGIN PORTAL */}
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        {/* MAIN SCREEN WORKSPACE CONTAINER WITH WRAPPED ERROR BOUNDARY */}
        <main id="main-content" className="flex-1 flex flex-col relative w-full">
          <Suspense fallback={
            <div className="flex-grow bg-surface flex flex-col items-center justify-center p-6 text-center shadow-md min-h-[50vh]">
              <div className="relative h-12 w-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-gold-accent/20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-t-gold-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <HomeView 
                    properties={visibleProperties} 
                    isLoading={isLoadingProperties}
                    onNavigate={handleNavigation} 
                    onSearch={handleSearchTrigger}
                    savedProperties={savedPropertyIds}
                    onToggleSaved={handleToggleSaved}
                  />
                </ErrorBoundary>
              } />

              <Route path="/properties" element={
                <ErrorBoundary>
                  <ListingsView 
                    properties={visibleProperties} 
                    isLoadingData={isLoadingProperties}
                    initialFilters={activeSearchFilters}
                    onNavigate={handleNavigation}
                    savedProperties={savedPropertyIds}
                    onToggleSaved={handleToggleSaved}
                  />
                </ErrorBoundary>
              } />

              <Route path="/property/:id" element={
                <ErrorBoundary>
                  <DetailView 
                    property={selectedProperty} 
                    isLoadingData={isLoadingProperties}
                    allProperties={visibleProperties}
                    onNavigate={handleNavigation}
                    savedProperties={savedPropertyIds}
                    onToggleSaved={handleToggleSaved}
                    onShowNotification={triggerToast}
                  />
                </ErrorBoundary>
              } />

              <Route path="/saved" element={
                <ErrorBoundary>
                  <SavedView 
                    properties={visibleProperties} 
                    savedProperties={savedPropertyIds} 
                    isLoadingData={isLoadingProperties}
                    onToggleSaved={handleToggleSaved}
                    onNavigate={handleNavigation}
                    onOpenLogin={() => setIsLoginModalOpen(true)}
                  />
                </ErrorBoundary>
              } />

              <Route path="/list-property" element={
                <ErrorBoundary>
                  <ListPropertyView 
                    onAddProperty={handleAddProperty} 
                    onShowNotification={triggerToast}
                    onNavigate={handleNavigation}
                  />
                </ErrorBoundary>
              } />

              <Route path="/profile" element={
                <ErrorBoundary>
                  <ProfileView 
                    onNavigate={handleNavigation} 
                    userProperties={userProperties}
                    onShowNotification={triggerToast}
                    allProperties={properties}
                    savedPropertyIds={savedPropertyIds}
                    onToggleSaved={handleToggleSaved}
                    onDeleteProperty={handleDeletePropertyInApp}
                  />
                </ErrorBoundary>
              } />

              <Route path="/admin" element={
                <ErrorBoundary>
                  {isAdmin ? (
                    <AdminView 
                      currentView={currentView}
                      onNavigate={handleNavigation}
                      properties={properties}
                      onToggleApproval={handleToggleApprovalInApp}
                      onDeleteProperty={handleDeletePropertyInApp}
                      onUpdateProperty={handleUpdatePropertyInApp}
                      onAddProperty={handleAddProperty}
                      onShowNotification={triggerToast}
                      currentUser={currentUser}
                    />
                  ) : (
                    <div className="flex-grow flex items-center justify-center p-6 text-center text-red-500 font-bold">Access Denied</div>
                  )}
                </ErrorBoundary>
              } />
            </Routes>
          </Suspense>

          {/* MASTER FOOTER */}
          <Footer onNavigate={handleNavigation} />
        </main>

        {/* FLOATING DEVELOPER PRE-LAUNCH CHECKLIST */}
        {import.meta.env.DEV && (
          <React.Suspense fallback={null}>
            <DevChecklist />
          </React.Suspense>
        )}

        {/* ================= TOUCH MOBILE BOTTOM TAB BAR ACTIONS ================= */}
        {currentView !== "admin" && (
          <div className="lg:hidden bg-surface border-t border-outline-variant/50 py-4 px-4 flex items-center justify-around text-center select-none w-full pb-8">
            
            {/* Tab 1: Home */}
            <button
              onClick={() => handleNavigation("home")}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${
                currentView === "home" ? "text-gold-accent" : "text-on-surface-variant"
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
                currentView === "properties" ? "text-gold-accent" : "text-on-surface-variant"
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
                currentView === "list_property" ? "text-gold-accent" : "text-on-surface-variant"
              }`}
            >
              <div className="h-4 w-4 bg-gold-accent rounded flex items-center justify-center text-[#0F172A]">
                <span className="text-sm font-black leading-none">+</span>
              </div>
              <span className="text-[10px] font-bold">Post</span>
            </button>

            {/* Tab 4: Saved */}
            <button
              onClick={() => handleNavigation("saved")}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-[42px] relative ${
                currentView === "saved" ? "text-gold-accent" : "text-on-surface-variant"
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
                currentView === "profile" ? "text-gold-accent" : "text-on-surface-variant"
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
