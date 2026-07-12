import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('language', nextLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/50 hover:bg-surface-container-high transition-colors"
      aria-label="Toggle Language"
    >
      <Globe size={16} className="text-gold-accent" />
      <span className="text-sm font-medium uppercase">{i18n.language === 'hi' ? 'HI' : 'EN'}</span>
    </button>
  )
}
