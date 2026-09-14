import { useMemo, useState } from 'react';
import {
  Loader2,
  Sparkles,
  X,
  Tag,
  Grid,
  User,
  MapPin,
  Coins,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Phone,
  Globe,
  Languages as LanguagesIcon,
} from 'lucide-react';
import type { Category, PortfolioCreateInput } from '../types/portfolio.types';

interface PortfolioCreateFormProps {
  categories: Category[];
  saving?: boolean;
  onCreate: (input: PortfolioCreateInput) => Promise<unknown>;
}

const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR'];
const PAYMENT_METHODS = [
  'cash',
  'momo',
  'orange_money',
  'bank_transfer',
  'card',
  'paypal',
];
const COMMON_LANGUAGES = [
  'English',
  'French',
  'Pidgin',
  'Fulfulde',
  'Ewondo',
  'Duala',
  'Arabic',
  'Spanish',
  'Portuguese',
];

/* ───────────────────────── Glass design tokens ───────────────────────── */

const GLASS_INPUT =
  'w-full rounded-lg border border-white/50 dark:border-white/10 ' +
  'bg-white/60 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/90 dark:focus:bg-slate-900/70 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_SELECT = `${GLASS_INPUT} appearance-none pr-9`;

const GLASS_LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const GLASS_CARD =
  'relative rounded-2xl border border-white/60 dark:border-white/10 ' +
  'bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl ' +
  'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] p-6';

const CHIP_BASE =
  'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const CHIP_ACTIVE = 'bg-blue-600 text-white shadow-sm shadow-blue-500/25';

const CHIP_IDLE =
  'border border-slate-200/80 bg-white/70 text-slate-600 hover:border-blue-500/40 ' +
  'hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 ' +
  'dark:hover:border-blue-500/40 dark:hover:text-blue-400';

/* ─────────────────────────────────────────────────────────────────────── */

const STEPS = [
  { id: 0, label: 'Identity', icon: User },
  { id: 1, label: 'Specialties', icon: Grid },
  { id: 2, label: 'Contact & Coverage', icon: MapPin },
  { id: 3, label: 'Pricing', icon: Coins },
  { id: 4, label: 'Review & Publish', icon: CheckCircle2 },
] as const;

