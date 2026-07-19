import React from 'react'
import { AlertCircle, CheckSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import FocusLock from 'react-focus-lock'

export function ConfirmDialog({
  isOpen,
  title,
  message,
  isDanger,
  onConfirm,
  onClose,
}: {
  isOpen: boolean
  title: string
  message: string
  isDanger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock returnFocus={true}>
          <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-md flex items-center justify-center px-4">
            <motion.div
              className={`border w-full max-w-sm rounded-2xl p-5 shadow-md relative font-sans ${
                isDanger
                  ? 'bg-red-950/20 border-red-500/30'
                  : 'bg-surface-container border-outline-variant/50'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-2 mb-3">
                {isDanger ? (
                  <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-500" />
                ) : (
                  <CheckSquare className="h-5 w-5 text-gold-accent" />
                )}
                <h2 className="font-extrabold text-gold-accent text-xs uppercase tracking-wider">
                  {title}
                </h2>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-6 font-medium">
                {message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  className={`flex-grow py-2.5 rounded-xl text-[var(--on-gold)] font-black text-xs cursor-pointer transition-all ${
                    isDanger
                      ? 'bg-red-500 hover:bg-red-650 hover:text-on-surface text-[var(--on-gold)]'
                      : 'bg-gold-accent hover:bg-gold-hover hover:scale-105 shadow-md'
                  }`}
                >
                  Confirm Execution
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-high text-on-surface-variant font-bold text-xs select-none cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  )
}
