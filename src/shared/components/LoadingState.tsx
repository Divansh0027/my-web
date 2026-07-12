import React from 'react'

export const LoadingState: React.FC = () => (
  <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center select-none font-sans">
    <div className="relative h-16 w-16 mb-6">
      <div className="absolute inset-0 rounded-full border-4 border-gold-accent/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-gold-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
    <h1 className="text-xl font-bold text-on-surface tracking-wide mb-1">Shiv Saya Properties</h1>
    <p className="text-xs text-on-surface-variant font-semibold animate-pulse">
      Loading your experience...
    </p>
  </main>
)
