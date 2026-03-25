Config & root
  package.json · astro.config.mjs · tsconfig.json · .env.example

src/config/
  analytics.ts  ← GTM-53ZW6V3B + G-3CK5Q4D9SQ wired in
  site.ts       ← all business info, phone, email
  forms.ts      ← Worker endpoint (update after deploy)

src/lib/
  sanity.ts     ← blog posts + reviews, both from Sanity

src/layouts/
  BaseLayout.astro  ← SEO + Analytics + phone click tracking

src/components/
  Analytics.astro   ← GTM via Partytown (Web Worker)
  SEO.astro         ← OG, Twitter, Schema.org, breadcrumbs
  Nav.astro         ← sticky, mobile menu (vanilla JS)
  Footer.astro
  Hero.astro        ← background image, trust badges
  Services.astro    ← 6 service cards
  About.astro       ← family story section
  Reviews.astro     ← fetches from Sanity, static fallback
  ServiceAreas.astro
  FAQ.astro         ← accordion (vanilla JS)
  QuoteForm.tsx     ← React island, POSTs to Worker

src/pages/
  index.astro         ← home (all sections + FAQ schema)
  pricing.astro       ← pricing cards, seasonal, form
  blog/index.astro    ← Sanity-powered grid
  blog/[slug].astro   ← full article + related + BlogPosting schema
  404.astro

worker/
  src/index.ts   ← Resend email + Google Sheet append
  wrangler.toml  ← name: ddm-quote-form
