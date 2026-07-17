import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { useConfig } from '@/shared/context/ConfigContext'
import { trackUserEvent } from '@/analytics'

export function ContactCTA() {
  const navigate = useNavigate()
  const BUSINESS_CONFIG = useConfig()

  return (
    <section
      id="contact_sec"
      className="py-32 px-4 bg-surface relative overflow-hidden scroll-mt-[72px]"
    >
      {/* Absolute Glowing backdrop overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full bg-gradient-to-tr from-gold-accent/20 to-transparent blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant rounded-3xl p-8 sm:p-14 text-center relative z-10 shadow-md">
        <span className="inline-block bg-gold-accent/15 text-gold-accent text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
          Instant Schedule
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Ready to Find Your Dream Property?
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-loose">
          Talk to our licensed real estate advisors today. We help clarify loan possibilities,
          registry documentation, and property comparisons completely free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={() => navigate('/properties')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-accent text-[var(--on-gold)] font-bold text-sm shadow-md hover:bg-gold-hover hover:scale-105 shadow-md active:scale-95 transition-all text-center"
          >
            Explore Properties Catalog
          </button>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(String(BUSINESS_CONFIG.whatsappMessages?.investment || ''))}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackUserEvent('whatsapp_click', { source: 'footer_cta' })}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-success-green hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all text-center"
          >
            <Phone className="h-4 w-4" />
            WhatsApp Us Now
          </a>
        </div>
      </div>
    </section>
  )
}
