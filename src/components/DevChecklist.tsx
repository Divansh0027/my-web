import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, X, CheckSquare, Server, FileText, Globe, Users, Check } from "lucide-react";

interface ChecklistState {
  [key: string]: boolean;
}

const SECTIONS = [
  {
    id: "firebase",
    title: "FIREBASE INTEGRATION",
    icon: Server,
    items: [
      { id: "fb_project", label: "Firebase project created" },
      { id: "fb_auth", label: "Authentication enabled (Email + Google)" },
      { id: "fb_firestore", label: "Firestore database active" },
      { id: "fb_storage", label: "Storage bucket enabled" },
      { id: "fb_rules", label: "firestore.rules deployed" },
      { id: "fb_api_keys", label: "API key restricted in Google Console" },
    ],
  },
  {
    id: "content",
    title: "CONTENT & DETAILS",
    icon: FileText,
    items: [
      { id: "c_whatsapp", label: "WhatsApp number updated in config.ts" },
      { id: "c_rera", label: "RERA number updated in config.ts" },
      { id: "c_address", label: "Business address updated in config.ts" },
      { id: "c_listings", label: "Real property listings added" },
      { id: "c_sample", label: "Sample test data removed" },
      { id: "c_testimonials", label: "Real client testimonials added" },
    ],
  },
  {
    id: "deployment",
    title: "DEPLOYMENT PIPELINE",
    icon: Globe,
    items: [
      { id: "d_account", label: "Vercel account created" },
      { id: "d_repo", label: "GitHub repo connected to Vercel" },
      { id: "d_env", label: "Environment variables added in Vercel" },
      { id: "d_godaddy", label: "GoDaddy domain connected to Vercel" },
      { id: "d_ssl", label: "SSL active on custom domain" },
      { id: "d_domain", label: "Site loads at custom domain correctly" },
    ],
  },
  {
    id: "admin",
    title: "ADMINISTRATIVE CONTROL",
    icon: Users,
    items: [
      { id: "a_emails", label: "Admin email added to ADMIN_EMAILS" },
      { id: "a_login", label: "Admin login tested successfully" },
      { id: "a_flow", label: "Approve and reject flow tested" },
      { id: "a_csv", label: "Enquiry CSV export tested" },
    ],
  },
];

const TOTAL_ITEMS = SECTIONS.reduce((acc, sec) => acc + sec.items.length, 0);

export default function DevChecklist() {
  const isDev = (import.meta as any).env?.DEV;

  // Render nothing in production
  if (!isDev) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [checkedState, setCheckedState] = useState<ChecklistState>({});

  // Hydrate on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ssp_dev_checklist");
      if (stored) {
        setCheckedState(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Error parsing ssp_dev_checklist from storage", e);
    }
  }, []);

  const handleToggle = (id: string) => {
    const newState = {
      ...checkedState,
      [id]: !checkedState[id],
    };
    setCheckedState(newState);
    localStorage.setItem("ssp_dev_checklist", JSON.stringify(newState));
  };

  const getCheckedLength = () => {
    return Object.values(checkedState).filter(Boolean).length;
  };

  const completedCount = getCheckedLength();
  const percentage = Math.round((completedCount / TOTAL_ITEMS) * 100);

  return (
    <>
      {/* Trigger floating button */}
      <button
        id="dev-checklist-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-26 left-6 z-[9999] h-12 w-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-slate-800 hover:text-white transition-all shadow-2xl active:scale-95 cursor-pointer group"
        title="Open Pre-Launch Checklist"
      >
        <Settings className="h-5 w-5 animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Slide-out Panel Overlay & Slider */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/80 z-[10000] backdrop-blur-xs"
            />

            {/* Sidebar drawer */}
            <motion.div
              id="dev-checklist-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-full sm:w-[420px] bg-slate-900 border-r border-white/5 z-[10001] shadow-2xl flex flex-col justify-between"
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-[#D4AF37]" />
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      Pre-Launch Checklist
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 px-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="p-6 bg-slate-950/50 border-b border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold leading-none">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">Launch Readiness</span>
                    <span className="text-[#D4AF37] text-[11px] font-mono">
                      {completedCount} of {TOTAL_ITEMS} complete ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Categories & Scroll List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
                  {SECTIONS.map((section) => {
                    const SecIcon = section.icon;
                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                          <SecIcon className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.5} />
                          <h3 className="text-[10px] font-extrabold tracking-widest text-white uppercase">
                            {section.title}
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {section.items.map((item) => {
                            const isChecked = !!checkedState[item.id];
                            return (
                              <label
                                key={item.id}
                                className="flex items-start gap-3 p-2 bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 rounded-xl transition-all cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggle(item.id)}
                                  className="hidden"
                                />
                                <div
                                  className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                    isChecked
                                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                                      : "border-white/15 bg-slate-950"
                                  }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span
                                  className={`text-[11px] leading-tight font-medium ${
                                    isChecked ? "text-slate-400 line-through decoration-slate-600" : "text-slate-305"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer status quote */}
                <div className="p-4 bg-slate-950 border-t border-white/5 text-[10px] text-slate-500 font-medium text-center">
                  Local Dev Session Checklist &bull; Persisting in Sandbox
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
