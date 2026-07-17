import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Star, Send } from 'lucide-react'
import FocusLock from 'react-focus-lock'
import { submitFeedback } from '@/firebase'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onShowNotification: (msg: string, type: 'success' | 'error') => void
}

export function FeedbackModal({ isOpen, onClose, onShowNotification }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      onShowNotification('Please select a rating', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await submitFeedback(rating, feedback)
      if (success) {
        onShowNotification('Thank you for your feedback!', 'success')
        setRating(0)
        setFeedback('')
        onClose()
      } else {
        onShowNotification('Failed to submit feedback. Please try again.', 'error')
      }
    } catch (err: unknown) {
      onShowNotification('Failed to submit feedback. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-surface-container border border-outline-variant/50 rounded-2xl shadow-xl overflow-hidden z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/50 bg-surface">
                <h2 id="feedback-title" className="text-xl font-bold text-on-surface">
                  Leave Feedback
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2 text-center">
                  <p className="block text-sm font-semibold text-on-surface">
                    How was your experience?
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-gold-accent text-gold-accent'
                              : 'text-outline-variant'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="feedback-text"
                    className="block text-sm font-semibold text-on-surface"
                  >
                    Tell us more (Optional)
                  </label>
                  <textarea
                    id="feedback-text"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-gold-accent resize-none placeholder-on-surface-variant"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gold-accent text-[var(--on-gold)] font-bold rounded-xl hover:bg-gold-hover transition-colors disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </FocusLock>
        </div>
      )}
    </AnimatePresence>
  )
}
