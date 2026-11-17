/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { seoPlugin } from './scripts/seoPlugin.ts'
import { DEFAULT_SITE_URL } from './src/seo/data.ts'

export default defineConfig(({ mode }) => {
  // Same variables the app reads (see src/config.ts), so the static pages and sitemap use your real address and name.
  const env = loadEnv(mode, '.', 'VITE_')
  const siteUrl = (/^https?:\/\//.test(env.VITE_SITE_URL ?? '') ? env.VITE_SITE_URL : DEFAULT_SITE_URL).replace(/\/+$/, '')
  return {
    plugins: [react(), tailwindcss(), seoPlugin({ siteUrl, appName: env.VITE_APP_NAME || 'Pencilfable' })],
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  }
})
