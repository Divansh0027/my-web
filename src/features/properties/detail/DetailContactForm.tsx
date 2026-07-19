import React, { useState, useCallback } from 'react'
import { BadgeCheck, PhoneCall } from 'lucide-react'
import { Property, Enquiry } from '@/shared/types/types'
import { OptimizedImage } from '@/shared/components/OptimizedImage'
import { submitEnquiry } from '@/firebase'
import { trackUserEvent } from '@/analytics'
import { useConfig } from '@/shared/context/ConfigContext'
import { useAuth } from '@/features/auth'

interface DetailContactFormProps {
  property: Property
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void
}

export function DetailContactForm({ property, onShowNotification }: DetailContactFormProps) {
  const BUSINESS_CONFIG = useConfig()
  const { currentUser } = useAuth()

  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderMessage, setSenderMessage] = useState(
    `Hi, I am interested in "${property?.title || 'this property'}". Please send me the brochure and available payment plans.`,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visitType, setVisitType] = useState<'enquiry' | 'visit'>('enquiry')

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!currentUser) {
        onShowNotification('Please sign in to submit an enquiry.', 'info')
        return
      }
      if (!senderName || !senderPhone) {
        onShowNotification('Please fill out your Name and Phone number.', 'info')
        return
      }
      setIsSubmitting(true)
      try {
        const cleanPhone = senderPhone.replace(/\D/g, '')

        const enqObj: Enquiry = {
          propertyId: property.id,
          propertyName: property.title,
          userId: currentUser.uid,
          name: senderName,
          email: currentUser.email || 'unknown@email.com',
          phone: cleanPhone,
          message: senderMessage,
          type: 'enquiry',
          status: 'New',
        }
        const result = await submitEnquiry(enqObj)
        if (result.success) {
          onShowNotification(
            visitType === 'visit'
              ? 'Site visit requested successfully. Our agent will contact you.'
              : 'Enquiry submitted successfully! We will contact you soon.',
            'success',
          )
          setSenderMessage(
            `Hi, I am interested in "${property.title}". Please send me the brochure and available payment plans.`,
          )
          trackUserEvent('enquiry_submit', {
            property_id: property.id,
            enquiry_type: visitType,
          })
        } else {
          onShowNotification(result.error || 'Failed to submit enquiry.', 'error')
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          onShowNotification(`Error: ${err.message}`, 'error')
        } else {
          onShowNotification('An unknown error occurred', 'error')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      currentUser,
      property.id,
      property.title,
      senderMessage,
      senderName,
      senderPhone,
      visitType,
      onShowNotification,
    ],
  )

  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-6 shadow-md space-y-6">
      {/* Agent Badge Profile */}
      <div className="flex items-center gap-4 border-b border-outline-variant/50 pb-4">
        <OptimizedImage
          width={150}
          height={150}
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
          alt=""
          loading="lazy"
          className="h-14 w-14 rounded-full object-cover border border-gold-accent/30"
          sizes="56px"
        />
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-extrabold text-on-surface text-sm">
              {BUSINESS_CONFIG.consultantName}
            </h3>
            <BadgeCheck className="h-4 w-4 text-success-green shrink-0" />
          </div>
          <p className="text-xs text-gold-accent font-semibold mt-0.5">Real Estate Consultant</p>
          <p className="text-[10px] text-on-surface-variant font-medium">
            {BUSINESS_CONFIG.businessName}
          </p>
        </div>
      </div>

      {/* Booking Tab Type Switch */}
      <div className="flex bg-surface p-1 rounded-xl text-center select-none text-[11px]">
        <button
          type="button"
          onClick={() => setVisitType('enquiry')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
            visitType === 'enquiry'
              ? 'bg-gold-accent text-[var(--on-gold)]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Send Enquiry
        </button>
        <button
          type="button"
          onClick={() => setVisitType('visit')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
            visitType === 'visit'
              ? 'bg-gold-accent text-[var(--on-gold)]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Schedule Site Visit
        </button>
      </div>

      {/* Form Entry */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="auto-detailview-543"
            className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
          >
            Full Name
          </label>
          <input
            id="auto-detailview-543"
            type="text"
            required
            placeholder="Enter your name"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-on-surface-variant focus:border-gold-accent/40 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="auto-detailview-555"
            className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
          >
            Phone Number
          </label>
          <input
            id="auto-detailview-555"
            type="tel"
            required
            maxLength={15}
            placeholder="e.g. +91 99999 12345"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-on-surface-variant focus:border-gold-accent/40 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="auto-detailview-568"
            className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
          >
            Message Notes
          </label>
          <textarea
            id="auto-detailview-568"
            rows={4}
            placeholder="Describe extra requirement (budget, floors)..."
            value={senderMessage}
            onChange={(e) => setSenderMessage(e.target.value)}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl p-4 text-xs text-on-surface placeholder-on-surface-variant focus:border-gold-accent/40 outline-none resize-none"
          />
        </div>
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-3 rounded-xl bg-gold-accent text-[var(--on-gold)] text-xs font-bold shadow hover:bg-gold-hover hover:scale-105 shadow-md active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>Submitting Details...</span>
          ) : visitType === 'visit' ? (
            <span>Book Confirmed Site Visit</span>
          ) : (
            <span>Request Callback Brochure</span>
          )}
        </button>
      </form>

      {/* reCAPTCHA Disclaimer */}
      <div className="mt-3 text-[10px] text-center text-on-surface-variant">
        This site is protected by reCAPTCHA and the Google{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-on-surface-variant"
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-on-surface-variant"
        >
          Terms of Service
        </a>{' '}
        apply.
      </div>

      {/* Direct Alternative channels */}
      <div className="flex gap-3 border-t border-outline-variant/50 pt-5">
        <a
          href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessages.propertyEnquiry(property.title))}`}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            trackUserEvent('whatsapp_click', {
              source: 'property_detail',
              property_id: property.id,
            })
          }
          className="flex-1 py-3 bg-success-green hover:brightness-110 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
        >
          <PhoneCall className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={`tel:${BUSINESS_CONFIG.businessPhone}`}
          className="flex-1 py-3 border border-outline-variant hover:bg-white/5 rounded-xl text-on-surface-variant font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          Call Directly
        </a>
      </div>
    </div>
  )
}
