import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ConfigProvider } from './context/ConfigContext.tsx';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  enabled: !!import.meta.env.VITE_SENTRY_DSN, // Replace with real DSN
  integrations: [
    Sentry.browserTracingIntegration(),
    ...(import.meta.env.VITE_SENTRY_DSN ? [Sentry.replayIntegration()] : []),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: import.meta.env.VITE_SENTRY_DSN ? 0.1 : 0,
  replaysOnErrorSampleRate: import.meta.env.VITE_SENTRY_DSN ? 1.0 : 0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <ConfigProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ConfigProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
