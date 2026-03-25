/**
 * QuoteForm.tsx — React island
 *
 * Used as <QuoteForm client:load /> in Astro pages.
 * POSTs to the Cloudflare Worker which handles email (Resend)
 * and Google Sheet logging.
 *
 * No tRPC, no database dependency — fully decoupled.
 */

import React, { useState } from 'react';

const NEIGHBORHOODS = ['Herriman', 'Riverton', 'South Jordan', 'Bluffdale'] as const;
const SERVICES      = ['Lawn Mowing', 'Edging', 'Trimming', 'Blowing', 'Seasonal Cleanup'] as const;
const PLANS         = [
  'Weekly — Starting at $35/visit',
  'Bi-Monthly — Starting at $45/visit',
  'Seasonal Cleanup Only',
  'Not sure yet',
] as const;

interface FormState {
  name:         string;
  email:        string;
  phone:        string;
  address:      string;
  neighborhood: string;
  plan:         string;
  message:      string;
}

const INITIAL_FORM: FormState = {
  name: '', email: '', phone: '', address: '',
  neighborhood: '', plan: '', message: '',
};

interface Props {
  endpoint: string;
  showPlanSelector?: boolean;
}

export default function QuoteForm({ endpoint, showPlanSelector = false }: Props) {
  const [form, setForm]                 = useState<FormState>(INITIAL_FORM);
  const [services, setServices]         = useState<string[]>([]);
  const [status, setStatus]             = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg]         = useState('');

  const toggleService = (s: string) =>
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.neighborhood) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (services.length === 0) {
      setStatus('error');
      setErrorMsg('Please select at least one service.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, services }),
      });

      if (!res.ok) throw new Error('Server error');

      setStatus('success');
      setForm(INITIAL_FORM);
      setServices([]);
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please call us at 801-669-3819.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-3xl border-2 border-green-200 p-10 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Quote Request Sent!</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Thanks! We've received your request and will reach out shortly.
          You can also text us directly.
        </p>
        <a
          href="tel:+18016693819"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
            />
          </svg>
          Call or Text 801-669-3819
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 sm:p-10 space-y-6"
      noValidate
    >
      {/* Honeypot — hidden from real users, catches bots */}
      <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      {/* Plan selector (pricing page only) */}
      {showPlanSelector && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Interested Plan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, plan: p }))}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                  form.plan === p
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="John Smith"
            value={form.name}
            onChange={set('name')}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="801-555-1234"
            value={form.phone}
            onChange={set('phone')}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          required
          className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition"
        />
      </div>

      {/* Address + Neighborhood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            Street Address
          </label>
          <input
            type="text"
            placeholder="123 Main St"
            value={form.address}
            onChange={set('address')}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1.5">
            City / Area <span className="text-red-500">*</span>
          </label>
          <select
            value={form.neighborhood}
            onChange={set('neighborhood')}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white transition"
          >
            <option value="">Select area...</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}, UT</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Services Needed <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleService(s)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                services.includes(s)
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-green-400'
              }`}
            >
              {services.includes(s) && (
                <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Additional Notes
        </label>
        <textarea
          placeholder="Anything else we should know? (yard size, gate access, special requests...)"
          value={form.message}
          onChange={set('message')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none transition"
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p role="alert" className="text-red-600 text-sm font-medium">
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/25 hover:scale-[1.01] text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send My Free Quote Request
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        We'll reach out at{' '}
        <span className="font-medium">{form.email || 'your email'}</span>{' '}
        and may also call or text your phone.
      </p>
    </form>
  );
}
