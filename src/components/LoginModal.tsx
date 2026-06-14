/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { loginWithGoogle, loginWithEmailPassword, signUpWithEmailPassword, sendPasswordReset } from "../firebase";
import { BUSINESS_CONFIG } from "../config";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, message: string) => void;
  initialTab?: "login" | "signup";
}

export default function LoginModal({ isOpen, onClose, onSuccess, initialTab = "login" }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupAgree, setSignupAgree] = useState(false);

  // Forgot Password State
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Errors and Loading
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Reset errors & values on open
      setErrors({});
      setAuthError("");
      setShowForgotForm(false);
      setForgotSuccess("");
      setForgotError("");
      setLoginEmail("");
      setLoginPassword("");
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupAgree(false);
    }
  }, [isOpen, initialTab]);

  // Validation logic
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    // 10 digit check
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 10;
  };

  // Run dynamic validations
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === "login") {
      if (loginEmail && !validateEmail(loginEmail)) {
        newErrors.loginEmail = "Please enter a valid email address.";
      }
      if (loginPassword && loginPassword.length < 8) {
        newErrors.loginPassword = "Password must be at least 8 characters long.";
      }
    } else {
      if (signupName && signupName.length < 2) {
        newErrors.signupName = "Full Name must be at least 2 characters long.";
      }
      if (signupEmail && !validateEmail(signupEmail)) {
        newErrors.signupEmail = "Please enter a valid email address.";
      }
      if (signupPhone && !validatePhone(signupPhone)) {
        newErrors.signupPhone = "Please enter a valid 10-digit phone number.";
      }
      if (signupPassword && signupPassword.length < 8) {
        newErrors.signupPassword = "Password must be at least 8 characters long.";
      }
      if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
        newErrors.signupConfirm = "Passwords do not match.";
      }
    }
    
    setErrors(newErrors);
  }, [activeTab, loginEmail, loginPassword, signupName, signupEmail, signupPhone, signupPassword, signupConfirmPassword]);

  // Disable button determinations
  const isLoginDisabled = 
    !loginEmail || 
    !loginPassword || 
    !!errors.loginEmail || 
    !!errors.loginPassword || 
    isSubmitting;

  const isSignupDisabled = 
    !signupName || 
    !signupEmail || 
    !signupPhone || 
    !signupPassword || 
    !signupConfirmPassword || 
    !signupAgree ||
    Object.keys(errors).length > 0 || 
    isSubmitting;

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onSuccess(user, `Welcome back, ${user.displayName}!`);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginDisabled) return;

    setAuthError("");
    setIsSubmitting(true);
    try {
      const user = await loginWithEmailPassword(loginEmail, loginPassword);
      onSuccess(user, `Welcome back, ${user.displayName}!`);
      onClose();
    } catch (err: any) {
      let friendlyMessage = err.message || "Failed to login. Please try again.";
      if (friendlyMessage.includes("auth/user-not-found") || friendlyMessage.includes("user-not-found")) {
        friendlyMessage = "No matching account was found with this email.";
      } else if (friendlyMessage.includes("auth/wrong-password") || friendlyMessage.includes("wrong-password")) {
        friendlyMessage = "Incorrect password. Please verify and try again.";
      } else if (friendlyMessage.includes("auth/invalid-credential")) {
        friendlyMessage = "Invalid credentials. Please verify your email and password.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignupDisabled) return;

    setAuthError("");
    setIsSubmitting(true);
    
    // Indian formatting +91 prefix standard cleanup
    const cleanPhone = signupPhone.replace(/\D/g, "");
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;

    try {
      const user = await signUpWithEmailPassword(signupName, signupEmail, formattedPhone, signupPassword);
      onSuccess(user, "Account created successfully! Welcome to Shiv Saya Properties.");
      onClose();
    } catch (err: any) {
      let friendlyMessage = err.message || "Failed to sign up. Please try again.";
      if (friendlyMessage.includes("auth/email-already-in-use") || friendlyMessage.includes("email-already-in-use")) {
        friendlyMessage = "This email is already registered. Try logging in instead.";
      } else if (friendlyMessage.includes("auth/operation-not-allowed") || friendlyMessage.includes("operation-not-allowed")) {
        friendlyMessage = "Email/Password sign up is not enabled in your Firebase console. Please go to your Firebase Console > Authentication > Sign-in method tab, and enable 'Email/Password'.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotError("");
    setForgotSuccess("");
    setIsForgotSubmitting(true);
    try {
      await sendPasswordReset(forgotEmail);
      setForgotSuccess("Password reset link has been dispatched to your email!");
      setForgotEmail("");
    } catch (err: any) {
      let friendlyErr = err.message || "Could not dispatch password reset link.";
      if (friendlyErr.includes("auth/user-not-found") || friendlyErr.includes("user-not-found")) {
        friendlyErr = "No matching account was found with this email.";
      }
      setForgotError(friendlyErr);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="login-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 font-sans select-none">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#070b14] backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-[#0F172A] border-0 sm:border border-white/10 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-y-auto relative z-10"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-sm">
                <div>
                  <h3 className="text-white text-md font-bold">Secure Gateway</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Access your direct-to-owner panel</p>
                </div>
                <button
                  id="close-login-modal"
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-300 flex items-center justify-center transition-colors border border-white/5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Body */}
              <div className="p-6 space-y-6">
                
                {/* Auth Screen Errors */}
                {authError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs flex gap-2.5 items-start">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Tabs Switcher */}
                {!showForgotForm && (
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
                    <button
                      id="tab-login-btn"
                      onClick={() => { setActiveTab("login"); setAuthError(""); }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "login" 
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 shadow" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      id="tab-signup-btn"
                      onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "signup" 
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 shadow" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* Inner views card */}
                {!showForgotForm ? (
                  activeTab === "login" ? (
                    
                    /* ================= SIGN IN TAB VIEW ================= */
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            id="login-email-input"
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-[#D4AF37]/50 ${
                              errors.loginEmail ? "border-red-500/50" : "border-white/5"
                            }`}
                          />
                        </div>
                        {errors.loginEmail && (
                          <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.loginEmail}
                          </span>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                          <button
                            type="button"
                            onClick={() => setShowForgotForm(true)}
                            className="text-[10px] text-[#D4AF37] hover:underline font-bold"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            id="login-password-input"
                            type={showLoginPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-700 outline-none focus:border-[#D4AF37]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-500 hover:text-slate-300 flex items-center justify-center cursor-pointer"
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        id="login-submit-btn"
                        disabled={isLoginDisabled}
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 select-none cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isSubmitting ? "Authenticating Session..." : "Secure Sign-In"}
                      </button>
                    </form>
                  ) : (
                    
                    /* ================= REGISTRATION TAB VIEW ================= */
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      {/* Name */}
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            id="signup-name-input"
                            type="text"
                            required
                            placeholder={`e.g. ${BUSINESS_CONFIG.consultantName}`}
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:border-[#D4AF37]/50 ${
                              errors.signupName ? "border-red-500/50" : "border-white/5"
                            }`}
                          />
                        </div>
                        {errors.signupName && (
                          <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.signupName}
                          </span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            id="signup-email-input"
                            type="email"
                            required
                            placeholder="email@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:border-[#D4AF37]/50 ${
                              errors.signupEmail ? "border-red-500/50" : "border-white/5"
                            }`}
                          />
                        </div>
                        {errors.signupEmail && (
                          <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.signupEmail}
                          </span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Contact Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <span className="absolute left-9.5 top-3.5 text-xs text-slate-500 select-none font-bold">+91</span>
                          <input
                            id="signup-phone-input"
                            type="tel"
                            maxLength={10}
                            required
                            placeholder="99116 XXXXX"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                            className={`w-full bg-slate-950 border rounded-xl pl-19 pr-4 py-3 text-xs text-white placeholder-slate-650 outline-none focus:border-[#D4AF37]/50 ${
                              errors.signupPhone ? "border-red-500/50" : "border-[#D4AF37]/20"
                            }`}
                          />
                        </div>
                        {errors.signupPhone ? (
                          <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.signupPhone}
                          </span>
                        ) : (
                          <p className="text-[9px] text-slate-500">Must be a valid 10-digit Indian mobile number</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                              id="signup-password-input"
                              type={showSignupPassword ? "text" : "password"}
                              required
                              placeholder="Min 8 chars"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-700 outline-none focus:border-[#D4AF37]/50 ${
                                errors.signupPassword ? "border-red-500/50" : "border-white/5"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-500 hover:text-slate-300 flex items-center justify-center cursor-pointer"
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                              id="signup-confirm-input"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="Repeat check"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-700 outline-none focus:border-[#D4AF37]/50 ${
                                errors.signupConfirm ? "border-red-500/50" : "border-white/5"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-500 hover:text-slate-300 flex items-center justify-center cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {errors.signupPassword && (
                        <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.signupPassword}
                        </span>
                      )}
                      {errors.signupConfirm && !errors.signupPassword && (
                        <span className="text-[10px] text-red-400 flex gap-1 items-center font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.signupConfirm}
                        </span>
                      )}

                      {/* Agree T&C checkbox */}
                      <label className="flex items-start gap-2.5 text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer pt-1 select-none">
                        <input
                          id="signup-agree-checkbox"
                          type="checkbox"
                          checked={signupAgree}
                          onChange={(e) => setSignupAgree(e.target.checked)}
                          className="mt-0.5 rounded border-white/10 text-[#D4AF37] focus:ring-[#D4AF37]/50 h-4 w-4 bg-slate-950"
                        />
                        <span>I understand that Shiv Saya Properties performs background physical audits on listings and book consultation schedules under Indian law.</span>
                      </label>

                      {/* Submit */}
                      <button
                        id="signup-submit-btn"
                        disabled={isSignupDisabled}
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 select-none cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isSubmitting ? "Creating Credentials..." : "Access Account"}
                      </button>
                    </form>
                  )
                ) : (
                  
                  /* ================= FORGOT PASSWORD WORKFLOW FORM ================= */
                  <form onSubmit={handleForgotSubmit} className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                      <span>Reset Your Password</span>
                    </div>

                    {forgotSuccess ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs space-y-3">
                        <div className="flex gap-2 items-center font-bold">
                          <CheckCircle className="h-5 w-5" />
                          <span>Check Your Inbox</span>
                        </div>
                        <p className="leading-relaxed">Password reset link sent to your registered email! Please click on the link inside the email to configure a new password.</p>
                        <button
                          type="button"
                          onClick={() => { setShowForgotForm(false); setForgotSuccess(""); }}
                          className="w-full py-2 bg-slate-900 border border-white/10 text-[11px] font-bold rounded-lg text-slate-300 hover:text-white"
                        >
                          Return to Sign-In
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Enter your email address below, and we will send you a password reset invitation link.
                        </p>

                        {forgotError && (
                          <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs flex gap-2.5 items-start">
                            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                            <span>{forgotError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                              id="forgot-email-input"
                              type="email"
                              required
                              placeholder="Enter your email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-655 outline-none focus:border-[#D4AF37]/50 ${
                                forgotError ? "border-red-500/50" : "border-white/5"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => { setShowForgotForm(false); setForgotError(""); }}
                            className="flex-1 py-3 border border-white/10 rounded-xl text-center text-slate-400 text-xs font-bold uppercase transition-all hover:bg-white/5 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            id="forgot-submit-btn"
                            disabled={isForgotSubmitting || !forgotEmail}
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B5942B] text-slate-950 text-xs font-bold rounded-xl text-center shadow uppercase hover:brightness-110 disabled:opacity-40 cursor-pointer"
                          >
                            {isForgotSubmitting ? "Sending..." : "Send Reset Link"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* Third Party Divider OR */}
                {!showForgotForm && (
                  <div className="space-y-5 pt-1.5 border-t border-white/5">
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or Continue With</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button
                      id="google-signin-btn"
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold rounded-xl border border-white/10 shadow-lg active:scale-98 transition-all select-none cursor-pointer"
                    >
                      {/* Google G SVG */}
                      <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Sign In with Google
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Swapper Footer */}
            {!showForgotForm && (
              <div className="px-6 py-4 border-t border-white/5 bg-slate-950/40 text-center select-none">
                {activeTab === "login" ? (
                  <p className="text-xs text-slate-400">
                    Don't have an account yet?{" "}
                    <button
                      onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                      className="text-[#D4AF37] hover:underline font-bold"
                    >
                      Sign Up Free
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Already have an account?{" "}
                    <button
                      onClick={() => { setActiveTab("login"); setAuthError(""); }}
                      className="text-[#D4AF37] hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
