import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

import { Property } from '@/shared/types/types'
import FocusLock from 'react-focus-lock'

export function RejectPropertyModal({
  property,
  reason,
  notes,
  onReasonChange,
  onNotesChange,
  onClose,
  onConfirm,
}: {
  property: Property | null
  reason: string
  notes: string
  onReasonChange: (val: string) => void
  onNotesChange: (val: string) => void
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AnimatePresence>
      {property && (
        <FocusLock returnFocus={true}>
          <div className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-sm overflow-y-auto px-4 py-8 flex items-center justify-center">
            <motion.div
              className="bg-surface-container border border-outline-variant/50 w-full max-w-md rounded-2xl p-6 relative shadow-md font-sans"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-850 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-extrabold text-red-600 uppercase tracking-wide border-b border-outline-variant/50 pb-3 mb-5 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="h-4 w-4 text-red-550" /> Reject Property Listing
              </h2>
              <div className="space-y-4 text-xs text-on-surface-variant font-sans">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reject-reason"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Reason for rejection (Required)
                  </label>
                  <select
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/50 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-on-surface outline-none cursor-pointer"
                  >
                    <option value="Incomplete information">Incomplete information</option>
                    <option value="Incorrect pricing">Incorrect pricing</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Images missing">Images missing</option>
                    <option value="Other - specify below">Other - specify below</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="reject-notes"
                    className="text-[10px] uppercase font-bold text-on-surface-variant"
                  >
                    Additional notes for submitter (Optional)
                  </label>
                  <textarea
                    id="reject-notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Enter message for the property owner..."
                    className="w-full bg-surface border border-outline-variant/50 focus:border-red-500/40 rounded-xl px-3 py-2.5 text-xs text-on-surface placeholder-on-surface-variant outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-grow py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container-high text-on-surface-variant font-bold text-xs select-none cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-grow py-2.5 rounded-xl bg-red-500 hover:bg-red-650 text-on-surface font-black text-xs cursor-pointer transition-colors font-sans"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  )
}
