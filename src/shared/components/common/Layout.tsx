import React from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import ScrollToTop from '@/shared/components/ScrollToTop'
import ScrollToTopOnMount from '@/shared/components/ScrollToTopOnMount'
import { ReadingProgressBar } from '@/shared/components/ReadingProgressBar'
import { OnboardingTour } from '@/shared/components/OnboardingTour'
import { HelpCenterTrigger } from '@/shared/components/HelpCenterTrigger'
import Notification from '@/shared/components/Notification'
import { InstallPrompt } from '@/shared/components/InstallPrompt'
import { useConfig } from '@/shared/context/ConfigContext'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { motion, MotionConfig } from 'motion/react'
import { SkipLink } from '@/shared/components/SkipLink'
import { ChatWidget } from '@/features/chat/ChatWidget'

interface LayoutProps {
  children: React.ReactNode
  isAppReady: boolean
  maintenanceMode: boolean
  toastMessage: string | null
  toastType: 'success' | 'info' | 'error'
  closeToast: () => void
  savedPropertyIds: string[]
  isAdmin: boolean
  currentUser: unknown
  onOpenLogin: () => void
}

export default function Layout({
  children,
  isAppReady,
  maintenanceMode,
  toastMessage,
  toastType,
  closeToast,
  savedPropertyIds,
  isAdmin,
  currentUser,
  onOpenLogin,
}: LayoutProps) {
  const location = useLocation()
  const BUSINESS_CONFIG = useConfig()

  if (!isAppReady) {
    return (
      <main className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="h-16 w-16 md:h-20 md:w-20 mb-6 relative animate-pulse-slow">
            <div className="absolute inset-0 border-t-2 border-r-2 border-gold-accent rounded-tr-xl"></div>
            <div className="absolute inset-0 border-b-2 border-l-2 border-gold-accent rounded-bl-xl opacity-50"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-on-surface tracking-widest uppercase mb-2">
            Loading
          </h1>
          <p className="text-on-surface-variant text-sm tracking-wide">
            Preparing your experience...
          </p>
        </motion.div>
      </main>
    )
  }

  if (maintenanceMode) {
    return (
      <main className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full">
          <div className="h-20 w-20 mx-auto mb-8 text-gold-accent">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-4">
            Under Maintenance
          </h1>
          <p className="text-on-surface-variant text-base mb-8 leading-relaxed">
            {BUSINESS_CONFIG.businessName} is currently undergoing scheduled maintenance to improve
            our services. Please check back shortly.
          </p>
          <p className="text-sm text-on-surface-variant font-mono">
            Contact:{' '}
            <a
              href={`mailto:${BUSINESS_CONFIG.businessEmail}`}
              className="text-gold-accent hover:underline"
            >
              {BUSINESS_CONFIG.businessEmail}
            </a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ScrollToTopOnMount />
        <ReadingProgressBar />
        <OnboardingTour />
        <div className="bg-surface min-h-screen text-on-surface font-sans flex flex-col justify-between">
          <header>
            <SkipLink />
            <div role="region" aria-label="Notifications">
              <Notification message={toastMessage} type={toastType} onClose={closeToast} />
              <InstallPrompt />
            </div>

            <Navbar
              onOpenAuth={onOpenLogin}
              currentUser={currentUser}
              isAdmin={isAdmin}
              savedCount={savedPropertyIds.length}
            />
          </header>

          <main
            aria-label="Main Content"
            id="main-content"
            className="flex-1 flex flex-col mt-[72px] lg:mt-[88px] relative overflow-x-hidden"
          >
            {children}
          </main>
          <Footer />
          <ScrollToTop />
          <HelpCenterTrigger />
          <ChatWidget />

          {location.pathname !== '/admin' && !location.pathname.startsWith('/admin/') && (
            <nav
              aria-label="Mobile Bottom Navigation"
              className="lg:hidden bg-surface border-t border-outline-variant/50 py-4 px-4 flex items-center justify-around text-center select-none w-full pb-8"
            >
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${isActive ? 'text-gold-accent' : 'text-on-surface-variant'}`
                }
              >
                <span className="text-[10px] font-bold">Home</span>
              </NavLink>
              <NavLink
                to="/properties"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${isActive || location.pathname.startsWith('/property/') ? 'text-gold-accent' : 'text-on-surface-variant'}`
                }
              >
                <span className="text-[10px] font-bold">Listings</span>
              </NavLink>
              <NavLink
                to="/list-property"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${isActive ? 'text-gold-accent' : 'text-on-surface-variant'}`
                }
              >
                <span className="text-[10px] font-bold">Post</span>
              </NavLink>
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 cursor-pointer w-[42px] relative ${isActive ? 'text-gold-accent' : 'text-on-surface-variant'}`
                }
              >
                {savedPropertyIds.length > 0 && (
                  <span className="absolute top-[2px] right-2 h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                )}
                <span className="text-[10px] font-bold">Saved</span>
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${isActive ? 'text-gold-accent' : 'text-on-surface-variant'}`
                }
              >
                <span className="text-[10px] font-bold">Profile</span>
              </NavLink>
            </nav>
          )}
        </div>
      </MotionConfig>
    </ErrorBoundary>
  )
}
