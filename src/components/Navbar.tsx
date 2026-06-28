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
import ThemeSwitcher from "./ThemeSwitcher";
import { BUSINESS_CONFIG } from "../config";

interface NavbarProps {
  currentUser?: any;
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

export default React.memo(function Navbar({ currentView, onNavigate, savedCount, onOpenAuth, isAdmin = false, currentUser: user }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
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
      className={`sticky top-0 z-50 transition-all duration-300 font-sans px-4 ${
        isScrolled ? "pt-2 pb-2" : "pt-6 pb-2"
      }`}
    >
      <div className={`mx-auto max-w-7xl transition-all duration-300 ${
        isScrolled 
          ? "bg-surface/85 backdrop-blur-xl border border-outline-variant/50 shadow-sm rounded-2xl px-6 py-3" 
          : "bg-transparent px-2 py-0"
      }`}>
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => handleLinkClick("home")}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Logo size={42} className="shrink-0" />
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Shiv <span className="text-gold-accent relative font-semibold">Saya<span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-accent"></span></span> Properties
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
                  className="relative text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-150 py-1"
                >
                  {link.name}
                  {isSelected && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeSwitcher />

            {/* Google Authentication */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-surface-container-high/40 border border-outline-variant/50 pl-3 pr-2 py-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer select-none"
                >
                  {user.photoURL ? (
                    <img width={800} height={600} src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-6 w-6 bg-outline-variant rounded-full flex items-center justify-center text-gold-accent font-bold text-[10px]">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-on-surface max-w-[80px] truncate">{user.displayName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-on-surface-variant transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-48 rounded-xl bg-surface border border-outline-variant p-1.5 shadow-md z-50 text-xs text-on-surface-variant font-sans"
                    >
                                            <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("profile"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                      >
                        <UserIcon className="h-4 w-4 text-gold-accent" />
                        My Profile
                      </button>
                      <button 
                        onClick={() => { setIsDropdownOpen(false); handleLinkClick("saved"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                      >
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                        Saved ({savedCount})
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => { setIsDropdownOpen(false); handleLinkClick("admin"); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors text-left cursor-pointer"
                        >
                          <Shield className="h-4 w-4 text-gold-accent" />
                          Admin Panel
                        </button>
                      )}
                      <div className="border-t border-outline-variant/50 my-1" />
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
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-high/50 hover:bg-surface-container-high border border-outline-variant rounded-full transition-all cursor-pointer"
              >
                <UserIcon className="h-4 w-4 text-gold-accent" />
                Login / Signup
              </button>
            )}

            {/* List Your Property CTA */}
            <button
              onClick={() => handleLinkClick("list_property")}
              className="px-5 py-2 rounded-full bg-gold-accent text-slate-900 text-xs font-bold shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-95 transition-all"
            >
              List Your Property
            </button>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex lg:hidden items-center gap-3">
            <button 
              onClick={() => handleLinkClick("saved")}
              className="relative p-2 text-on-surface-variant"
            >
              <Heart className="h-5 w-5 text-on-surface-variant" />
              {savedCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-on-surface">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
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
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-surface border-l border-outline-variant p-6 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Logo size={36} className="shrink-0" />
                    <span className="font-bold text-on-surface text-md">Shiv Saya Properties</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* List Your Property in Mobile Header */}
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() => handleLinkClick("list_property")}
                    className="w-full py-2.5 rounded-xl bg-gold-accent text-slate-900 text-sm font-bold text-center shadow-md shadow-gold-accent/10"
                  >
                    List Your Property
                  </button>
                </div>

                {/* Profile in Mobile */}
                <div className="mb-8 p-4 rounded-xl bg-surface-container border border-outline-variant/50 font-sans">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-3.5">
                        {user.photoURL ? (
                          <img width={800} height={600} src={user.photoURL} alt={user.displayName} className="h-10 w-10 rounded-full object-cover border border-gold-accent/30" loading="lazy" />
                        ) : (
                          <div className="h-10 w-10 bg-surface-container-high rounded-full flex items-center justify-center text-gold-accent font-bold text-sm">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-on-surface text-xs truncate">{user.displayName}</div>
                          <div className="text-[10px] text-on-surface-variant truncate">{user.email || "guest@shivsayaproperties.com"}</div>
                        </div>
                      </div>

                      {/* Extra authenticated options on mobile */}
                      <div className="flex flex-col gap-2.5">
                        <button 
                          onClick={() => handleLinkClick("profile")}
                          className="flex items-center gap-2.5 text-xs text-on-surface-variant hover:text-on-surface font-medium text-left"
                        >
                          <UserIcon className="h-4 w-4 text-gold-accent" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => handleLinkClick("profile")}
                          className="flex items-center gap-2.5 text-xs text-on-surface-variant hover:text-on-surface font-medium text-left"
                        >
                          <Clipboard className="h-4 w-4 text-gold-accent" />
                          My Listings
                        </button>
                        <button 
                          onClick={() => handleLinkClick("saved")}
                          className="flex items-center gap-2.5 text-xs text-on-surface-variant hover:text-on-surface font-medium text-left"
                        >
                          <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                          Saved Properties ({savedCount})
                        </button>
                      </div>

                      <div className="border-t border-outline-variant/50 pt-2.5">
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
                      <p className="text-xs text-on-surface-variant mb-3.5 leading-relaxed">Access your direct-owner panel, save listings, and post properties.</p>
                      <button
                        onClick={handleLogin}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-gold-accent text-xs font-black text-[#0F172A] rounded-lg transition-all cursor-pointer"
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
                      className="text-left py-2 text-base font-medium text-on-surface-variant hover:text-on-surface border-b border-outline-variant/50"
                    >
                      {link.name}
                    </button>
                    )
                  })}

                  {isAdmin && (
                    <button
                      onClick={() => handleLinkClick("admin")}
                      className="text-left py-2 text-base font-bold text-gold-accent flex items-center gap-2 border-b border-outline-variant/50"
                    >
                      <Shield className="h-5 w-5 text-gold-accent" />
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Active CTA items */}
              <div className="flex flex-col gap-3 mt-6 border-t border-outline-variant/50 pt-6">
                <div className="flex justify-between items-center bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2">
                  <span className="text-sm font-semibold text-on-surface-variant">Theme</span>
                  <ThemeSwitcher />
                </div>
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.general)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="w-full py-3 rounded-xl bg-success-green text-on-surface text-sm font-bold flex items-center justify-center gap-2"
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
