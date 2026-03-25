/**
 * FORM CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 * The quote form POSTs to a Cloudflare Worker which handles:
 *   1. Sending the email notification via Resend
 *   2. Appending the lead to the Google Sheet for redundancy
 *
 * Deploy the worker from /worker, then paste its URL below.
 * ─────────────────────────────────────────────────────────────
 */

export const forms = {
  /**
   * Cloudflare Worker URL for quote form submissions.
   * Falls back to the env variable for local dev overrides.
   * Format: https://ddm-quote-form.YOUR_ACCOUNT.workers.dev
   */
  quoteEndpoint:
    import.meta.env.PUBLIC_QUOTE_FORM_ENDPOINT ??
    'https://ddm-quote-form.YOUR_ACCOUNT.workers.dev',
} as const;
