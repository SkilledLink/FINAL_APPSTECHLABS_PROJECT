import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, Plus, Save, X, Zap } from 'lucide-react';
import type {
  PricingType,
  Service,
  ServiceCreateInput,
} from '../types/portfolio.types';
import { PRICING_TYPES } from '../types/portfolio.types';

interface PortfolioServiceFormProps {
  open: boolean;
  initial?: Service | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: ServiceCreateInput) => Promise<void>;
}

const EMPTY: ServiceCreateInput = {
  title: '',
  description: '',
  category: '',
  starting_price: undefined,
  pricing_type: undefined,
  estimated_duration: '',
  service_area: '',
  is_active: true,
  is_emergency_service: false,
  gallery: [],
  whats_included: [],
  whats_excluded: [],
  faqs: [],
};

/* ───────────────────────── Glass design tokens ───────────────────────── */

const GLASS_LABEL =
  'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300';

const GLASS_INPUT =
  'w-full rounded-lg border border-white/50 dark:border-white/10 ' +
  'bg-white/50 dark:bg-slate-800/40 backdrop-blur-md ' +
  'px-3.5 py-2 text-sm text-slate-900 dark:text-white ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:bg-white/80 dark:focus:bg-slate-900/70 ' +
  'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 ' +
  'transition-all duration-200 shadow-sm ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const GLASS_SELECT = `${GLASS_INPUT} appearance-none pr-9`;

const GLASS_CHIP_BTN =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
  'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 ' +
  'transition-all shadow-sm shadow-blue-500/25 disabled:opacity-50';

/* ─────────────────────────────────────────────────────────────────────── */

