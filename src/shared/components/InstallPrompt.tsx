import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt if user hasn't dismissed it before
      if (!localStorage.getItem('installPromptDismissed')) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-surface border border-outline shadow-xl rounded-2xl p-4 z-[60] flex items-start gap-4"
        >
          <div className="flex-1">
            <h3 className="font-bold text-on-surface mb-1">Add to Home Screen</h3>
            <p className="text-sm text-on-surface-variant mb-3">
              Install Shiv Saya Properties for quick access and offline browsing.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-on-surface-variant p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
