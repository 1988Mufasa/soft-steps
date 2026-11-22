import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

function securityHeaders(): Plugin {
  const apply = (_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader(
      'Permissions-Policy',
      'camera=(self), microphone=(self), geolocation=(), payment=()',
    )
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    next()
  }
  return {
    name: 'soft-steps-security-headers',
    configureServer(server) {
      server.middlewares.use(apply)
    },
    configurePreviewServer(server) {
      server.middlewares.use(apply)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    securityHeaders(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Soft Steps',
        short_name: 'Soft Steps',
        description:
          'Calm autism-friendly learning: ABCs, signs, foods, routines, AAC Talk, and social stories — 100% offline after install.',
        theme_color: '#3661B0',
        background_color: '#F5F6F8',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen', 'minimal-ui'],
        orientation: 'any',
        start_url: '/',
        scope: '/',
        id: '/',
        lang: 'en',
        categories: ['education', 'kids', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache app shell + fonts. Mulberry SVGs (~3.4k) are runtime-cached on use
        // so the service worker install stays lean; Capacitor ships the full set offline.
        globPatterns: ['**/*.{js,css,html,ico,png,woff2,woff,webmanifest}', 'symbols/*.{json,txt,csv}'],
        globIgnores: ['**/symbols/mulberry/**'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/symbols\/mulberry\/.*\.svg$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mulberry-symbols',
              expiration: { maxEntries: 800, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
})
