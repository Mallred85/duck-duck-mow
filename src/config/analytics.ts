/**
 * ANALYTICS & TRACKING CONFIGURATION
 * ─────────────────────────────────────────────────────────────
 * Drop your IDs here. Leave a field as empty string ("") to
 * disable that integration — no dead script tags are emitted.
 *
 * All scripts run via @astrojs/partytown (Web Worker) so they
 * never block the main thread or hurt Core Web Vitals.
 * ─────────────────────────────────────────────────────────────
 */

export const analytics = {
  /**
   * Google Tag Manager
   * Manages GA4 and all other tags. GA4 fires through GTM.
   * Get from: tagmanager.google.com > your container
   * Format: GTM-XXXXXXX
   */
  gtmContainerId: '',

  /**
   * Google Analytics 4
   * Only used if gtmContainerId is empty (GA4 fires through GTM above).
   * Format: G-XXXXXXXXXX
   */
  ga4MeasurementId: 'G-3CK5Q4D9SQ',

  /**
   * Google Search Console verification
   * Paste only the content="" value from the HTML tag method.
   * Get from: Search Console > Settings > Ownership verification > HTML tag
   */
  googleSiteVerification: 'YOUR_GSC_VERIFICATION',

  /**
   * Meta (Facebook) Pixel
   * Get from: business.facebook.com > Events Manager > Pixels
   * Format: numeric string e.g. '1234567890123456'
   */
  metaPixelId: '',

  /**
   * Microsoft Clarity (free heatmaps & session recordings)
   * Get from: clarity.microsoft.com > your project
   * Format: short alphanumeric string
   */
  clarityProjectId: '',

  /**
   * Custom <head> scripts — raw HTML injected verbatim before </head>
   */
  customHeadScripts: '',

  /**
   * Custom <body> scripts — raw HTML injected at the start of <body>
   * GTM noscript is added automatically when gtmContainerId is set.
   */
  customBodyScripts: '',
} as const;

export type AnalyticsConfig = typeof analytics;
