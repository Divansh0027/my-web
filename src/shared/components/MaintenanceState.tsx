import React from 'react'
import { useConfig } from '@/shared/context/ConfigContext'

export const MaintenanceState: React.FC = () => {
  const config = useConfig()
  return (
    <main className="min-h-screen bg-surface text-on-surface font-sans flex items-center justify-center p-6 select-none relative overflow-hidden">
      <div className="flex flex-col items-center text-center space-y-6 max-w-lg px-4 relative z-10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            We'll Be Right Back
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
            {config.businessName} is currently undergoing scheduled maintenance.
          </p>
        </div>
        <div className="pt-4">
          <a
            href={`https://wa.me/${config.whatsappNumber}?text=Hi`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-accent hover:bg-gold-hover hover:scale-105 shadow-md text-[var(--on-gold)] font-bold rounded-xl text-xs transition-all active:scale-98"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
