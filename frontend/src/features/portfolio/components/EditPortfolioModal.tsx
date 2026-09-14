import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type { Portfolio, PortfolioUpdateInput } from '../types/portfolio.types';

interface EditPortfolioModalProps {
  open: boolean;
  portfolio: Portfolio;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: PortfolioUpdateInput) => Promise<void>;
}

export default function EditPortfolioModal({
  open,
  portfolio,
  saving = false,
  onClose,
  onSubmit,
}: EditPortfolioModalProps) {
  const [form, setForm] = useState<PortfolioUpdateInput>({});
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      headline: portfolio.headline ?? '',
      tagline: portfolio.tagline ?? '',
      bio: portfolio.bio ?? '',
      mission_statement: portfolio.mission_statement ?? '',
      business_name: portfolio.business_name ?? '',
      business_description: portfolio.business_description ?? '',
      years_experience: portfolio.years_experience ?? undefined,
      years_in_business: portfolio.years_in_business ?? undefined,
      team_size: portfolio.team_size ?? undefined,
      cover_image_url: portfolio.cover_image_url ?? '',
      intro_video_url: portfolio.intro_video_url ?? '',
      phone: portfolio.phone ?? '',
      whatsapp: portfolio.whatsapp ?? '',
      email: portfolio.email ?? '',
      website_url: portfolio.website_url ?? '',
      linkedin_url: portfolio.linkedin_url ?? '',
      facebook_url: portfolio.facebook_url ?? '',
      instagram_url: portfolio.instagram_url ?? '',
      tiktok_url: portfolio.tiktok_url ?? '',
      country: portfolio.country ?? '',
      region: portfolio.region ?? '',
      city: portfolio.city ?? '',
      service_area: portfolio.service_area ?? '',
      service_radius_km: portfolio.service_radius_km ?? undefined,
      travels_to_client: portfolio.travels_to_client,
      works_remotely: portfolio.works_remotely,
      license_number: portfolio.license_number ?? '',
      license_authority: portfolio.license_authority ?? '',
      insurance_provider: portfolio.insurance_provider ?? '',
      currency: portfolio.currency,
      payment_methods: portfolio.payment_methods ?? [],
      accepts_negotiation: portfolio.accepts_negotiation,
      tags: portfolio.tags ?? [],
      languages: portfolio.languages ?? [],
      is_public: portfolio.is_public,
    });
    setError(null);
  }, [open, portfolio]);

  if (!open) return null;

  const update = (patch: Partial<PortfolioUpdateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

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
    await onSubmit(form);
  };

  const inputStyles =
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4 pt-16 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
        {/* Header (Sticky at top of modal) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            Edit portfolio
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-900 dark:text-slate-100"
        >
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/40 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Identity
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Business name
                </label>
                <input
                  value={form.business_name ?? ''}
                  onChange={(e) => update({ business_name: e.target.value })}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Headline
                </label>
                <input
                  value={form.headline ?? ''}
                  onChange={(e) => update({ headline: e.target.value })}
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tagline
              </label>
              <input
                value={form.tagline ?? ''}
                onChange={(e) => update({ tagline: e.target.value })}
                className={inputStyles}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                value={form.bio ?? ''}
                onChange={(e) => update({ bio: e.target.value })}
                rows={3}
                className={`${inputStyles} resize-none`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mission statement
              </label>
              <textarea
                value={form.mission_statement ?? ''}
                onChange={(e) => update({ mission_statement: e.target.value })}
                rows={2}
                className={`${inputStyles} resize-none`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Years of experience
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.years_experience ?? ''}
                  onChange={(e) =>
                    update({
                      years_experience:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Years in business
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.years_in_business ?? ''}
                  onChange={(e) =>
                    update({
                      years_in_business:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Team size
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.team_size ?? ''}
                  onChange={(e) =>
                    update({
                      team_size:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cover image URL
              </label>
              <input
                value={form.cover_image_url ?? ''}
                onChange={(e) => update({ cover_image_url: e.target.value })}
                placeholder="https://…"
                className={inputStyles}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Contact
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.phone ?? ''}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="Phone"
                className={inputStyles}
              />
              <input
                value={form.whatsapp ?? ''}
                onChange={(e) => update({ whatsapp: e.target.value })}
                placeholder="WhatsApp"
                className={inputStyles}
              />
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="Email"
                className={inputStyles}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.website_url ?? ''}
                onChange={(e) => update({ website_url: e.target.value })}
                placeholder="Website URL"
                className={inputStyles}
              />
              <input
                value={form.linkedin_url ?? ''}
                onChange={(e) => update({ linkedin_url: e.target.value })}
                placeholder="LinkedIn URL"
                className={inputStyles}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.facebook_url ?? ''}
                onChange={(e) => update({ facebook_url: e.target.value })}
                placeholder="Facebook URL"
                className={inputStyles}
              />
              <input
                value={form.instagram_url ?? ''}
                onChange={(e) => update({ instagram_url: e.target.value })}
                placeholder="Instagram URL"
                className={inputStyles}
              />
              <input
                value={form.tiktok_url ?? ''}
                onChange={(e) => update({ tiktok_url: e.target.value })}
                placeholder="TikTok URL"
                className={inputStyles}
              />
            </div>
          </div>

          {/* Coverage */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Coverage
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.country ?? ''}
                onChange={(e) => update({ country: e.target.value })}
                placeholder="Country"
                className={inputStyles}
              />
              <input
                value={form.region ?? ''}
                onChange={(e) => update({ region: e.target.value })}
                placeholder="Region"
                className={inputStyles}
              />
              <input
                value={form.city ?? ''}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="City"
                className={inputStyles}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.service_area ?? ''}
                onChange={(e) => update({ service_area: e.target.value })}
                placeholder="Service area (text)"
                className={inputStyles}
              />
              <input
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
                placeholder="Service radius (km)"
                className={inputStyles}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.travels_to_client ?? false}
                  onChange={(e) => update({ travels_to_client: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Travels to client
                </span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.works_remotely ?? false}
                  onChange={(e) => update({ works_remotely: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Works remotely
                </span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.accepts_negotiation ?? true}
                  onChange={(e) =>
                    update({ accepts_negotiation: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Open to negotiation
                </span>
              </label>
            </div>
          </div>

          {/* Trust */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Trust & credentials
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.license_number ?? ''}
                onChange={(e) => update({ license_number: e.target.value })}
                placeholder="License number"
                className={inputStyles}
              />
              <input
                value={form.license_authority ?? ''}
                onChange={(e) => update({ license_authority: e.target.value })}
                placeholder="Issuing authority"
                className={inputStyles}
              />
              <input
                value={form.insurance_provider ?? ''}
                onChange={(e) => update({ insurance_provider: e.target.value })}
                placeholder="Insurance provider"
                className={inputStyles}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tags
            </h4>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className={`flex-1 ${inputStyles}`}
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Add
              </button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(form.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={form.is_public ?? true}
                onChange={(e) => update({ is_public: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Portfolio is public
              </span>
            </label>
          </div>
        </form>

        {/* Footer (Sticky at bottom of modal) */}
        <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}