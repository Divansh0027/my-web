import mixpanel from 'mixpanel-browser'
import Hotjar from '@hotjar/browser'
// import LogRocket from 'logrocket' (dynamically imported)
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { dbInstance as db } from '@/firebase'

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN
const HOTJAR_SITE_ID = import.meta.env.VITE_HOTJAR_SITE_ID
const HOTJAR_VERSION = import.meta.env.VITE_HOTJAR_VERSION || 6
const LOGROCKET_APP_ID = import.meta.env.VITE_LOGROCKET_APP_ID

let isInitialized = false

export const initAnalytics = () => {
  if (isInitialized) return

  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: true,
      persistence: 'localStorage',
    })
  }

  if (HOTJAR_SITE_ID) {
    Hotjar.init(Number(HOTJAR_SITE_ID), Number(HOTJAR_VERSION))
  }

  if (LOGROCKET_APP_ID) {
    try {
      import('logrocket')
        .then((module) => {
          const LogRocket = module.default
          LogRocket.init(LOGROCKET_APP_ID)
        })
        .catch((e) => {
          console.warn('LogRocket failed to load or initialize:', e)
        })
    } catch (e) {
      console.warn('LogRocket failed to initialize:', e)
    }
  }

  isInitialized = true
}

export const identifyUser = (uid: string, email?: string, name?: string) => {
  if (MIXPANEL_TOKEN) {
    mixpanel.identify(uid)
    if (email || name) {
      mixpanel.people.set({
        $email: email,
        $name: name,
      })
    }
  }

  if (LOGROCKET_APP_ID) {
    try {
      import('logrocket')
        .then((module) => {
          const LogRocket = module.default
          LogRocket.identify(uid, {
            name,
            email,
          })
        })
        .catch((e) => {
          console.warn('LogRocket identify failed:', e)
        })
    } catch (e) {
      console.warn('LogRocket identify failed:', e)
    }
  }
}

export const trackUserEvent = async (eventName: string, props?: Record<string, any>) => {
  // Track to Mixpanel
  if (MIXPANEL_TOKEN) {
    mixpanel.track(eventName, props)
  }

  // Also track to Firestore for Admin Dashboard (Real Charts)
  try {
    const behaviorRef = collection(db, 'user_behavior')
    await addDoc(behaviorRef, {
      eventName,
      ...props,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to log event to Firestore', error)
  }
}
