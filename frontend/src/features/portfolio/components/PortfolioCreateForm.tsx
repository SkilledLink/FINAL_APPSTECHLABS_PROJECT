import { useState } from 'react';
import { Loader2, Sparkles, X, Tag, Grid } from 'lucide-react';
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

/* Shared field styles */
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20';

const sectionCls =
  'space-y-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80';

const labelCls =
  'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

const sectionTitleCls =
  'text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2';

export default function PortfolioCreateForm({
  categories,
  saving = false,
  onCreate,
}: PortfolioCreateFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let currentTags = form.tags ?? [];
    const trimmedPendingTag = tagInput.trim();
    if (trimmedPendingTag && !currentTags.includes(trimmedPendingTag)) {
      currentTags = [...currentTags, trimmedPendingTag];
      setTagInput('');
    }

    if (!form.headline?.trim() && !form.business_name?.trim()) {
      setError('Please add either a headline or a business name.');
      return;
    }

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
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" />
          New portfolio
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Build your professional portfolio
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Tell customers who you are, what you do, and where you work. You can
          refine everything later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            <X className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Identity */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Identity</h2>

          <div>
            <label htmlFor="business_name" className={labelCls}>
              Business name
            </label>
            <input
              id="business_name"
              value={form.business_name ?? ''}
              onChange={(e) => update({ business_name: e.target.value })}
              placeholder="e.g. Stricker Cars"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="headline" className={labelCls}>
              Headline
            </label>
            <input
              id="headline"
              value={form.headline ?? ''}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="e.g. Mobile Auto Mechanic — Cameroon"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="tagline" className={labelCls}>
              Tagline
            </label>
            <input
              id="tagline"
              value={form.tagline ?? ''}
              onChange={(e) => update({ tagline: e.target.value })}
              placeholder="e.g. Diagnostics at your doorstep"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="bio" className={labelCls}>
              Bio
            </label>
            <textarea
              id="bio"
              value={form.bio ?? ''}
              onChange={(e) => update({ bio: e.target.value })}
              rows={4}
              placeholder="A short paragraph about your experience and what you offer"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="years_experience" className={labelCls}>
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
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="team_size" className={labelCls}>
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
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Categories / Specialties */}
        {categories.length > 0 && (
          <section className={sectionCls}>
            <h2 className={sectionTitleCls}>
              <Grid className="h-4 w-4 text-cyan-500" /> Categories & Specialties
            </h2>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(cat.specialties ?? []).map((spec) => {
                      const active = (form.specialty_ids ?? []).includes(spec.id);
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => toggleFromArray('specialty_ids', spec.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                            active
                              ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/20'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-400'
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
          </section>
        )}

        {/* Contact */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Contact</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelCls}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone ?? ''}
                onChange={(e) => update({ phone: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className={labelCls}>
                WhatsApp
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={form.whatsapp ?? ''}
                onChange={(e) => update({ whatsapp: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => update({ email: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website_url" className={labelCls}>
                Website
              </label>
              <input
                id="website_url"
                type="url"
                value={form.website_url ?? ''}
                onChange={(e) => update({ website_url: e.target.value })}
                placeholder="https://"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="linkedin_url" className={labelCls}>
                LinkedIn
              </label>
              <input
                id="linkedin_url"
                type="url"
                value={form.linkedin_url ?? ''}
                onChange={(e) => update({ linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/…"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="facebook_url" className={labelCls}>
                Facebook
              </label>
              <input
                id="facebook_url"
                type="url"
                value={form.facebook_url ?? ''}
                onChange={(e) => update({ facebook_url: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="instagram_url" className={labelCls}>
                Instagram
              </label>
              <input
                id="instagram_url"
                type="url"
                value={form.instagram_url ?? ''}
                onChange={(e) => update({ instagram_url: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Coverage</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="country" className={labelCls}>
                Country
              </label>
              <input
                id="country"
                value={form.country ?? ''}
                onChange={(e) => update({ country: e.target.value })}
                placeholder="Cameroon"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="region" className={labelCls}>
                Region
              </label>
              <input
                id="region"
                value={form.region ?? ''}
                onChange={(e) => update({ region: e.target.value })}
                placeholder="Centre"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="city" className={labelCls}>
                City
              </label>
              <input
                id="city"
                value={form.city ?? ''}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="Yaoundé"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="service_radius_km" className={labelCls}>
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
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              placeholder="25"
              className={`${inputCls} max-w-[160px]`}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.travels_to_client ?? true}
                onChange={(e) => update({ travels_to_client: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:checked:bg-cyan-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Travels to client
              </span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.works_remotely ?? false}
                onChange={(e) => update({ works_remotely: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:checked:bg-cyan-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Works remotely
              </span>
            </label>
          </div>
        </section>

        {/* Pricing */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Pricing</h2>

          <div>
            <label htmlFor="currency" className={labelCls}>
              Currency
            </label>
            <select
              id="currency"
              value={form.currency ?? 'XAF'}
              onChange={(e) => update({ currency: e.target.value })}
              className={`${inputCls} max-w-[140px]`}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c} className="dark:bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment methods
            </div>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => {
                const active = (form.payment_methods ?? []).includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleFromArray('payment_methods', m)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                      active
                        ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/20'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-400'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.accepts_negotiation ?? true}
              onChange={(e) => update({ accepts_negotiation: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:checked:bg-cyan-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Open to negotiation
            </span>
          </label>
        </section>

        {/* Discovery */}
        <section className={sectionCls}>
          <h2 className={sectionTitleCls}>Discovery</h2>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Languages
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((l) => {
                const active = (form.languages ?? []).includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleFromArray('languages', l)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-600 dark:shadow-cyan-600/20'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-cyan-400'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="tag-input" className={labelCls}>
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
                className={inputCls}
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
              >
                Add
              </button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(form.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Tag className="h-3 w-3 text-slate-400" />
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-slate-400 transition-colors hover:text-rose-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.is_public ?? true}
              onChange={(e) => update({ is_public: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:checked:bg-cyan-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Make my portfolio public
            </span>
          </label>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:scale-[0.99] disabled:translate-y-0 disabled:opacity-60 dark:bg-cyan-600 dark:shadow-cyan-900/30 dark:hover:bg-cyan-500"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {saving ? 'Creating portfolio…' : 'Create portfolio'}
        </button>
      </form>
    </div>
  );
}