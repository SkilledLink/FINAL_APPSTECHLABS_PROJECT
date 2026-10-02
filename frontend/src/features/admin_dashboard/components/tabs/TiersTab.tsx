// src/features/admin/components/tabs/TiersTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  Bot,
  Check,
  Crown,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTiers } from '../../hooks/useTiers';
import type {
  ProfessionalTierDetail,
  TierCreatePayload,
  TierFeature,
  TierFeatureCreatePayload,
  TierFeatureType,
} from '../../types/admin.types';

/* ───────────────────────── AI feature contract ─────────────────────────
 * Backend: app/services/ai/features/portfolio_deep_analysis.py
 *   FEATURE_KEY = "ai_portfolio_deep_analysis"
 *
 * Backend: app/services/professional_ai_usage_service.py
 *   Reads feature.feature_value.get("limit") and .get("period")
 *
 * The admin UI writes exactly that shape.
 * ────────────────────────────────────────────────────────────────────── */
const AI_DEEP_ANALYSIS_KEY = 'ai_portfolio_deep_analysis';
const AI_VALUE_KEY = 'limit';
const AI_PERIOD = 'monthly';
const AI_DEFAULT_LIMIT = 6;

/* ───────────────────────── Constants ───────────────────────── */

const FEATURE_TYPES: TierFeatureType[] = [
  'boolean',
  'numeric',
  'text',
  'json',
];

const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP', 'NGN'];

const FEATURE_ICON: Record<TierFeatureType, React.ReactNode> = {
  boolean: <Check size={12} />,
  numeric: <TrendingUp size={12} />,
  text: <Sparkles size={12} />,
  json: <Layers size={12} />,
};

/* ───────────────────────── Helpers ───────────────────────── */

