/**
 * SITE CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all site-wide defaults.
 * Per-page values override these in SEO.astro props.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  /** Canonical base URL — no trailing slash */
  url: 'https://duckduckmow.com',

  /** Appended to every page <title> */
  titleSuffix: ' | Duck Duck Mow',

  /** Fallback <title> when no page title is provided */
  defaultTitle: 'Duck Duck Mow | Lawn Care in Herriman, Riverton, South Jordan & Bluffdale',

  /** Fallback meta description */
  defaultDescription:
    'Family-owned lawn care in Herriman, Riverton, South Jordan & Bluffdale, UT. Mowing, edging, trimming & seasonal cleanup. Free quotes — text 801-669-3819.',

  /** Default Open Graph image (absolute URL) */
  defaultOgImage: 'https://duckduckmow.com/og-default.jpg',

  /** Default page language */
  defaultLang: 'en-US',

  /** Twitter / X handle */
  twitterHandle: '@DuckDuckMow',

  /** Business structured data for Schema.org */
  business: {
    name: 'Duck Duck Mow',
    description:
      'Family-owned neighborhood lawn care service serving Herriman, Riverton, South Jordan, and Bluffdale, Utah. Weekly mowing, edging, trimming, blowing, and seasonal cleanups.',
    url: 'https://duckduckmow.com',
    logo: 'https://duckduckmow.com/favicons/favicon-96x96.png',
    telephone: '+18016693819',
    email: 'info@duckduckmow.com',
    address: {
      addressLocality: 'Herriman',
      addressRegion: 'UT',
      addressCountry: 'US',
    },
    priceRange: '$$',
    areaServed: ['Herriman UT', 'Riverton UT', 'South Jordan UT', 'Bluffdale UT'],
    serviceType: [
      'Lawn Mowing',
      'Edging',
      'Trimming',
      'Blowing',
      'Seasonal Cleanup',
      'Spring Cleanup',
      'Fall Cleanup',
    ],
    sameAs: [
      // Add social profiles when available:
      // 'https://www.facebook.com/duckduckmow',
      // 'https://www.instagram.com/duckduckmow',
    ],
  },
} as const;

export type SiteConfig = typeof site;

/** Phone constants — use these everywhere instead of hardcoding */
export const PHONE_DISPLAY = '801-669-3819';
export const PHONE_HREF = 'tel:+18016693819';
export const EMAIL = 'info@duckduckmow.com';