export default function PortfolioServiceForm({
  open,
  initial,
  saving = false,
  onClose,
  onSubmit,
}: PortfolioServiceFormProps) {
  const [form, setForm] = useState<ServiceCreateInput>(EMPTY);
  const [includeText, setIncludeText] = useState('');
  const [excludeText, setExcludeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  /* Hydrate / reset when opened */
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        category: initial.category ?? '',
        starting_price: initial.starting_price ?? undefined,
        pricing_type: (initial.pricing_type ?? undefined) as PricingType | undefined,
        estimated_duration: initial.estimated_duration ?? '',
        service_area: initial.service_area ?? '',
        is_active: initial.is_active,
        is_emergency_service: initial.is_emergency_service,
        banner_image_url: initial.banner_image_url ?? undefined,
        gallery: initial.gallery ?? [],
        whats_included: initial.whats_included ?? [],
        whats_excluded: initial.whats_excluded ?? [],
        warranty_days: initial.warranty_days ?? undefined,
        lead_time_days: initial.lead_time_days ?? undefined,
        promo_price: initial.promo_price ?? undefined,
        promo_until: initial.promo_until ?? undefined,
        faqs: initial.faqs ?? [],
      });
    } else {
      setForm(EMPTY);
    }
    setIncludeText('');
    setExcludeText('');
    setError(null);
  }, [open, initial]);

  /* Escape to close + body scroll lock + autofocus */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const id = window.setTimeout(() => titleRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(id);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  /* ───────────────────────── helpers ───────────────────────── */

  const update = (patch: Partial<ServiceCreateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const addToList = (
    key: 'whats_included' | 'whats_excluded',
    text: string,
    setText: (v: string) => void
  ) => {
    const value = text.trim();
    if (!value) return;
    const current = form[key] ?? [];
    if (current.includes(value)) {
      setText('');
      return;
    }
    update({ [key]: [...current, value] });
    setText('');
  };

  const removeFromList = (
    key: 'whats_included' | 'whats_excluded',
    value: string
  ) => {
    update({ [key]: (form[key] ?? []).filter((v) => v !== value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setError(null);

    const title = form.title.trim();
    if (title.length < 2) {
      setError('Title must be at least 2 characters.');
      titleRef.current?.focus();
      return;
    }

    try {
      await onSubmit({
        ...form,
        title,
        description: form.description?.trim() || undefined,
        category: form.category?.trim() || undefined,
        service_area: form.service_area?.trim() || undefined,
        banner_image_url: form.banner_image_url?.trim() || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  /* ───────────────────────── render (via portal) ───────────────────────── */

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto
                 p-3 pt-4 pb-4 sm:items-center sm:p-6
                 bg-blue-950/75 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-form-title"
    >
      {/* Backdrop — inert while saving */}
      <div
        className="fixed inset-0"
        onClick={!saving ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Main Glass Modal Card */}
      <div
        className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl
                   border border-white/60 dark:border-white/10
                   bg-white/90 dark:bg-slate-900/90
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]
                   backdrop-blur-3xl max-h-[88vh]"
      >
        {/* Soft glow accent */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
          <div>
            <h3
              id="service-form-title"
              className="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              {initial ? 'Edit Service' : 'Add New Service'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your service parameters and details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md
                       bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800
                       text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="portfolio-service-form"
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 space-y-4 overflow-y-auto p-6
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3
                         text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {/* Service Title */}
          <div>
            <label htmlFor="svc-title" className={GLASS_LABEL}>
              Service title <span className="text-rose-500">*</span>
            </label>
            <input
              id="svc-title"
              ref={titleRef}
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              disabled={saving}
              placeholder="e.g. Full Vehicle Inspection"
              className={GLASS_INPUT}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="svc-desc" className={GLASS_LABEL}>
              Description
            </label>
            <textarea
              id="svc-desc"
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              disabled={saving}
              rows={3}
              placeholder="What does this service include?"
              className={`${GLASS_INPUT} resize-none`}
            />
          </div>

          {/* Category & Service Area */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="svc-category" className={GLASS_LABEL}>
                Category
              </label>
              <input
                id="svc-category"
                value={form.category ?? ''}
                onChange={(e) => update({ category: e.target.value })}
                disabled={saving}
                placeholder="e.g. Maintenance"
                className={GLASS_INPUT}
              />
            </div>

            <div>
              <label htmlFor="svc-area" className={GLASS_LABEL}>
                Service area
              </label>
              <input
                id="svc-area"
                value={form.service_area ?? ''}
                onChange={(e) => update({ service_area: e.target.value })}
                disabled={saving}
                placeholder="e.g. Yaoundé and surroundings"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Banner image URL */}
          <div>
            <label htmlFor="svc-banner" className={GLASS_LABEL}>
              Banner image URL
            </label>
            <input
              id="svc-banner"
              type="url"
              value={form.banner_image_url ?? ''}
              onChange={(e) =>
                update({ banner_image_url: e.target.value || undefined })
              }
              disabled={saving}
              placeholder="https://…"
              className={GLASS_INPUT}
            />
          </div>

          {/* Pricing, Type, & Duration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="svc-price" className={GLASS_LABEL}>
                Starting price (XAF)
              </label>
              <input
                id="svc-price"
                type="number"
                min={0}
                step={500}
                value={form.starting_price ?? ''}
                onChange={(e) =>
                  update({
                    starting_price:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 5000"
                className={GLASS_INPUT}
              />
            </div>

            <div>
              <label htmlFor="svc-ptype" className={GLASS_LABEL}>
                Pricing type
              </label>
              <select
                id="svc-ptype"
                value={form.pricing_type ?? ''}
                onChange={(e) =>
                  update({
                    pricing_type: (e.target.value || undefined) as
                      | PricingType
                      | undefined,
                  })
                }
                disabled={saving}
                className={GLASS_SELECT}
              >
                <option value="">Select…</option>
                {PRICING_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="svc-duration" className={GLASS_LABEL}>
                Duration
              </label>
              <input
                id="svc-duration"
                value={form.estimated_duration ?? ''}
                onChange={(e) => update({ estimated_duration: e.target.value })}
                disabled={saving}
                placeholder="e.g. 2 hours"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Promo */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="svc-promo" className={GLASS_LABEL}>
                Promo price (XAF)
              </label>
              <input
                id="svc-promo"
                type="number"
                min={0}
                step={500}
                value={form.promo_price ?? ''}
                onChange={(e) =>
                  update({
                    promo_price:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="Optional"
                className={GLASS_INPUT}
              />
            </div>
            <div>
              <label htmlFor="svc-promo-until" className={GLASS_LABEL}>
                Promo valid until
              </label>
              <input
                id="svc-promo-until"
                type="date"
                value={
                  typeof form.promo_until === 'string'
                    ? form.promo_until.slice(0, 10)
                    : ''
                }
                onChange={(e) =>
                  update({ promo_until: e.target.value || undefined })
                }
                disabled={saving}
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* What's Included & What's Excluded */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Included */}
            <div>
              <label htmlFor="svc-include" className={GLASS_LABEL}>
                What's included
              </label>
              <div className="flex gap-2">
                <input
                  id="svc-include"
                  value={includeText}
                  onChange={(e) => setIncludeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList('whats_included', includeText, setIncludeText);
                    }
                  }}
                  disabled={saving}
                  placeholder="Add item…"
                  className={`${GLASS_INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={() =>
                    addToList('whats_included', includeText, setIncludeText)
                  }
                  disabled={saving || !includeText.trim()}
                  aria-label="Add included item"
                  className={GLASS_CHIP_BTN}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {(form.whats_included ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(form.whats_included ?? []).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20
                                 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700
                                 dark:bg-emerald-500/20 dark:text-emerald-300"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList('whats_included', item)}
                        disabled={saving}
                        aria-label={`Remove ${item}`}
                        className="ml-0.5 hover:text-rose-500 transition-colors disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excluded */}
            <div>
              <label htmlFor="svc-exclude" className={GLASS_LABEL}>
                What's not included
              </label>
              <div className="flex gap-2">
                <input
                  id="svc-exclude"
                  value={excludeText}
                  onChange={(e) => setExcludeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList('whats_excluded', excludeText, setExcludeText);
                    }
                  }}
                  disabled={saving}
                  placeholder="Add item…"
                  className={`${GLASS_INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={() =>
                    addToList('whats_excluded', excludeText, setExcludeText)
                  }
                  disabled={saving || !excludeText.trim()}
                  aria-label="Add excluded item"
                  className={GLASS_CHIP_BTN}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {(form.whats_excluded ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(form.whats_excluded ?? []).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-500/20
                                 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700
                                 dark:bg-rose-500/20 dark:text-rose-300"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList('whats_excluded', item)}
                        disabled={saving}
                        aria-label={`Remove ${item}`}
                        className="ml-0.5 hover:text-rose-500 transition-colors disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warranty & Lead Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="svc-warranty" className={GLASS_LABEL}>
                Warranty (days)
              </label>
              <input
                id="svc-warranty"
                type="number"
                min={0}
                value={form.warranty_days ?? ''}
                onChange={(e) =>
                  update({
                    warranty_days:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 30"
                className={GLASS_INPUT}
              />
            </div>

            <div>
              <label htmlFor="svc-lead" className={GLASS_LABEL}>
                Lead time (days)
              </label>
              <input
                id="svc-lead"
                type="number"
                min={0}
                value={form.lead_time_days ?? ''}
                onChange={(e) =>
                  update({
                    lead_time_days:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                disabled={saving}
                placeholder="e.g. 2"
                className={GLASS_INPUT}
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {/* Active */}
            <label
              className={`flex items-center justify-between rounded-lg border border-white/50
                          bg-white/50 p-2.5 backdrop-blur-md transition-all
                          hover:bg-white/70 dark:border-white/10 dark:bg-slate-800/40
                          dark:hover:bg-slate-800/60 ${
                            saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Active
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => update({ is_active: e.target.checked })}
                disabled={saving}
                className="peer sr-only"
              />
              <div
                className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors
                           peer-checked:bg-blue-600 dark:bg-slate-700
                           after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4
                           after:rounded-full after:border after:border-slate-300 after:bg-white
                           after:content-[''] after:transition-all
                           peer-checked:after:translate-x-full peer-checked:after:border-white"
              />
            </label>

            {/* Emergency */}
            <label
              className={`flex items-center justify-between rounded-lg border border-white/50
                          bg-white/50 p-2.5 backdrop-blur-md transition-all
                          hover:bg-white/70 dark:border-white/10 dark:bg-slate-800/40
                          dark:hover:bg-slate-800/60 ${
                            saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Emergency service
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.is_emergency_service ?? false}
                onChange={(e) => update({ is_emergency_service: e.target.checked })}
                disabled={saving}
                className="peer sr-only"
              />
              <div
                className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors
                           peer-checked:bg-amber-500 dark:bg-slate-700
                           after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4
                           after:rounded-full after:border after:border-slate-300 after:bg-white
                           after:content-[''] after:transition-all
                           peer-checked:after:translate-x-full peer-checked:after:border-white"
              />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-3.5 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-slate-200/60 px-4 py-2 text-xs font-semibold
                       text-slate-700 backdrop-blur-md transition-all
                       hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300
                       dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600
                       px-5 py-2 text-xs font-semibold text-white shadow-md
                       shadow-blue-500/25 transition-all hover:bg-blue-500
                       active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {initial ? 'Save changes' : 'Add service'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}