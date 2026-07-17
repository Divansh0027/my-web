import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Settings, CheckSquare, X, Check, Server, Globe, Shield, Paintbrush, TestTube, Share } from 'lucide-react'

type ChecklistState = Record<string, boolean>

const SECTIONS = [
  {
    id: 'visuals',
    title: 'Visual Identity',
    icon: Paintbrush,
    items: [
      { id: 'logo', label: 'Upload SVG logo & favicons' },
      { id: 'colors', label: 'Verify primary & secondary Tailwind theme palette' },
      { id: 'fonts', label: 'Verify Google Fonts loaded & weights display correctly' },
      { id: 'responsive', label: 'Test mobile navbar drawer & hero layout' },
    ],
  },
  {
    id: 'db',
    title: 'Data & Services',
    icon: Server,
    items: [
      { id: 'firebase', label: 'Configure Firebase project (Applet config JSON)' },
      { id: 'rules', label: 'Deploy secure Firestore Rules (set_up_firebase)' },
      { id: 'auth', label: 'Verify Auth providers (Email/Password & Google)' },
      { id: 'indexes', label: 'Create Firestore Composite Indexes' },
    ],
  },
  {
    id: 'security',
    title: 'Security & Access',
    icon: Shield,
    items: [
      { id: 'admin', label: 'Configure custom claims (Admin SDK)' },
      { id: 'env', label: 'Set API keys via environment variables (no hardcoding)' },
      { id: 'cors', label: 'Validate API endpoints CORS config' },
    ],
  },
  {
    id: 'seo',
    title: 'Performance & SEO',
    icon: Share,
    items: [
      { id: 'meta', label: 'Update <title> and meta description in SEO component' },
      { id: 'images', label: 'Optimize hero banners and mockups (WEBP)' },
      { id: 'lighthouse', label: 'Run Lighthouse audit (>90 scores)' },
    ],
  },
  {
    id: 'qa',
    title: 'Functional QA',
    icon: TestTube,
    items: [
      { id: 'crud', label: 'E2E test core CRUD flow (Properties/Admin)' },
      { id: 'upload', label: 'Verify Image upload size limits and compression' },
      { id: '404', label: 'Check 404 Route & redirect bounds' },
    ],
  },
]

const TOTAL_ITEMS = SECTIONS.reduce((acc, sec) => acc + sec.items.length, 0)

export default function DevChecklist() {
  const isDev = (import.meta as any).env?.DEV
  const [isOpen, setIsOpen] = useState(false)
  const [checkedState, setCheckedState] = useState<ChecklistState>(() => {
    try {
      const stored = localStorage.getItem('ssp_dev_checklist')
      return stored ? JSON.parse(stored) : {}
    } catch(e) {
      return {}
    }
  })

  const handleToggle = (id: string) => {
    const newState = {
      ...checkedState,
      [id]: !checkedState[id],
    }
    setCheckedState(newState)
    try {
      localStorage.setItem('ssp_dev_checklist', JSON.stringify(newState))
    } catch (e) {
      console.warn('Storage error', e)
    }
  }

  const completedCount = Object.values(checkedState).filter(Boolean).length
  const percentage = Math.round((completedCount / TOTAL_ITEMS) * 100) || 0

  if (!isDev) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9999] h-12 w-12 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-gold-accent hover:bg-surface-container-high hover:text-on-surface transition-all shadow-md active:scale-95 cursor-pointer group"
        title="Open Pre-Launch Checklist"
      >
        <Settings className="h-5 w-5 animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-surface/80 z-[10000] backdrop-blur-xs"
            />

            <motion.div
              id="dev-checklist-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-full sm:w-[420px] bg-surface-container border-r border-outline-variant/50 z-[10001] shadow-md flex flex-col justify-between"
            >
              <div className="flex flex-col h-full overflow-hidden">
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

                <div className="p-6 bg-surface/50 border-b border-outline-variant/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold leading-none">
                    <span className="text-on-surface-variant uppercase tracking-widest text-[9px]">
                      Launch Readiness
                    </span>
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

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
                  {SECTIONS.map((section) => {
                    const SecIcon = section.icon
                    if (!isDev) {
                      return null
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
                            const isChecked = !!checkedState[item.id]
                            if (!isDev) {
                              return null
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
                                      ? 'border-gold-accent bg-gold-accent/10 text-gold-accent'
                                      : 'border-outline-variant bg-surface'
                                  }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span
                                  className={`text-[11px] leading-tight font-medium ${
                                    isChecked
                                      ? 'text-on-surface-variant line-through decoration-slate-600'
                                      : 'text-on-surface-variant'
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="p-4 bg-surface border-t border-outline-variant/50 flex flex-col gap-3">
                  <div className="flex gap-2 justify-center">
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-gold-accent hover:underline flex items-center gap-1"
                    >
                      <Server className="h-3 w-3" /> Firebase
                    </a>
                    <span className="text-on-surface-variant">&bull;</span>
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-on-surface hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" /> Vercel
                    </a>
                    <span className="text-on-surface-variant">&bull;</span>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-on-surface-variant hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" /> GitHub
                    </a>
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-medium text-center">
                    Local Dev Session Checklist &bull; Persisting in Sandbox
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