export default function PortfolioCreateForm({
  categories,
  saving = false,
  onCreate,
}: PortfolioCreateFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PortfolioCreateInput>({
    currency: 'XAF',
    travels_to_client: true,
    works_remotely: false,
    accepts_negotiation: true,
    is_public: true,
    payment_methods: [],
    languages: [],
    tags: [],
    specialty_ids: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* ───────────────────────── helpers ───────────────────────── */

  const update = (patch: Partial<PortfolioCreateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const toggleFromArray = (
    key: 'payment_methods' | 'languages' | 'specialty_ids',
    value: string
  ) => {
    const current = (form[key] as string[]) ?? [];
    update({
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const current = form.tags ?? [];
    if (!current.includes(t)) update({ tags: [...current, t] });
    setTagInput('');
  };

  const removeTag = (t: string) =>
    update({ tags: (form.tags ?? []).filter((x) => x !== t) });

  /* ───────────────────────── step validation ───────────────────────── */

  const identityOk = useMemo(
    () => Boolean(form.business_name?.trim() || form.headline?.trim()),
    [form.business_name, form.headline]
  );

  const canProceed = useMemo(() => {
    if (step === 0) return identityOk;
    return true;
  }, [step, identityOk]);

  /* ───────────────────────── navigation ───────────────────────── */

  const goNext = () => {
    setError(null);
    if (step === 0 && !identityOk) {
      setError('Please add either a business name or a headline to continue.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ───────────────────────── submit ───────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    let currentTags = form.tags ?? [];
    const trimmedPendingTag = tagInput.trim();
    if (trimmedPendingTag && !currentTags.includes(trimmedPendingTag)) {
      currentTags = [...currentTags, trimmedPendingTag];
      setTagInput('');
    }

    if (!form.headline?.trim() && !form.business_name?.trim()) {
      setError('Please add either a headline or a business name.');
      setStep(0);
      return;
    }

    try {
      await onCreate({
        ...form,
        tags: currentTags,
        headline: form.headline?.trim() || undefined,
        business_name: form.business_name?.trim() || undefined,
        tagline: form.tagline?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        whatsapp: form.whatsapp?.trim() || undefined,
        email: form.email?.trim() || undefined,
        website_url: form.website_url?.trim() || undefined,
        linkedin_url: form.linkedin_url?.trim() || undefined,
        facebook_url: form.facebook_url?.trim() || undefined,
        instagram_url: form.instagram_url?.trim() || undefined,
        country: form.country?.trim() || undefined,
        region: form.region?.trim() || undefined,
        city: form.city?.trim() || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  /* ───────────────────────── render ───────────────────────── */

  const isLast = step === STEPS.length - 1;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Hero Header */}
      <div className="relative mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          New portfolio
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Build your professional portfolio
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We'll walk you through it — step {step + 1} of {STEPS.length}.
        </p>
      </div>

      {/* Step indicator */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                      done
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                        : active
                        ? 'border-blue-600 bg-white text-blue-600 shadow-sm shadow-blue-500/20 dark:bg-slate-900 dark:text-blue-400'
                        : 'border-slate-200 bg-white/60 text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500'
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`hidden text-[11px] font-semibold sm:block ${
                      active
                        ? 'text-blue-700 dark:text-blue-400'
                        : done
                        ? 'text-slate-600 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-[2px] flex-1 rounded-full transition-all duration-300 ${
                      done ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 backdrop-blur-md dark:text-rose-400"
          >
            <X className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ───────── Step 1 — Identity ───────── */}
        {step === 0 && (
          <section className={GLASS_CARD}>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <User className="h-4 w-4 text-blue-500" />
              Who you are
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="business_name" className={GLASS_LABEL}>
                  Business name
                </label>
                <input
                  id="business_name"
                  value={form.business_name ?? ''}
                  onChange={(e) => update({ business_name: e.target.value })}
                  placeholder="e.g. Stricker Cars"
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label htmlFor="headline" className={GLASS_LABEL}>
                  Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="headline"
                  value={form.headline ?? ''}
                  onChange={(e) => update({ headline: e.target.value })}
                  placeholder="e.g. Mobile Auto Mechanic — Cameroon"
                  disabled={saving}
                  className={GLASS_INPUT}
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Either a business name or a headline is required.
                </p>
              </div>

              <div>
                <label htmlFor="tagline" className={GLASS_LABEL}>
                  Tagline
                </label>
                <input
                  id="tagline"
                  value={form.tagline ?? ''}
                  onChange={(e) => update({ tagline: e.target.value })}
                  placeholder="e.g. Diagnostics at your doorstep"
                  disabled={saving}
                  className={GLASS_INPUT}
                />
              </div>

              <div>
                <label htmlFor="bio" className={GLASS_LABEL}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={form.bio ?? ''}
                  onChange={(e) => update({ bio: e.target.value })}
                  rows={4}
                  placeholder="A short paragraph about your experience and what you offer"
                  disabled={saving}
                  className={`${GLASS_INPUT} resize-none`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="years_experience" className={GLASS_LABEL}>
                    Years of experience
                  </label>
                  <input
                    id="years_experience"
                    type="number"
                    min={0}
                    value={form.years_experience ?? ''}
                    onChange={(e) =>
                      update({
                        years_experience:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="team_size" className={GLASS_LABEL}>
                    Team size
                  </label>
                  <input
                    id="team_size"
                    type="number"
                    min={1}
                    value={form.team_size ?? ''}
                    onChange={(e) =>
                      update({
                        team_size:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ───────── Step 2 — Specialties ───────── */}
        {step === 1 && (
          <section className={GLASS_CARD}>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Grid className="h-4 w-4 text-blue-500" />
              What you do
            </h2>

            {categories.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No categories available yet — you can add specialties later.
              </p>
            ) : (
              <div className="space-y-5">
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {cat.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(cat.specialties ?? []).map((spec) => {
                        const active = (form.specialty_ids ?? []).includes(
                          spec.id
                        );
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              toggleFromArray('specialty_ids', spec.id)
                            }
                            className={`${CHIP_BASE} ${
                              active ? CHIP_ACTIVE : CHIP_IDLE
                            }`}
                          >
                            {spec.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ───────── Step 3 — Contact & Coverage ───────── */}
        {step === 2 && (
          <>
            <section className={GLASS_CARD}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <Phone className="h-4 w-4 text-blue-500" />
                How to reach you
              </h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className={GLASS_LABEL}>
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone ?? ''}
                      onChange={(e) => update({ phone: e.target.value })}
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className={GLASS_LABEL}>
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      value={form.whatsapp ?? ''}
                      onChange={(e) => update({ whatsapp: e.target.value })}
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={GLASS_LABEL}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => update({ email: e.target.value })}
                    disabled={saving}
                    className={GLASS_INPUT}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="website_url" className={GLASS_LABEL}>
                      Website
                    </label>
                    <input
                      id="website_url"
                      type="url"
                      value={form.website_url ?? ''}
                      onChange={(e) => update({ website_url: e.target.value })}
                      placeholder="https://"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin_url" className={GLASS_LABEL}>
                      LinkedIn
                    </label>
                    <input
                      id="linkedin_url"
                      type="url"
                      value={form.linkedin_url ?? ''}
                      onChange={(e) => update({ linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/…"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="facebook_url" className={GLASS_LABEL}>
                      Facebook
                    </label>
                    <input
                      id="facebook_url"
                      type="url"
                      value={form.facebook_url ?? ''}
                      onChange={(e) => update({ facebook_url: e.target.value })}
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram_url" className={GLASS_LABEL}>
                      Instagram
                    </label>
                    <input
                      id="instagram_url"
                      type="url"
                      value={form.instagram_url ?? ''}
                      onChange={(e) => update({ instagram_url: e.target.value })}
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={GLASS_CARD}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <MapPin className="h-4 w-4 text-blue-500" />
                Where you work
              </h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="country" className={GLASS_LABEL}>
                      Country
                    </label>
                    <input
                      id="country"
                      value={form.country ?? ''}
                      onChange={(e) => update({ country: e.target.value })}
                      placeholder="Cameroon"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className={GLASS_LABEL}>
                      Region
                    </label>
                    <input
                      id="region"
                      value={form.region ?? ''}
                      onChange={(e) => update({ region: e.target.value })}
                      placeholder="Centre"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className={GLASS_LABEL}>
                      City
                    </label>
                    <input
                      id="city"
                      value={form.city ?? ''}
                      onChange={(e) => update({ city: e.target.value })}
                      placeholder="Yaoundé"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service_radius_km" className={GLASS_LABEL}>
                    Service radius (km)
                  </label>
                  <input
                    id="service_radius_km"
                    type="number"
                    min={0}
                    max={500}
                    value={form.service_radius_km ?? ''}
                    onChange={(e) =>
                      update({
                        service_radius_km:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="25"
                    disabled={saving}
                    className={`${GLASS_INPUT} max-w-[180px]`}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <label
                    className={`inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/50 px-3 py-2 backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-800/40 ${
                      saving
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.travels_to_client ?? true}
                      onChange={(e) =>
                        update({ travels_to_client: e.target.checked })
                      }
                      disabled={saving}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Travels to client
                    </span>
                  </label>
                  <label
                    className={`inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/50 px-3 py-2 backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-800/40 ${
                      saving
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.works_remotely ?? false}
                      onChange={(e) =>
                        update({ works_remotely: e.target.checked })
                      }
                      disabled={saving}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Works remotely
                    </span>
                  </label>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ───────── Step 4 — Pricing ───────── */}
        {step === 3 && (
          <section className={GLASS_CARD}>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
              <Coins className="h-4 w-4 text-blue-500" />
              How you charge
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="currency" className={GLASS_LABEL}>
                  Currency
                </label>
                <select
                  id="currency"
                  value={form.currency ?? 'XAF'}
                  onChange={(e) => update({ currency: e.target.value })}
                  disabled={saving}
                  className={`${GLASS_SELECT} max-w-[160px]`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className={GLASS_LABEL}>Payment methods</div>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const active = (form.payment_methods ?? []).includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={saving}
                        onClick={() => toggleFromArray('payment_methods', m)}
                        className={`${CHIP_BASE} capitalize ${
                          active ? CHIP_ACTIVE : CHIP_IDLE
                        }`}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label
                className={`inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/50 px-3 py-2 backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-800/40 ${
                  saving
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.accepts_negotiation ?? true}
                  onChange={(e) =>
                    update({ accepts_negotiation: e.target.checked })
                  }
                  disabled={saving}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Open to negotiation
                </span>
              </label>
            </div>
          </section>
        )}

        {/* ───────── Step 5 — Review & Publish ───────── */}
        {step === 4 && (
          <>
            <section className={GLASS_CARD}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <LanguagesIcon className="h-4 w-4 text-blue-500" />
                Languages & tags
              </h2>

              <div className="space-y-5">
                <div>
                  <div className={GLASS_LABEL}>Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_LANGUAGES.map((l) => {
                      const active = (form.languages ?? []).includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          disabled={saving}
                          onClick={() => toggleFromArray('languages', l)}
                          className={`${CHIP_BASE} ${
                            active ? CHIP_ACTIVE : CHIP_IDLE
                          }`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="tag-input" className={GLASS_LABEL}>
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="e.g. mobile mechanic, engine diagnostics"
                      disabled={saving}
                      className={GLASS_INPUT}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={saving || !tagInput.trim()}
                      className="shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {(form.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(form.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300"
                        >
                          <Tag className="h-3 w-3 text-slate-400" />
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            disabled={saving}
                            className="text-slate-400 transition-colors hover:text-rose-500 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <label
                  className={`inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/50 px-3 py-2 backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-800/40 ${
                    saving
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.is_public ?? true}
                    onChange={(e) => update({ is_public: e.target.checked })}
                    disabled={saving}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Make my portfolio public
                  </span>
                </label>
              </div>
            </section>

            {/* Summary */}
            <section className={GLASS_CARD}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Review your portfolio
              </h2>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryRow label="Business name" value={form.business_name} />
                <SummaryRow label="Headline" value={form.headline} />
                <SummaryRow label="Tagline" value={form.tagline} />
                <SummaryRow
                  label="Experience"
                  value={
                    form.years_experience != null
                      ? `${form.years_experience} yrs`
                      : undefined
                  }
                />
                <SummaryRow
                  label="Team size"
                  value={form.team_size ? String(form.team_size) : undefined}
                />
                <SummaryRow label="Email" value={form.email} />
                <SummaryRow label="Phone" value={form.phone} />
                <SummaryRow label="WhatsApp" value={form.whatsapp} />
                <SummaryRow
                  label="Location"
                  value={[form.city, form.region, form.country]
                    .filter(Boolean)
                    .join(', ')}
                />
                <SummaryRow
                  label="Service radius"
                  value={
                    form.service_radius_km != null
                      ? `${form.service_radius_km} km`
                      : undefined
                  }
                />
                <SummaryRow label="Currency" value={form.currency} />
                <SummaryRow
                  label="Specialties"
                  value={
                    (form.specialty_ids ?? []).length
                      ? `${(form.specialty_ids ?? []).length} selected`
                      : undefined
                  }
                />
                <SummaryRow
                  label="Payment methods"
                  value={
                    (form.payment_methods ?? []).length
                      ? (form.payment_methods ?? [])
                          .map((m) => m.replace('_', ' '))
                          .join(', ')
                      : undefined
                  }
                />
                <SummaryRow
                  label="Languages"
                  value={
                    (form.languages ?? []).length
                      ? (form.languages ?? []).join(', ')
                      : undefined
                  }
                />
                <SummaryRow
                  label="Tags"
                  value={
                    (form.tags ?? []).length
                      ? (form.tags ?? []).join(', ')
                      : undefined
                  }
                />
                <SummaryRow
                  label="Visibility"
                  value={form.is_public ? 'Public' : 'Private'}
                />
                <SummaryRow
                  label="Travels to client"
                  value={form.travels_to_client ? 'Yes' : 'No'}
                />
                <SummaryRow
                  label="Works remotely"
                  value={form.works_remotely ? 'Yes' : 'No'}
                />
              </dl>
            </section>
          </>
        )}

        {/* ───────── Navigation ───────── */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-md transition-all hover:bg-white/80 disabled:opacity-40 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {saving ? 'Creating portfolio…' : 'Create portfolio'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────── SummaryRow ───────────────────────── */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const has = value != null && String(value).trim() !== '';
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-2 last:border-b-0 dark:border-slate-800/60">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd
        className={`text-right text-sm ${
          has
            ? 'font-medium text-slate-900 dark:text-slate-100'
            : 'italic text-slate-400 dark:text-slate-600'
        }`}
      >
        {has ? value : '—'}
      </dd>
    </div>
  );
}