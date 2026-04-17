/**
 * SANITY CMS CLIENT
 * ─────────────────────────────────────────────────────────────
 * Project: Duck Duck Mow (lddbseu5)
 * All content is fetched at build time - the site is fully static.
 *
 * SANITY SCHEMA REQUIRED FIELDS (set up in sanity.io Studio):
 * ┌──────────────┬──────────────┬─────────────────────────────┐
 * │ Field name   │ Type         │ Notes                       │
 * ├──────────────┼──────────────┼─────────────────────────────┤
 * │ title        │ string       │ Article headline            │
 * │ slug         │ slug         │ URL path, auto from title   │
 * │ excerpt      │ text         │ Meta description (<160 chr) │
 * │ publishedAt  │ datetime     │ Controls scheduling         │
 * │ category     │ string       │ e.g. "Lawn Care Tips"       │
 * │ readTime     │ number       │ Minutes to read             │
 * │ city         │ string       │ Primary service area city   │
 * │ author       │ string       │ Default: Miles - Duck Duck  │
 * │ body         │ text         │ HTML content of the article │
 * └──────────────┴──────────────┴─────────────────────────────┘
 *
 * SCHEDULING: In Sanity, set publishedAt to a future date.
 * Then add a Sanity Webhook → Cloudflare Pages deploy hook
 * so a rebuild fires automatically when a post goes live.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'lddbseu5',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  category: string;
  readTime: number;
  city: string;
  author: string;
  body?: any[];
  coverImage?: { asset: { url: string }; alt?: string };
}

// ── REVIEWS ──────────────────────────────────────────────────
// SANITY SCHEMA for "review" document type:
// ┌──────────────┬──────────────┬────────────────────────────┐
// │ Field name   │ Type         │ Notes                      │
// ├──────────────┼──────────────┼────────────────────────────┤
// │ clientName   │ string       │ "Sarah M."                 │
// │ neighborhood │ string       │ Herriman / Riverton / etc  │
// │ rating       │ number       │ 1–5                        │
// │ reviewText   │ text         │ The review content         │
// │ serviceType  │ string       │ "Lawn Mowing", optional    │
// │ featured     │ boolean      │ Show on homepage           │
// └──────────────┴──────────────┴────────────────────────────┘

export interface SanityReview {
  _id: string;
  clientName: string;
  neighborhood: string;
  rating: number;
  reviewText: string;
  serviceType?: string;
  featured?: boolean;
}

/** Fetch all featured reviews for the homepage */
export async function getFeaturedReviews(): Promise<SanityReview[]> {
  return sanityClient.fetch(
    `*[_type == "review" && featured == true] | order(_createdAt asc) {
      _id,
      clientName,
      neighborhood,
      rating,
      reviewText,
      serviceType,
      featured
    }`
  );
}

/** Fetch all reviews */
export async function getAllReviews(): Promise<SanityReview[]> {
  return sanityClient.fetch(
    `*[_type == "review"] | order(_createdAt asc) {
      _id,
      clientName,
      neighborhood,
      rating,
      reviewText,
      serviceType,
      featured
    }`
  );
}

// ── BLOG POSTS ───────────────────────────────────────────────
/** Fetch all published posts (publishedAt <= now), newest first */
export async function getAllPosts(): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      category,
      readTime,
      city,
      author,
      "coverImage": coverImage { alt, "asset": asset->{ url } }
    }`
  );
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug && publishedAt <= now()][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      category,
      readTime,
      city,
      author,
      body,
      "coverImage": coverImage { alt, "asset": asset->{ url } }
    }`,
    { slug }
  );
}

/** Format a Sanity datetime string for display */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

/** Map category names to Tailwind color classes */
export const categoryColors: Record<string, string> = {
  'Lawn Care Tips': 'bg-green-100 text-green-700',
  'Seasonal Tips':  'bg-amber-100 text-amber-700',
  'Weed Control':   'bg-red-100 text-red-700',
  'Spring Cleanup': 'bg-emerald-100 text-emerald-700',
  'Fall Cleanup':   'bg-orange-100 text-orange-700',
};

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? 'bg-gray-100 text-gray-700';
}
