import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duckduckmow.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    partytown({
      config: {
        // Forward these globals from the Web Worker back to the main thread
        // so GTM, GA4, Meta Pixel, and Clarity all function correctly
        forward: ['dataLayer.push', 'gtag', 'fbq', 'clarity'],
      },
    }),
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
