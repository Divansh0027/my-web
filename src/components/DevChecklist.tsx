import { useState, useEffect } from "react";
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

  if (!isDev) {
    return null;
  }

  return (
    <>
      {/* Trigger floating button */}
      <button
        id="dev-checklist-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-26 left-6 z-[9999] h-12 w-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-gold-accent hover:bg-surface-container-high hover:text-on-surface transition-all shadow-md active:scale-95 cursor-pointer group"
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
              className="fixed inset-0 bg-surface/80 z-[10000] backdrop-blur-xs"
            />

            {/* Sidebar drawer */}
            <motion.div
              id="dev-checklist-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-full sm:w-[420px] bg-surface-container border-r border-outline-variant/50 z-[10001] shadow-md flex flex-col justify-between"
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-gold-accent" />
                    <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">
                      Pre-Launch Checklist
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 px-2 hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="p-6 bg-surface/50 border-b border-outline-variant/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold leading-none">
                    <span className="text-on-surface-variant uppercase tracking-widest text-[9px]">Launch Readiness</span>
                    <span className="text-gold-accent text-[11px] font-mono">
                      {completedCount} of {TOTAL_ITEMS} complete ({percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-accent to-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Categories & Scroll List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
                  {SECTIONS.map((section) => {
                    const SecIcon = section.icon;
                    if (!isDev) {
    return null;
  }

  return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/50">
                          <SecIcon className="h-3.5 w-3.5 text-gold-accent" strokeWidth={2.5} />
                          <h3 className="text-[10px] font-extrabold tracking-widest text-on-surface uppercase">
                            {section.title}
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {section.items.map((item) => {
                            const isChecked = !!checkedState[item.id];
                            if (!isDev) {
    return null;
  }

  return (
                              <label
                                htmlFor={`checklist-item-${item.id}`}
                                key={item.id}
                                className="flex items-start gap-3 p-2 bg-surface/30 hover:bg-surface/60 border border-outline-variant/50 rounded-xl transition-all cursor-pointer select-none"
                              >
                                <input
                                  id={`checklist-item-${item.id}`}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggle(item.id)}
                                  className="hidden"
                                />
                                <div
                                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                    isChecked
                                      ? "border-gold-accent bg-gold-accent/10 text-gold-accent"
                                      : "border-outline-variant bg-surface"
                                  }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span
                                  className={`text-[11px] leading-tight font-medium ${
                                    isChecked ? "text-on-surface-variant line-through decoration-slate-600" : "text-slate-305"
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

                {/* Footer status quote & Links */}
                <div className="p-4 bg-surface border-t border-outline-variant/50 flex flex-col gap-3">
                  <div className="flex gap-2 justify-center">
                     <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[10px] text-gold-accent hover:underline flex items-center gap-1">
                       <Server className="h-3 w-3" /> Firebase
                     </a>
                     <span className="text-outline-variant">&bull;</span>
                     <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[10px] text-on-surface hover:underline flex items-center gap-1">
                       <Globe className="h-3 w-3" /> Vercel
                     </a>
                     <span className="text-outline-variant">&bull;</span>
                     <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[10px] text-on-surface-variant hover:underline flex items-center gap-1">
                       <Globe className="h-3 w-3" /> GitHub
                     </a>
                  </div>
                  <div className="text-[10px] text-outline font-medium text-center">
                    Local Dev Session Checklist &bull; Persisting in Sandbox
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
