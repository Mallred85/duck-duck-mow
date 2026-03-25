/**
 * Duck Duck Mow — Quote Form Cloudflare Worker
 * ─────────────────────────────────────────────────────────────
 * Handles quote form submissions from duckduckmow.com.
 *
 * On each valid submission:
 *   1. Validates required fields + honeypot check
 *   2. Sends a formatted email to info@duckduckmow.com via Resend
 *   3. Appends the lead as a new row in the Google Sheet
 *
 * ── SETUP ───────────────────────────────────────────────────
 * 1. Deploy: cd worker && npm install && wrangler deploy
 * 2. Set secrets (one-time, never committed to Git):
 *      wrangler secret put RESEND_API_KEY
 *      wrangler secret put GOOGLE_SHEET_SCRIPT_URL
 *
 * ── GOOGLE SHEET SETUP ──────────────────────────────────────
 * The worker POSTs to a Google Apps Script web app.
 * To create it:
 *   a. Open your Google Sheet
 *   b. Extensions → Apps Script → paste the script below
 *   c. Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   d. Copy the deployment URL → wrangler secret put GOOGLE_SHEET_SCRIPT_URL
 *
 * Apps Script code to paste:
 * ─────────────────────────────────────────────────────────────
 * function doPost(e) {
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     const sheet = SpreadsheetApp.openById('1JbXRFSett4Mwx4hCZIGITjxSHCeeZCCeT_6lSI2XPMs').getActiveSheet();
 *     // Add header row if sheet is empty
 *     if (sheet.getLastRow() === 0) {
 *       sheet.appendRow(['Timestamp','Name','Email','Phone','Address','City','Plan','Services','Message']);
 *     }
 *     sheet.appendRow([
 *       data.timestamp, data.name, data.email, data.phone,
 *       data.address, data.neighborhood, data.plan,
 *       data.services, data.message
 *     ]);
 *     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch(err) {
 *     return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * ─────────────────────────────────────────────────────────────
 */

export interface Env {
  RESEND_API_KEY:          string;
  GOOGLE_SHEET_SCRIPT_URL: string;
  ALLOWED_ORIGIN:          string;
}

interface QuotePayload {
  name:         string;
  email:        string;
  phone:        string;
  address?:     string;
  neighborhood: string;
  plan?:        string;
  services:     string[];
  message?:     string;
  _hp?:         string; // honeypot
}

// ── Main handler ─────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = [
      env.ALLOWED_ORIGIN ?? 'https://duckduckmow.com',
      'https://duckduckmow.com',
      'https://www.duckduckmow.com',
      'https://duck-duck-mow.pages.dev',
    ];
    const requestOrigin = request.headers.get('Origin') ?? '';
    const origin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin':  origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    let payload: QuotePayload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400, corsHeaders);
    }

    // Honeypot — silently succeed so bots don't retry
    if (payload._hp) {
      return json({ ok: true }, 200, corsHeaders);
    }

    // Validate required fields
    const missing = (['name', 'email', 'phone', 'neighborhood'] as const).filter(
      (f) => !payload[f]?.trim()
    );
    if (missing.length > 0) {
      return json({ ok: false, error: `Missing: ${missing.join(', ')}` }, 422, corsHeaders);
    }
    if (!payload.services?.length) {
      return json({ ok: false, error: 'At least one service required' }, 422, corsHeaders);
    }

    // Run email + sheet in parallel (don't let sheet failure block email)
    const [emailResult, sheetResult] = await Promise.allSettled([
      sendEmail(env.RESEND_API_KEY, payload),
      appendToSheet(env.GOOGLE_SHEET_SCRIPT_URL, payload),
    ]);

    if (emailResult.status === 'rejected') {
      console.error('Email failed:', emailResult.reason);
      return json({ ok: false, error: 'Email delivery failed' }, 500, corsHeaders);
    }

    if (sheetResult.status === 'rejected') {
      // Log but don't fail — email was sent
      console.warn('Sheet append failed:', sheetResult.reason);
    }

    return json({ ok: true }, 200, corsHeaders);
  },
};

// ── Email via Resend ─────────────────────────────────────────

async function sendEmail(apiKey: string, d: QuotePayload): Promise<void> {
  const planBadge = d.plan
    ? `<span style="display:inline-block;padding:2px 10px;background:#dcfce7;color:#16a34a;border-radius:4px;font-size:13px;font-weight:600;">${d.plan}</span>`
    : '';

  const html = `
    <div style="font-family:'Poppins',sans-serif;max-width:620px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:28px 32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">🦆 New Quote Request</h1>
        <p style="color:rgba(255,255,255,.75);margin:6px 0 0;font-size:14px;">Duck Duck Mow</p>
      </div>

      <div style="padding:28px 32px;">
        ${planBadge ? `<p style="margin:0 0 16px;"><strong>Plan: </strong>${planBadge}</p>` : ''}

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#6b7280;width:130px;">Name</td><td style="padding:8px 0;font-weight:600;color:#111;">${d.name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${d.email}" style="color:#16a34a;">${d.email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;"><a href="tel:${d.phone}" style="color:#16a34a;">${d.phone}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Address</td><td style="padding:8px 0;">${d.address || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">City / Area</td><td style="padding:8px 0;">${d.neighborhood}, UT</td></tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;vertical-align:top;">Services</td>
            <td style="padding:8px 0;">
              ${d.services.map((s) => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 10px;background:#f0fdf4;color:#16a34a;border-radius:4px;font-size:12px;font-weight:600;">${s}</span>`).join('')}
            </td>
          </tr>
          ${d.message ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Message</td><td style="padding:8px 0;color:#374151;">${d.message}</td></tr>` : ''}
        </table>

        <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <a href="tel:${d.phone}"
             style="display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
            📞 Call ${d.name}
          </a>
        </div>
      </div>

      <div style="background:#f3f4f6;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Duck Duck Mow · Herriman, Riverton, South Jordan & Bluffdale, UT · 801-669-3819
        </p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     'Duck Duck Mow <quotes@email.duckduckmow.com>',
      to:       ['info@duckduckmow.com'],
      reply_to: d.email,
      subject:  `New Quote — ${d.name} (${d.neighborhood})`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

// ── Google Sheet via Apps Script webhook ─────────────────────

async function appendToSheet(scriptUrl: string, d: QuotePayload): Promise<void> {
  if (!scriptUrl) return; // not configured yet

  const res = await fetch(scriptUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp:    new Date().toISOString(),
      name:         d.name,
      email:        d.email,
      phone:        d.phone,
      address:      d.address ?? '',
      neighborhood: d.neighborhood,
      plan:         d.plan ?? '',
      services:     d.services.join(', '),
      message:      d.message ?? '',
    }),
  });

  if (!res.ok) {
    throw new Error(`Sheet script ${res.status}`);
  }
}

// ── Helpers ──────────────────────────────────────────────────

function json(
  body: unknown,
  status: number,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