const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'XAF',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const expanded =
    h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(expanded, 16);
  if (Number.isNaN(n)) return `rgba(59, 130, 246, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Read the AI deep-analysis limit from a tier's features array. */
const readAiLimit = (features: TierFeature[] | undefined): number => {
  const row = features?.find((f) => f.featureKey === AI_DEEP_ANALYSIS_KEY);
  if (!row) return AI_DEFAULT_LIMIT;
  const raw = (row.featureValue ?? {})[AI_VALUE_KEY];
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return AI_DEFAULT_LIMIT;
};

/* ───────────────────────── Tier Modal ───────────────────────── */

interface TierModalSubmit {
  tier: TierCreatePayload;
  aiLimit: number;
}

interface TierModalProps {
  open: boolean;
  initial?: ProfessionalTierDetail | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: TierModalSubmit) => Promise<void>;
}

const EMPTY_TIER: TierCreatePayload = {
  name: '',
  level: 1,
  description: '',
  price: 0,
  currency: 'XAF',
  duration_days: 30,
  is_active: true,
  is_public: true,
  display_order: 0,
  badge_name: '',
  badge_code: '',
  badge_icon: '',
  badge_color: '#3b82f6',
  badge_secondary_color: '#1e40af',
  badge_shape: 'circle',
  badge_description: '',
};

const TierModal: React.FC<TierModalProps> = ({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<TierCreatePayload>(EMPTY_TIER);
  const [aiLimit, setAiLimit] = useState<string>(String(AI_DEFAULT_LIMIT));
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        level: initial.level,
        description: initial.description ?? '',
        price: initial.price,
        currency: initial.currency,
        duration_days: initial.durationDays,
        is_active: initial.isActive,
        is_public: initial.isPublic,
        display_order: initial.displayOrder,
        badge_name: initial.badgeName ?? '',
        badge_code: initial.badgeCode ?? '',
        badge_icon: initial.badgeIcon ?? '',
        badge_color: initial.badgeColor ?? '#3b82f6',
        badge_secondary_color: initial.badgeSecondaryColor ?? '#1e40af',
        badge_shape: initial.badgeShape ?? 'circle',
        badge_description: initial.badgeDescription ?? '',
      });
      setAiLimit(String(readAiLimit(initial.features)));
    } else {
      setForm(EMPTY_TIER);
      setAiLimit(String(AI_DEFAULT_LIMIT));
    }
    setError(null);
    setAiError(null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const update = (patch: Partial<TierCreatePayload>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    setError(null);
    setAiError(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(form.level) || form.level < 1) {
      setError('Level must be at least 1.');
      return;
    }
    if (!Number.isFinite(form.price) || form.price < 0) {
      setError('Price must be a positive number.');
      return;
    }
    if (!Number.isFinite(form.duration_days) || form.duration_days < 1) {
      setError('Duration must be at least 1 day.');
      return;
    }

    // ── AI limit validation (required, positive integer) ──
    const trimmed = aiLimit.trim();
    if (trimmed === '') {
      setAiError('AI analyses per month is required.');
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
      setAiError('Enter a whole number of 1 or more.');
      return;
    }

    try {
      await onSubmit({
        tier: {
          ...form,
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          badge_name: form.badge_name?.trim() || undefined,
          badge_code: form.badge_code?.trim() || undefined,
          badge_icon: form.badge_icon?.trim() || undefined,
          badge_description: form.badge_description?.trim() || undefined,
        },
        aiLimit: parsed,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save tier');
    }
  };

  const badgeColor = form.badge_color || '#3b82f6';

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md sm:items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(badgeColor, 0.25)}, transparent)`,
          }}
        />
        <div className="relative flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${badgeColor}, ${
                  form.badge_secondary_color || badgeColor
                })`,
                boxShadow: `0 8px 20px -8px ${hexToRgba(badgeColor, 0.6)}`,
              }}
            >
              <Crown size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {initial ? 'Edit tier' : 'Create new tier'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {initial
                  ? 'Update pricing, badge, visibility, and AI limits'
                  : 'Define a new subscription tier'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative max-h-[70vh] space-y-5 overflow-y-auto p-6">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Identity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Tier name *
              </label>
              <input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                disabled={saving}
                placeholder="e.g. Premium"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Level *
              </label>
              <input
                type="number"
                min={1}
                value={form.level}
                onChange={(e) =>
                  update({ level: Number(e.target.value) || 1 })
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              disabled={saving}
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Price *
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={form.price}
                onChange={(e) =>
                  update({ price: Number(e.target.value) || 0 })
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => update({ currency: e.target.value })}
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Duration (days) *
              </label>
              <input
                type="number"
                min={1}
                value={form.duration_days}
                onChange={(e) =>
                  update({ duration_days: Number(e.target.value) || 1 })
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* ───────── AI Portfolio Analysis Limit ───────── */}
          <div className="space-y-3 rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/60 to-white p-4 dark:border-violet-900/40 dark:from-violet-950/20 dark:to-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/25">
                <Bot size={15} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  AI portfolio analyses
                </p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  How many deep analyses a professional can run per month
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="ai-limit"
                className="mb-1.5 block text-[11px] font-semibold text-gray-700 dark:text-slate-300"
              >
                Analyses per month *
              </label>
              <input
                id="ai-limit"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={aiLimit}
                onChange={(e) => {
                  setAiLimit(e.target.value);
                  if (aiError) setAiError(null);
                }}
                disabled={saving}
                placeholder="e.g. 6"
                aria-invalid={!!aiError}
                aria-describedby={aiError ? 'ai-limit-error' : undefined}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-100 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 ${
                  aiError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-700'
                    : 'border-gray-200 focus:border-violet-500 focus:ring-violet-500/10 dark:border-slate-800'
                }`}
              />
              {aiError ? (
                <p
                  id="ai-limit-error"
                  className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"
                >
                  {aiError}
                </p>
              ) : (
                <p className="mt-1 text-[10px] leading-relaxed text-gray-500 dark:text-slate-400">
                  Stored as feature{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-slate-800">
                    {AI_DEEP_ANALYSIS_KEY}
                  </code>{' '}
                  →{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-slate-800">
                    {`{ limit: ${aiLimit || '?'}, period: "${AI_PERIOD}" }`}
                  </code>
                </p>
              )}
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/60 p-4 dark:border-slate-800/60 dark:from-slate-900 dark:to-slate-950/60">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Badge
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Badge name
                </label>
                <input
                  value={form.badge_name ?? ''}
                  onChange={(e) => update({ badge_name: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Premium Pro"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Badge code
                </label>
                <input
                  value={form.badge_code ?? ''}
                  onChange={(e) => update({ badge_code: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. PREMIUM"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Primary color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => update({ badge_color: e.target.value })}
                    disabled={saving}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white dark:border-slate-800"
                  />
                  <input
                    value={badgeColor}
                    onChange={(e) => update({ badge_color: e.target.value })}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Secondary color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.badge_secondary_color || badgeColor}
                    onChange={(e) =>
                      update({ badge_secondary_color: e.target.value })
                    }
                    disabled={saving}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white dark:border-slate-800"
                  />
                  <input
                    value={form.badge_secondary_color ?? ''}
                    onChange={(e) =>
                      update({ badge_secondary_color: e.target.value })
                    }
                    disabled={saving}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Live preview
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${badgeColor}, ${
                      form.badge_secondary_color || badgeColor
                    })`,
                  }}
                >
                  <Crown size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {form.badge_name || form.name || 'Tier name'}
                  </p>
                  <p className="text-[11px] font-mono text-gray-500 dark:text-slate-400">
                    {form.badge_code || 'CODE'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => update({ is_active: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Active
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <input
                type="checkbox"
                checked={form.is_public ?? true}
                onChange={(e) => update({ is_public: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Public
              </span>
            </label>
            <div>
              <input
                type="number"
                value={form.display_order ?? 0}
                onChange={(e) =>
                  update({ display_order: Number(e.target.value) || 0 })
                }
                disabled={saving}
                placeholder="Display order"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-slate-800/60 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Create tier'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};

/* ───────────────────────── Feature Modal ───────────────────────── */

interface FeatureModalProps {
  open: boolean;
  initial?: TierFeature | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: TierFeatureCreatePayload) => Promise<void>;
}

const EMPTY_FEATURE: TierFeatureCreatePayload = {
  feature_key: '',
  feature_name: '',
  feature_description: '',
  feature_type: 'boolean',
  feature_value: null,
  is_enabled: true,
};

const FeatureModal: React.FC<FeatureModalProps> = ({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<TierFeatureCreatePayload>(EMPTY_FEATURE);
  const [valueText, setValueText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        feature_key: initial.featureKey,
        feature_name: initial.featureName,
        feature_description: initial.featureDescription ?? '',
        feature_type: initial.featureType,
        feature_value: initial.featureValue ?? null,
        is_enabled: initial.isEnabled,
      });
      setValueText(
        initial.featureValue ? JSON.stringify(initial.featureValue) : '',
      );
    } else {
      setForm(EMPTY_FEATURE);
      setValueText('');
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const update = (patch: Partial<TierFeatureCreatePayload>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.feature_key.trim() || form.feature_key.trim().length < 2) {
      setError('Feature key must be at least 2 characters.');
      return;
    }
    if (!form.feature_name.trim() || form.feature_name.trim().length < 2) {
      setError('Feature name must be at least 2 characters.');
      return;
    }
    let parsedValue: Record<string, unknown> | null = null;
    if (form.feature_type === 'json' && valueText.trim()) {
      try {
        const parsed = JSON.parse(valueText);
        if (typeof parsed !== 'object' || parsed === null) {
          setError('Feature value must be a JSON object.');
          return;
        }
        parsedValue = parsed;
      } catch {
        setError('Feature value must be valid JSON.');
        return;
      }
    } else if (form.feature_type !== 'json' && valueText.trim()) {
      parsedValue = { value: valueText.trim() };
    }
    try {
      await onSubmit({
        ...form,
        feature_key: form.feature_key.trim(),
        feature_name: form.feature_name.trim(),
        feature_description: form.feature_description?.trim() || undefined,
        feature_value: parsedValue,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save feature');
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md sm:items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-3xl dark:border-white/10 dark:bg-slate-900/95"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {initial ? 'Edit feature' : 'Add feature'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Defines a capability unlocked by this tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Feature key *
              </label>
              <input
                value={form.feature_key}
                onChange={(e) => update({ feature_key: e.target.value })}
                disabled={saving || !!initial}
                placeholder="e.g. max_portfolio_items"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 font-mono text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Feature name *
              </label>
              <input
                value={form.feature_name}
                onChange={(e) => update({ feature_name: e.target.value })}
                disabled={saving}
                placeholder="e.g. Portfolio items"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={form.feature_description ?? ''}
              onChange={(e) =>
                update({ feature_description: e.target.value })
              }
              disabled={saving}
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Type
              </label>
              <select
                value={form.feature_type}
                onChange={(e) =>
                  update({
                    feature_type: e.target.value as TierFeatureType,
                  })
                }
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              >
                {FEATURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-end gap-2 pb-1">
              <input
                type="checkbox"
                checked={form.is_enabled ?? true}
                onChange={(e) => update({ is_enabled: e.target.checked })}
                disabled={saving}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Enabled
              </span>
            </label>
          </div>

          {form.feature_type === 'json' ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Value (JSON object)
              </label>
              <textarea
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                disabled={saving}
                rows={4}
                placeholder='{"limit": 10}'
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300">
                Value
              </label>
              <input
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                disabled={saving}
                placeholder={
                  form.feature_type === 'numeric'
                    ? 'e.g. 25'
                    : form.feature_type === 'boolean'
                      ? 'e.g. true'
                      : 'e.g. some text'
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-slate-800/60 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Saving…' : initial ? 'Save feature' : 'Add feature'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};

/* ───────────────────────── Tier Card ───────────────────────── */

interface TierCardProps {
  tier: ProfessionalTierDetail;
  onEdit: () => void;
  onDelete: () => void;
  onAddFeature: () => void;
  onEditFeature: (f: TierFeature) => void;
  onDeleteFeature: (f: TierFeature) => void;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  onEdit,
  onDelete,
  onAddFeature,
  onEditFeature,
  onDeleteFeature,
}) => {
  const color = tier.badgeColor || '#3b82f6';
  const secondary = tier.badgeSecondaryColor || color;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {/* Accent top bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${secondary})`,
        }}
      />

      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70"
        style={{ background: hexToRgba(color, 0.4) }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
              style={{
                background: `linear-gradient(135deg, ${color}, ${secondary})`,
                boxShadow: `0 8px 20px -8px ${hexToRgba(color, 0.7)}`,
              }}
            >
              <Crown size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-gray-900 dark:text-slate-100">
                {tier.name}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Level {tier.level}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
              title="Edit tier"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
              title="Delete tier"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {tier.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Inactive
            </span>
          )}
          {tier.isPublic ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400">
              <Eye size={10} />
              Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <EyeOff size={10} />
              Private
            </span>
          )}
          {tier.badgeCode && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{
                background: `linear-gradient(90deg, ${color}, ${secondary})`,
              }}
            >
              {tier.badgeCode}
            </span>
          )}
        </div>

        {tier.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
            {tier.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-100 pt-3 dark:border-slate-800/60">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Price
            </p>
            <p
              className="text-xl font-extrabold tabular-nums"
              style={{ color }}
            >
              {formatPrice(tier.price, tier.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Duration
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              {tier.durationDays} days
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-slate-800/60">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              Features ({tier.features.length})
            </p>
            <button
              onClick={onAddFeature}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              <Plus size={11} />
              Add
            </button>
          </div>

          {tier.features.length === 0 ? (
            <p className="py-2 text-center text-[11px] italic text-gray-400 dark:text-slate-500">
              No features yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tier.features.map((f) => (
                <span
                  key={f.id}
                  className={`group/feat inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    f.isEnabled
                      ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'border-gray-200 bg-gray-50 text-gray-500 line-through dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500'
                  }`}
                >
                  {FEATURE_ICON[f.featureType]}
                  <span className="max-w-[140px] truncate">
                    {f.featureName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFeature(f);
                    }}
                    className="ml-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
                    title="Edit feature"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFeature(f);
                    }}
                    className="text-current opacity-60 transition-opacity hover:opacity-100 hover:text-rose-500"
                    title="Delete feature"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── Main Tab ───────────────────────── */

const TiersTab: React.FC = () => {
  const {
    tiers,
    loading,
    error,
    createTier,
    updateTier,
    deleteTier,
    createFeature,
    updateFeature,
    deleteFeature,
  } = useTiers();

  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] =
    useState<ProfessionalTierDetail | null>(null);
  const [savingTier, setSavingTier] = useState(false);

  const [featureTierId, setFeatureTierId] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<TierFeature | null>(
    null,
  );
  const [savingFeature, setSavingFeature] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<
    | { kind: 'tier'; tier: ProfessionalTierDetail }
    | { kind: 'feature'; tierId: string; feature: TierFeature }
    | null
  >(null);

  const stats = useMemo(() => {
    const active = tiers.filter((t) => t.isActive).length;
    const publicCount = tiers.filter((t) => t.isPublic).length;
    const features = tiers.reduce((sum, t) => sum + t.features.length, 0);
    return { total: tiers.length, active, public: publicCount, features };
  }, [tiers]);

  /**
   * Ensure the tier has an "ai_portfolio_deep_analysis" feature row
   * with feature_value = { limit: N, period: "monthly" }.
   *
   * Creates it if missing, updates it if present.
   */
  const reconcileAiFeature = async (
    tier: ProfessionalTierDetail,
    aiLimit: number,
  ) => {
    const existing = tier.features.find(
      (f) => f.featureKey === AI_DEEP_ANALYSIS_KEY,
    );

    const payload: TierFeatureCreatePayload = {
      feature_key: AI_DEEP_ANALYSIS_KEY,
      feature_name: existing?.featureName ?? 'AI portfolio analyses',
      feature_description:
        existing?.featureDescription ??
        'Monthly quota for AI portfolio deep analysis',
      feature_type: 'json',
      feature_value: {
        [AI_VALUE_KEY]: aiLimit,
        period: AI_PERIOD,
      },
      is_enabled: true,
    };

    if (existing) {
      await updateFeature(tier.id, existing.id, payload);
    } else {
      await createFeature(tier.id, payload);
    }
  };

  const handleTierSubmit = async ({
    tier: payload,
    aiLimit,
  }: TierModalSubmit) => {
    setSavingTier(true);
    try {
      let saved: ProfessionalTierDetail;

      if (editingTier) {
        saved = await updateTier(editingTier.id, payload);
        await reconcileAiFeature(saved, aiLimit);
        toast.success('Tier updated');
      } else {
        saved = await createTier(payload);
        await reconcileAiFeature(saved, aiLimit);
        toast.success('Tier created');
      }

      setTierModalOpen(false);
      setEditingTier(null);
    } finally {
      setSavingTier(false);
    }
  };

  const handleFeatureSubmit = async (payload: TierFeatureCreatePayload) => {
    if (!featureTierId) return;
    setSavingFeature(true);
    try {
      if (editingFeature) {
        await updateFeature(featureTierId, editingFeature.id, payload);
        toast.success('Feature updated');
      } else {
        await createFeature(featureTierId, payload);
        toast.success('Feature added');
      }
      setFeatureTierId(null);
      setEditingFeature(null);
    } finally {
      setSavingFeature(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === 'tier') {
        await deleteTier(confirmDelete.tier.id);
        toast.success('Tier deleted');
      } else {
        await deleteFeature(
          confirmDelete.tierId,
          confirmDelete.feature.id,
        );
        toast.success('Feature deleted');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 py-16 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
        <Package size={28} className="mb-3 text-rose-500" />
        <p className="font-semibold text-rose-900 dark:text-rose-300">
          Failed to load tiers
        </p>
        <p className="mt-1 max-w-sm text-sm text-rose-700/80 dark:text-rose-400">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
            <Crown size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 sm:text-2xl">
              Subscription tiers
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 sm:text-base">
              Define pricing tiers and unlockable features for professionals
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTier(null);
            setTierModalOpen(true);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50"
        >
          <Plus size={16} />
          Create tier
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/30 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Total tiers
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            {stats.total}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/30 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Active
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            {stats.active}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-400/30 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Public
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            {stats.public}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/30 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-500" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Features
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            {stats.features}
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-slate-700/60" />
                </div>
              </div>
              <div className="mb-4 h-3 w-full rounded bg-gray-100 dark:bg-slate-700/60" />
              <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-slate-700/60" />
            </div>
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-500/25 bg-blue-500/[0.03] px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30">
              <Crown size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              No tiers yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs text-gray-500 dark:text-slate-400">
              Create your first subscription tier to start selling premium
              features to professionals.
            </p>
            <button
              onClick={() => {
                setEditingTier(null);
                setTierModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
            >
              <Plus size={15} />
              Create first tier
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={() => {
                setEditingTier(tier);
                setTierModalOpen(true);
              }}
              onDelete={() => setConfirmDelete({ kind: 'tier', tier })}
              onAddFeature={() => {
                setFeatureTierId(tier.id);
                setEditingFeature(null);
              }}
              onEditFeature={(f) => {
                setFeatureTierId(tier.id);
                setEditingFeature(f);
              }}
              onDeleteFeature={(f) =>
                setConfirmDelete({
                  kind: 'feature',
                  tierId: tier.id,
                  feature: f,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Tier modal */}
      <TierModal
        open={tierModalOpen}
        initial={editingTier}
        saving={savingTier}
        onClose={() => {
          setTierModalOpen(false);
          setEditingTier(null);
        }}
        onSubmit={handleTierSubmit}
      />

      {/* Feature modal */}
      <FeatureModal
        open={featureTierId !== null}
        initial={editingFeature}
        saving={savingFeature}
        onClose={() => {
          setFeatureTierId(null);
          setEditingFeature(null);
        }}
        onSubmit={handleFeatureSubmit}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-1/2 top-1/2 z-[100000] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {confirmDelete.kind === 'tier'
                  ? 'Delete this tier?'
                  : 'Delete this feature?'}
              </h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                {confirmDelete.kind === 'tier'
                  ? `"${confirmDelete.tier.name}" and its features will be permanently removed.`
                  : `"${confirmDelete.feature.featureName}" will be removed from this tier.`}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/25 transition-colors hover:bg-rose-500"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TiersTab;