import { useEffect, useState } from 'react';
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

  if (!open) return null;

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
    update({ [key]: [...current, value] } as Partial<ServiceCreateInput>);
    setText('');
  };

  const removeFromList = (key: 'whats_included' | 'whats_excluded', value: string) => {
    update({
      [key]: (form[key] ?? []).filter((v) => v !== value),
    } as Partial<ServiceCreateInput>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || form.title.trim().length < 2) {
      setError('Title must be at least 2 characters.');
      return;
    }
    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      category: form.category?.trim() || undefined,
      service_area: form.service_area?.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-12 sm:pt-16 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Glass Modal Card */}
      <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-3xl flex flex-col max-h-[85vh]">
        
        {/* Soft iPhone Glow Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              {initial ? 'Edit Service' : 'Add New Service'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your service parameters and details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="portfolio-service-form"
          onSubmit={handleSubmit}
          className="relative z-10 flex-1 space-y-4 overflow-y-auto p-6 scrollbar-none"
        >
          {error && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400 backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Service Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Service title <span className="text-rose-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Full Vehicle Inspection"
              className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              placeholder="What does this service include?"
              className="w-full resize-none rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Category & Service Area */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Category
              </label>
              <input
                value={form.category ?? ''}
                onChange={(e) => update({ category: e.target.value })}
                placeholder="e.g. Maintenance"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Service area
              </label>
              <input
                value={form.service_area ?? ''}
                onChange={(e) => update({ service_area: e.target.value })}
                placeholder="e.g. Yaoundé and surroundings"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Pricing, Type, & Duration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Starting price
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={form.starting_price ?? ''}
                onChange={(e) =>
                  update({
                    starting_price: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Pricing type
              </label>
              <select
                value={form.pricing_type ?? ''}
                onChange={(e) =>
                  update({
                    pricing_type: (e.target.value || undefined) as PricingType | undefined,
                  })
                }
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
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
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Duration
              </label>
              <input
                value={form.estimated_duration ?? ''}
                onChange={(e) => update({ estimated_duration: e.target.value })}
                placeholder="e.g. 2 hours"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* What's Included & What's Excluded */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Whats Included */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                What's included
              </label>
              <div className="flex gap-2">
                <input
                  value={includeText}
                  onChange={(e) => setIncludeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList('whats_included', includeText, setIncludeText);
                    }
                  }}
                  placeholder="Add item..."
                  className="flex-1 rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => addToList('whats_included', includeText, setIncludeText)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {(form.whats_included ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(form.whats_included ?? []).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList('whats_included', item)}
                        className="hover:text-rose-500 transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Whats Excluded */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                What's not included
              </label>
              <div className="flex gap-2">
                <input
                  value={excludeText}
                  onChange={(e) => setExcludeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList('whats_excluded', excludeText, setExcludeText);
                    }
                  }}
                  placeholder="Add item..."
                  className="flex-1 rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => addToList('whats_excluded', excludeText, setExcludeText)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {(form.whats_excluded ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(form.whats_excluded ?? []).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-500/20"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList('whats_excluded', item)}
                        className="hover:text-rose-500 transition-colors ml-0.5"
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
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Warranty (days)
              </label>
              <input
                type="number"
                min={0}
                value={form.warranty_days ?? ''}
                onChange={(e) =>
                  update({
                    warranty_days: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                placeholder="e.g. 30"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Lead time (days)
              </label>
              <input
                type="number"
                min={0}
                value={form.lead_time_days ?? ''}
                onChange={(e) =>
                  update({
                    lead_time_days: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                placeholder="e.g. 2"
                className="w-full rounded-md border border-slate-200/80 bg-slate-100/60 dark:border-slate-700/50 dark:bg-slate-800/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {/* Active Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200/80 bg-slate-100/50 dark:border-slate-800/80 dark:bg-slate-800/40 p-2.5 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
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
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>

            {/* Emergency Service Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200/80 bg-slate-100/50 dark:border-slate-800/80 dark:bg-slate-800/40 p-2.5 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
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
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 dark:border-slate-800/60 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md bg-slate-200/60 dark:bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all backdrop-blur-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 transition-all"
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
}