import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { HelpCenterModal } from './HelpCenterModal'

export function HelpCenterTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 p-3 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-full shadow-lg transition-all z-50 animate-fadeIn"
        aria-label="Open Help Center"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      <HelpCenterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
