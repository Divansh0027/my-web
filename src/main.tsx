import { StrictMode } from 'react'
import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import App from '@/App.tsx'
import ErrorBoundary from '@/shared/components/ErrorBoundary.tsx'
import { AuthProvider } from '@/features/auth'
import { ConfigProvider } from '@/shared/context/ConfigContext.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'
import { initAnalytics } from '@/analytics'
import './i18n'
import './index.css'

initAnalytics()

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000)
  })
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn && (sentryDsn.startsWith('http://') || sentryDsn.startsWith('https://'))) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
    })
  } catch (error: unknown) {
    console.warn('Failed to initialize Sentry:', error)
  }
}

const reportToSentry = (metric: any) => {
  Sentry.captureMessage(`Web Vitals: ${metric.name}`, {
    level: 'info',
    extra: metric,
  })
}

onCLS(reportToSentry)
onINP(reportToSentry)
onFCP(reportToSentry)
onLCP(reportToSentry)
onTTFB(reportToSentry)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ConfigProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </QueryClientProvider>
        </ConfigProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
