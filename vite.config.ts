import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
        manifest: {
          name: 'Shiv Saya Properties',
          short_name: 'Shiv Saya',
          description: 'Premier Real Estate Consultant in Ghaziabad & Delhi NCR',
          theme_color: '#0F172A',
          background_color: '#0F172A',
          display: 'standalone',
          start_url: '/',
          protocol_handlers: [
            {
              protocol: 'web+shivsaya',
              url: '/?url=%s',
            },
          ],
          icons: [
            {
              src: 'logo.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. Sentry
              if (id.includes('@sentry/')) {
                return 'vendor-sentry'
              }
              // 2. Firebase
              if (id.includes('firebase')) {
                return 'vendor-firebase'
              }
              // 3. Recharts
              if (id.includes('recharts')) {
                return 'vendor-recharts'
              }
              // 4. Motion/Animations
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion'
              }
              // 5. Algolia Search
              if (id.includes('algoliasearch') || id.includes('react-instantsearch') || id.includes('@algolia/')) {
                return 'vendor-algolia'
              }
              // 6. Joyride Tour
              if (id.includes('react-joyride') || id.includes('react-floater')) {
                return 'vendor-joyride'
              }
              // 7. Core React Framework (Strict Match)
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/react-router-dom/') ||
                id.includes('/react-router/') ||
                id.includes('/scheduler/')
              ) {
                return 'vendor-react'
              }
              // 8. Tanstack React Query
              if (id.includes('@tanstack/')) {
                return 'vendor-query'
              }
              // 9. Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons'
              }
              // 10. Analytics trackers
              if (
                id.includes('logrocket') ||
                id.includes('mixpanel-browser') ||
                id.includes('@hotjar/') ||
                id.includes('web-vitals')
              ) {
                return 'vendor-analytics'
              }
            }
          },
        },
      },
      plugins: [
        process.env.ANALYZE || process.argv.includes('--analyze')
          ? visualizer({
              open: false,
              filename: 'bundle-analysis.html',
              gzipSize: true,
              brotliSize: true,
            })
          : null,
      ],
    },
  }
})
