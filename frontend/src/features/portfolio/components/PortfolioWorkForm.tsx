import { useEffect, useState } from 'react';
import { Loader2, Save, X, Briefcase, Star } from 'lucide-react';
import type {
  ClientType,
  DurationUnit,
  Service,
  Work,
  WorkCreateInput,
} from '../types/portfolio.types';
import { CLIENT_TYPES, DURATION_UNITS } from '../types/portfolio.types';

interface PortfolioWorkFormProps {
  open: boolean;
  initial?: Work | null;
  services: Service[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (input: WorkCreateInput) => Promise<void>;
}

const EMPTY: WorkCreateInput = {
  title: '',
  description: '',
  service_category: '',
  location: '',
  completed_at: undefined,
  duration_value: undefined,
  duration_unit: undefined,
  team_size: undefined,
  client_type: undefined,
  cost: undefined,
  client_name: '',
  client_testimonial: '',
  rating: undefined,
  service_id: undefined,
};

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20';

const labelCls =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300';

export default function PortfolioWorkForm({
  open,
  initial,
  services,
  saving = false,
  onClose,
  onSubmit,
}: PortfolioWorkFormProps) {
  const [form, setForm] = useState<WorkCreateInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        service_category: initial.service_category ?? '',
        location: initial.location ?? '',
        completed_at: initial.completed_at ?? undefined,
        duration_value: initial.duration_value ?? undefined,
        duration_unit: (initial.duration_unit ?? undefined) as DurationUnit | undefined,
        team_size: initial.team_size ?? undefined,
        client_type: (initial.client_type ?? undefined) as ClientType | undefined,
        cost: initial.cost ?? undefined,
        client_name: initial.client_name ?? '',
        client_testimonial: initial.client_testimonial ?? '',
        rating: initial.rating ?? undefined,
        service_id: initial.service_id ?? undefined,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const update = (patch: Partial<WorkCreateInput>) =>
    setForm((prev) => ({ ...prev, ...patch }));

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
      service_category: form.service_category?.trim() || undefined,
      location: form.location?.trim() || undefined,
      client_name: form.client_name?.trim() || undefined,
      client_testimonial: form.client_testimonial?.trim() || undefined,
      completed_at: form.completed_at
        ? new Date(form.completed_at).toISOString()
        : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity dark:bg-slate-950/80"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initial ? 'Edit work project' : 'Add new work project'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showcase your portfolio project details and feedback
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-6"
        >
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. House Electrical Installation"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              placeholder="What did you do? Challenges, materials, outcome…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <input
                value={form.service_category ?? ''}
                onChange={(e) => update({ service_category: e.target.value })}
                placeholder="e.g. Electrical"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                value={form.location ?? ''}
                onChange={(e) => update({ location: e.target.value })}
                placeholder="e.g. Odza, Yaoundé"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Completed on</label>
              <input
                type="date"
                value={form.completed_at?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  update({ completed_at: e.target.value || undefined })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Linked service</label>
              <select
                value={form.service_id ?? ''}
                onChange={(e) =>
                  update({ service_id: e.target.value || undefined })
                }
                className={inputCls}
              >
                <option value="" className="dark:bg-slate-900">
                  None
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-slate-900">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Duration</label>
              <input
                type="number"
                min={0}
                value={form.duration_value ?? ''}
                onChange={(e) =>
                  update({
                    duration_value:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select
                value={form.duration_unit ?? ''}
                onChange={(e) =>
                  update({
                    duration_unit: (e.target.value || undefined) as
                      | DurationUnit
                      | undefined,
                  })
                }
                className={inputCls}
              >
                <option value="" className="dark:bg-slate-900">
                  —
                </option>
                {DURATION_UNITS.map((u) => (
                  <option key={u} value={u} className="dark:bg-slate-900">
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Team size</label>
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
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Client type</label>
              <select
                value={form.client_type ?? ''}
                onChange={(e) =>
                  update({
                    client_type: (e.target.value || undefined) as
                      | ClientType
                      | undefined,
                  })
                }
                className={inputCls}
              >
                <option value="" className="dark:bg-slate-900">
                  —
                </option>
                {CLIENT_TYPES.map((c) => (
                  <option key={c} value={c} className="dark:bg-slate-900">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Cost (XAF)</label>
              <input
                type="number"
                min={0}
                step={500}
                value={form.cost ?? ''}
                onChange={(e) =>
                  update({
                    cost: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Client feedback section */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Client feedback (optional)</span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Client name</label>
                <input
                  value={form.client_name ?? ''}
                  onChange={(e) => update({ client_name: e.target.value })}
                  placeholder="e.g. Mrs. Ngu"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Rating</label>
                <div className="flex gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        update({ rating: form.rating === r ? undefined : r })
                      }
                      className={`flex h-9 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                        form.rating === r
                          ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30 dark:bg-amber-400 dark:text-slate-950'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r} ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Testimonial</label>
              <textarea
                value={form.client_testimonial ?? ''}
                onChange={(e) => update({ client_testimonial: e.target.value })}
                rows={2}
                placeholder="What did the client say?"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {initial ? 'Save changes' : 'Add project'}
          </button>
        </div>
      </div>
    </div>
  );
}