import { ClientUser } from "../firebase";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import FocusLock from "react-focus-lock";
import { Menu, X, PhoneCall, User as UserIcon, Heart, LogOut, ChevronDown, Clipboard, Shield } from "lucide-react";
import { logoutUser, subscribeAuth } from "../firebase";
import Logo from "./Logo";
import { BUSINESS_CONFIG } from "../config";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, selectedPropertyId?: string) => void;
  savedCount: number;
  onOpenAuth: () => void;
  isAdmin?: boolean;
}

const navLinks = [
  { name: "Home", view: "home" },
  { name: "Properties", view: "properties" },
  { name: "Services", view: "services_sec" },
  { name: "About", view: "about_sec" },
  { name: "Contact", view: "contact_sec" }
];

export default React.memo(function Navbar({ currentView, onNavigate, savedCount, onOpenAuth, isAdmin = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    
    // Subscribe to auth state
    const unsubscribe = subscribeAuth((usr) => {
      setUser(usr);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    onOpenAuth();
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logoutUser();
    onNavigate("home");
  };

  const handleLinkClick = (view: string) => {
    setIsMobileMenuOpen(false);
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
    <nav
      id="main-navbar"
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isScrolled 
          ? "bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-xl" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => handleLinkClick("home")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Logo size={42} className="shrink-0" />
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Shiv <span className="text-[#D4AF37] relative font-semibold">Saya<span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#B5942B]"></span></span> Properties
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isSelected = currentView === link.view;
              return (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.view)}
                  aria-current={isSelected ? "page" : undefined}
                  className="relative text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150 py-1"
                >
                  {link.name}
                  {isSelected && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => handleLinkClick("admin")}
                className={`flex items-center gap-1.5 text-sm font-bold text-[#D4AF37] hover:brightness-110 transition-all py-1 ${
                  currentView === "admin" ? "border-b-2 border-[#D4AF37] pb-0.5" : ""
                }`}
              >
                <Shield className="h-4 w-4 text-[#D4AF37]" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Saved Badges */}
            <button 
              onClick={() => handleLinkClick("saved")}
              className="relative p-2 text-slate-400 hover:text-[#D4AF37] transition-colors"
              title="Saved Properties"
            >
              <Heart className="h-[22px] w-[22px]" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md">
                  {savedCount}
                </span>
              )}
            </button>

            {/* WhatsApp CTA with Pulse */}
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.general)}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] transition-all relative group"
            >
              <div className="absolute inset-0 rounded-full bg-[#10B981]/10 animate-ping group-hover:animate-none"></div>
              <PhoneCall className="h-[18px] w-[18px]" />
            </a>

            {/* Google Authentication */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-800/40 border border-white/5 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer select-none"
                >
                  {user.photoURL ? (
                    <img width={800} height={600} src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-6 w-6 bg-slate-700 rounded-full flex items-center justify-center text-[#D4AF37] font-bold text-[10px]">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate">{user.displayName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-48 rounded-xl bg-slate-905 border border-white/10 p-1.5 shadow-2xl z-50 text-xs text-slate-300 font-sans"
                    >
                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("profile"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                        My Profile
                      </button>
                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("profile"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <Clipboard className="h-4 w-4 text-[#D4AF37]" />
                        My Listings
                      </button>
                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("saved"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20 animate-pulse" />
                        Saved Properties
                      </button>
                      <div className="border-t border-white/5 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-full transition-all cursor-pointer"
              >
                <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                Login / Signup
              </button>
            )}

            {/* List Your Property CTA */}
            <button
              onClick={() => handleLinkClick("list_property")}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-900 text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              List Your Property
            </button>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={() => handleLinkClick("saved")}
              className="relative p-2 text-slate-400"
            >
              <Heart className="h-5 w-5 text-slate-300" />
              {savedCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <FocusLock>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#0F172A] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Logo size={36} className="shrink-0" />
                    <span className="font-bold text-white text-md">Shiv Saya Properties</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Profile in Mobile */}
                <div className="mb-8 p-4 rounded-xl bg-slate-900 border border-white/5 font-sans">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
                        {user.photoURL ? (
                          <img width={800} height={600} src={user.photoURL} alt={user.displayName} className="h-10 w-10 rounded-full object-cover border border-[#D4AF37]/30" loading="lazy" />
                        ) : (
                          <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">{user.displayName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.email || "guest@shivsayaproperties.com"}</div>
                        </div>
                      </div>

                      {/* Extra authenticated options on mobile */}
                      <div className="flex flex-col gap-2.5">
                        <button 
                          onClick={() => handleLinkClick("profile")}
                          className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white font-medium text-left"
                        >
                          <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => handleLinkClick("profile")}
                          className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white font-medium text-left"
                        >
                          <Clipboard className="h-4 w-4 text-[#D4AF37]" />
                          My Listings
                        </button>
                        <button 
                          onClick={() => handleLinkClick("saved")}
                          className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white font-medium text-left"
                        >
                          <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                          Saved Properties ({savedCount})
                        </button>
                      </div>

                      <div className="border-t border-white/5 pt-2.5">
                        <button 
                          onClick={handleLogout} 
                          className="w-full py-2 hover:bg-red-500/10 border border-red-500/10 rounded-lg text-xs text-red-400 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">Access your direct-owner panel, save listings, and post properties.</p>
                      <button
                        onClick={handleLogin}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-xs font-black text-slate-950 rounded-lg transition-all cursor-pointer"
                      >
                        <UserIcon className="h-4 w-4" />
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>

                {/* Menu items */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => {
                    const isSelected = currentView === link.view;
                    return (
                    <button
                      key={link.name}
                      onClick={() => handleLinkClick(link.view)}
                      aria-current={isSelected ? "page" : undefined}
                      className="text-left py-2 text-base font-medium text-slate-300 hover:text-white border-b border-white/5"
                    >
                      {link.name}
                    </button>
                    )
                  })}

                  {isAdmin && (
                    <button
                      onClick={() => handleLinkClick("admin")}
                      className="text-left py-2 text-base font-bold text-[#D4AF37] flex items-center gap-2 border-b border-white/5"
                    >
                      <Shield className="h-5 w-5 text-[#D4AF37]" />
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Active CTA items */}
              <div className="flex flex-col gap-3 mt-6 border-t border-white/5 pt-6">
                <button
                  onClick={() => handleLinkClick("list_property")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-900 text-sm font-bold text-center shadow-md shadow-[#D4AF37]/10"
                >
                  List Your Property
                </button>
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.general)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="w-full py-3 rounded-xl bg-[#10B981] text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </FocusLock>
        )}
      </AnimatePresence>
    </nav>
  );
});
