// src/features/portfolio/components/PortfolioCreateForm.tsx
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { PortfolioCreateInput } from '../types/portfolio.types';

interface PortfolioCreateFormProps {
  categories?: unknown[]; // kept for backwards-compat; unused now
  saving?: boolean;
  onCreate: (input: PortfolioCreateInput) => Promise<unknown>;
}

/* ───────────────────────── style tokens ───────────────────────── */

const GLASS_INPUT =
  'w-full rounded-xl border border-white/50 dark:border-white/10 ' +
  'bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/90 dark:focus:bg-slate-900/70 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_LABEL =
  'mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300';

const CARD =
  'relative rounded-2xl border border-white/60 dark:border-white/10 ' +
  'bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl ' +
  'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] p-6 sm:p-7';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 ' +
  'px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 ' +
  'transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 ' +
  'disabled:cursor-not-allowed';

const BTN_GHOST =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/50 ' +
  'dark:border-white/10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 ' +
  'hover:bg-white/80 dark:hover:bg-slate-800/60 transition disabled:opacity-40 ' +
  'disabled:cursor-not-allowed';

/* ───────────────────────── component ───────────────────────── */

export default function PortfolioCreateForm({
  saving = false,
  onCreate,
}: PortfolioCreateFormProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('Cameroon');

  /* ── validation ── */
  const identityOk = useMemo(
    () => Boolean(businessName.trim() || headline.trim()),
    [businessName, headline]
  );

  const step1Valid = identityOk;
  const step2Valid = city.trim().length >= 2;

  /* ── navigation ── */
  const goNext = () => {
    setError(null);
    if (step === 0 && !step1Valid) {
      setError(
        'Add a business name or headline so clients know who you are.'
      );
      return;
    }
    setStep(1);
  };

  const goBack = () => {
    setError(null);
    setStep(0);
  };

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (!step1Valid) {
      setStep(0);
      setError('Add a business name or headline to continue.');
      return;
    }
    if (!step2Valid) {
      setStep(1);
      setError('Add your city so clients know where you work.');
      return;
    }

    try {
      await onCreate({
        business_name: businessName.trim() || undefined,
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        city: city.trim(),
        region: region.trim() || undefined,
        country: country.trim() || 'Cameroon',
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-xl px-2 py-4 sm:py-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/12 blur-3xl" />

      {/* Hero */}
      <div className="relative mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
          <Sparkles className="h-3 w-3" />
          New portfolio · 30 seconds
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Set up your portfolio
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Two quick steps. Add more details any time from your workspace.
        </p>
      </div>

      {/* Step pills */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {[
          { id: 0, label: 'About you', icon: User },
          { id: 1, label: 'Reach & location', icon: MapPin },
        ].map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = i < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                  active
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                    : done
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                <span>{s.label}</span>
              </div>
              {i === 0 && (
                <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-400"
        >
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={CARD}>
        {/* ═══ Step 1 · About you ═══ */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span>Step 1 · About you</span>
            </div>

            <div>
              <label htmlFor="pc-business" className={GLASS_LABEL}>
                Business name
                <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                  (or skip and add a headline)
                </span>
              </label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="pc-business"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={saving}
                  placeholder="e.g. Stricker Cars"
                  className={`${GLASS_INPUT} pl-10`}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="pc-headline" className={GLASS_LABEL}>
                Headline
              </label>
              <input
                id="pc-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                disabled={saving}
                placeholder="e.g. Mobile Auto Mechanic in Douala"
                className={GLASS_INPUT}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                One of business name or headline is required.
              </p>
            </div>

            <div>
              <label htmlFor="pc-bio" className={GLASS_LABEL}>
                Short bio
                <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                  (optional)
                </span>
              </label>
              <textarea
                id="pc-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
                placeholder="A sentence or two about what you do…"
                maxLength={500}
                className={`${GLASS_INPUT} resize-none`}
              />
              <p className="mt-1 text-right text-[10px] tabular-nums text-slate-400">
                {bio.length}/500
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={goNext}
                disabled={saving}
                className={BTN_PRIMARY}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 2 · Reach & location ═══ */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5 text-blue-500" />
              <span>Step 2 · How clients reach you</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pc-phone" className={GLASS_LABEL}>
                  Phone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="pc-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                    placeholder="+237 6XX XXX XXX"
                    className={`${GLASS_INPUT} pl-10`}
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pc-whatsapp" className={GLASS_LABEL}>
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="pc-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    disabled={saving}
                    placeholder="+237 6XX XXX XXX"
                    className={`${GLASS_INPUT} pl-10`}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="pc-country" className={GLASS_LABEL}>
                  Country
                </label>
                <input
                  id="pc-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="pc-region" className={GLASS_LABEL}>
                  Region
                </label>
                <input
                  id="pc-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={saving}
                  placeholder="Littoral"
                  className={GLASS_INPUT}
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="pc-city" className={GLASS_LABEL}>
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="pc-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                  placeholder="Douala"
                  className={GLASS_INPUT}
                />
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span>
                  You can add services, works, availability, pricing, tags,
                  social links and more from your workspace at any time.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className={BTN_GHOST}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={saving || !step2Valid}
                className={BTN_PRIMARY}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}