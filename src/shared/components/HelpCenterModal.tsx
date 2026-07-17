import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, HelpCircle, Mail, Phone, ExternalLink } from 'lucide-react'
import { useConfig } from '@/shared/context/ConfigContext'
import FocusLock from 'react-focus-lock'

interface HelpCenterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const BUSINESS_CONFIG = useConfig()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <FocusLock returnFocus={true}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container border border-outline-variant/50 rounded-2xl shadow-xl overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-center-title"
            >
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/50 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gold-accent/10 rounded-full flex items-center justify-center text-gold-accent">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h2 id="help-center-title" className="text-xl font-bold text-on-surface">
                    Help Center
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-on-surface mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    <details className="group bg-surface rounded-xl border border-outline-variant/50 p-4 open:bg-surface-container-low transition-colors">
                      <summary className="font-medium cursor-pointer text-on-surface list-none flex justify-between items-center">
                        How do I schedule a property visit?
                        <span className="transition group-open:rotate-180">
                          <svg
                            fill="none"
                            height="24"
                            shapeRendering="geometricPrecision"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            width="24"
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </span>
                      </summary>
                      <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">
                        Navigate to any property detail page and use the contact form to request a
                        viewing. Our agents typically respond within 2-4 hours to confirm your
                        appointment.
                      </p>
                    </details>

                    <details className="group bg-surface rounded-xl border border-outline-variant/50 p-4 open:bg-surface-container-low transition-colors">
                      <summary className="font-medium cursor-pointer text-on-surface list-none flex justify-between items-center">
                        What are the standard brokerage fees?
                        <span className="transition group-open:rotate-180">
                          <svg
                            fill="none"
                            height="24"
                            shapeRendering="geometricPrecision"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            width="24"
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </span>
                      </summary>
                      <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">
                        For rentals, we charge equivalent to one month's rent. For property sales,
                        our standard fee is 2% of the total transaction value. Fees are negotiable
                        on premium properties.
                      </p>
                    </details>

                    <details className="group bg-surface rounded-xl border border-outline-variant/50 p-4 open:bg-surface-container-low transition-colors">
                      <summary className="font-medium cursor-pointer text-on-surface list-none flex justify-between items-center">
                        How can I list my property?
                        <span className="transition group-open:rotate-180">
                          <svg
                            fill="none"
                            height="24"
                            shapeRendering="geometricPrecision"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            width="24"
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </span>
                      </summary>
                      <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">
                        Click on the "List Your Property" button in the navigation bar. You will
                        need to create an account and fill out the property details. Our team will
                        verify and publish it within 24 hours.
                      </p>
                    </details>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-on-surface mb-4">Contact Support</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={`tel:${BUSINESS_CONFIG.businessPhone}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/50 bg-surface hover:border-gold-accent hover:shadow-sm transition-all group"
                    >
                      <div className="h-10 w-10 bg-surface-container-high rounded-full flex items-center justify-center group-hover:bg-gold-accent group-hover:text-\[var(--on-gold)\] transition-colors">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">Call Us</div>
                        <div className="text-xs text-on-surface-variant">
                          {BUSINESS_CONFIG.businessPhone}
                        </div>
                      </div>
                    </a>
                    <a
                      href={`mailto:${BUSINESS_CONFIG.businessEmail}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/50 bg-surface hover:border-gold-accent hover:shadow-sm transition-all group"
                    >
                      <div className="h-10 w-10 bg-surface-container-high rounded-full flex items-center justify-center group-hover:bg-gold-accent group-hover:text-\[var(--on-gold)\] transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">Email Us</div>
                        <div className="text-xs text-on-surface-variant">
                          {BUSINESS_CONFIG.businessEmail}
                        </div>
                      </div>
                    </a>
                  </div>
                </section>
              </div>
            </motion.div>
          </FocusLock>
        </div>
      )}
    </AnimatePresence>
  )
}
