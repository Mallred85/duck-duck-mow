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
      serialize(item) {
        // Homepage - highest priority
        if (item.url === 'https://duckduckmow.com/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        // City/service combination pages - high local SEO value
        if (
          (item.url.includes('/herriman-lawn-care/') ||
           item.url.includes('/riverton-lawn-care/') ||
           item.url.includes('/south-jordan-lawn-care/') ||
           item.url.includes('/bluffdale-lawn-care/')) &&
          !item.url.endsWith('/herriman-lawn-care/') &&
          !item.url.endsWith('/riverton-lawn-care/') &&
          !item.url.endsWith('/south-jordan-lawn-care/') &&
          !item.url.endsWith('/bluffdale-lawn-care/')
        ) {
          return { ...item, priority: 0.85, changefreq: 'monthly' };
        }
        // Location pages - very high, core local SEO pages
        if (
          item.url.includes('/herriman-lawn-care') ||
          item.url.includes('/riverton-lawn-care') ||
          item.url.includes('/south-jordan-lawn-care') ||
          item.url.includes('/bluffdale-lawn-care')
        ) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }
        // Pricing page - high conversion page
        if (item.url.includes('/pricing')) {
          return { ...item, priority: 0.85, changefreq: 'monthly' };
        }
        // Service pages - high value
        if (item.url.includes('/services/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Services index
        if (item.url === 'https://duckduckmow.com/services/') {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        // Blog posts - lower, changes frequently
        if (item.url.includes('/blog/')) {
          return { ...item, priority: 0.6, changefreq: 'monthly' };
        }
        // Blog index
        if (item.url === 'https://duckduckmow.com/blog/') {
          return { ...item, priority: 0.5, changefreq: 'weekly' };
        }
        // Everything else
        return { ...item, priority: 0.5 };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
