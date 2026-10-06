// src/features/admin/components/tiers/QuickAdminTools.tsx
import { useState } from 'react';
import {
  Zap,
  Loader2,
  Plus,
  Minus,
  Check,
  Info,
  Crown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type {
  ProfessionalTierDetail,
  TierCreatePayload,
  TierFeatureCreatePayload,
} from '../../types/admin.types';

/* Backend contract — matches app/services/ai/features/portfolio_deep_analysis.py */
const AI_DEEP_ANALYSIS_KEY = 'ai_portfolio_deep_analysis';
const AI_VALUE_KEY = 'limit';
const AI_PERIOD = 'monthly';

/* ────────────────────────────────────────────────────────────── */

interface StarterTier {
  name: string;
  level: number;
  price: number;
  currency: string;
  duration_days: number;
  aiLimit: number;
  description: string;
  badge_name: string;
  badge_code: string;
  badge_color: string;
  badge_secondary_color: string;
}

/**
 * 3 ready-made AI tiers that match the resolver in
 * app/services/ai/tier_provider.py:
 *   level < 2 → no AI
 *   level 2   → text AI (Groq)
 *   level ≥3  → text + vision (Gemini) + deep analysis
 */
const STARTER_TIERS: StarterTier[] = [
  {
    name: 'Basic AI',
    level: 2,
    price: 5000,
    currency: 'XAF',
    duration_days: 30,
    aiLimit: 5,
    description: 'Text AI features — profile suggestions & proposals',
    badge_name: 'Basic AI',
    badge_code: 'BASIC',
    badge_color: '#22c55e',
    badge_secondary_color: '#15803d',
  },
  {
    name: 'Pro AI',
    level: 3,
    price: 15000,
    currency: 'XAF',
    duration_days: 30,
    aiLimit: 20,
    description: 'Text + vision AI — includes image analysis & deep portfolio review',
    badge_name: 'Pro AI',
    badge_code: 'PRO',
    badge_color: '#3b82f6',
    badge_secondary_color: '#1e40af',
  },
  {
    name: 'Enterprise AI',
    level: 4,
    price: 50000,
    currency: 'XAF',
    duration_days: 30,
    aiLimit: 100,
    description: 'Full AI power for high-volume professionals',
    badge_name: 'Enterprise',
    badge_code: 'ENT',
    badge_color: '#8b5cf6',
    badge_secondary_color: '#6d28d9',
  },
];

/* ────────────────────────────────────────────────────────────── */

interface QuickAdminToolsProps {
  tiers: ProfessionalTierDetail[];
  loading: boolean;
  createTier: (payload: TierCreatePayload) => Promise<ProfessionalTierDetail>;
  updateTier: (id: string, payload: TierCreatePayload) => Promise<ProfessionalTierDetail>;
  createFeature: (tierId: string, payload: TierFeatureCreatePayload) => Promise<unknown>;
  updateFeature: (tierId: string, featureId: string, payload: TierFeatureCreatePayload) => Promise<unknown>;
  onDone: () => void;
}

export default function QuickAdminTools({
  tiers,
  loading,
  createTier,
  updateTier,
  createFeature,
  updateFeature,
  onDone,
}: QuickAdminToolsProps) {
  const [seeding, setSeeding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const existingNames = new Set(tiers.map((t) => t.name));
  const existingLevels = new Set(tiers.map((t) => t.level));

  const starterAvailable = STARTER_TIERS.filter(
    (s) => !existingNames.has(s.name) && !existingLevels.has(s.level)
  );

  /* ── Seed starter tiers ──────────────────────────────────── */

  const handleSeedStarterPack = async () => {
    if (starterAvailable.length === 0) {
      toast.info('Starter tiers already exist.');
      return;
    }

    setSeeding(true);
    let created = 0;
    try {
      for (const s of starterAvailable) {
        const tierPayload: TierCreatePayload = {
          name: s.name,
          level: s.level,
          description: s.description,
          price: s.price,
          currency: s.currency,
          duration_days: s.duration_days,
          is_active: true,
          is_public: true,
          display_order: s.level,
          badge_name: s.badge_name,
          badge_code: s.badge_code,
          badge_color: s.badge_color,
          badge_secondary_color: s.badge_secondary_color,
        };

        const tier = await createTier(tierPayload);

        const featurePayload: TierFeatureCreatePayload = {
          feature_key: AI_DEEP_ANALYSIS_KEY,
          feature_name: 'AI portfolio analyses',
          feature_description: 'Monthly quota for AI portfolio deep analysis',
          feature_type: 'json',
          feature_value: {
            [AI_VALUE_KEY]: s.aiLimit,
            period: AI_PERIOD,
          },
          is_enabled: true,
        };

        await createFeature(tier.id, featurePayload);
        created += 1;
      }

      toast.success(
        created === 1
          ? 'Created 1 tier'
          : `Created ${created} starter tiers`
      );
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create starter tiers'
      );
    } finally {
      setSeeding(false);
    }
  };

  /* ── Read current AI limit from a tier ──────────────────── */

  const readAiLimit = (tier: ProfessionalTierDetail): number => {
    const feature = tier.features.find(
      (f) => f.featureKey === AI_DEEP_ANALYSIS_KEY
    );
    const raw = feature?.featureValue?.[AI_VALUE_KEY];
    return typeof raw === 'number' && Number.isFinite(raw) && raw > 0
      ? Math.floor(raw)
      : 0;
  };

  /* ── Draft value for the inline editor ──────────────────── */

  const getDraft = (tier: ProfessionalTierDetail): number => {
    if (tier.id in drafts) return drafts[tier.id];
    return readAiLimit(tier);
  };

  const setDraft = (tierId: string, value: number) =>
    setDrafts((prev) => ({ ...prev, [tierId]: Math.max(0, Math.floor(value)) }));

  /* ── Save an inline AI-limit change ─────────────────────── */

  const handleSave = async (tier: ProfessionalTierDetail) => {
    const value = getDraft(tier);
    const existing = tier.features.find(
      (f) => f.featureKey === AI_DEEP_ANALYSIS_KEY
    );

    setSavingId(tier.id);
    try {
      const payload: TierFeatureCreatePayload = {
        feature_key: AI_DEEP_ANALYSIS_KEY,
        feature_name: existing?.featureName ?? 'AI portfolio analyses',
        feature_description:
          existing?.featureDescription ??
          'Monthly quota for AI portfolio deep analysis',
        feature_type: 'json',
        feature_value: {
          [AI_VALUE_KEY]: value,
          period: AI_PERIOD,
        },
        is_enabled: true,
      };

      if (existing) {
        await updateFeature(tier.id, existing.id, payload);
      } else {
        await createFeature(tier.id, payload);
      }

      // Remove the draft so the row reflects the server value
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[tier.id];
        return next;
      });

      toast.success(`${tier.name}: AI limit set to ${value}/mo`);
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update AI limit'
      );
    } finally {
      setSavingId(null);
    }
  };

  /* ── Publish toggle ──────────────────────────────────────── */

  const handlePublish = async (tier: ProfessionalTierDetail) => {
    setSavingId(tier.id);
    try {
      await updateTier(tier.id, {
        name: tier.name,
        level: tier.level,
        price: tier.price,
        currency: tier.currency,
        duration_days: tier.durationDays,
        is_active: true,
        is_public: !tier.isPublic,
      });
      toast.success(
        tier.isPublic
          ? `${tier.name}: hidden from public`
          : `${tier.name}: now public`
      );
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update tier');
    } finally {
      setSavingId(null);
    }
  };

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <div className="mb-6 space-y-4">
      {/* ── Starter pack banner ─────────────────────────── */}
      {starterAvailable.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.06] to-fuchsia-500/[0.04] p-5 dark:border-violet-400/20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/25">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                  Quick Setup — Create AI tiers in one click
                </h3>
                <p className="mt-0.5 max-w-lg text-xs text-gray-500 dark:text-slate-400">
                  Adds {starterAvailable.length} pre-configured tier
                  {starterAvailable.length === 1 ? '' : 's'} with AI
                  limits (5 / 20 / 100 per month) and sensible XAF pricing.
                  Edit anything after.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSeedStarterPack}
              disabled={seeding}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Zap size={15} />
              )}
              {seeding ? 'Creating…' : 'Create starter pack'}
            </button>
          </div>
        </div>
      )}

      {/* ── Inline AI limit editor ───────────────────────── */}
      {tiers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                AI limits — quick edit
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500">
              <Info size={11} />
              <span>Drafts save per-row</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {tiers.map((tier) => {
              const draft = getDraft(tier);
              const original = readAiLimit(tier);
              const dirty = draft !== original;
              const busy = savingId === tier.id;
              const color = tier.badgeColor || '#3b82f6';

              return (
                <div
                  key={tier.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  {/* Identity */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${
                          tier.badgeSecondaryColor || color
                        })`,
                      }}
                    >
                      <Crown size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {tier.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        Level {tier.level} · {Number(tier.price).toLocaleString()}{' '}
                        {tier.currency} / {tier.durationDays}d ·{' '}
                        {tier.isPublic ? 'Public' : 'Hidden'}
                      </p>
                    </div>
                  </div>

                  {/* Inline AI limit */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                      AI/mo
                    </span>
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                      <button
                        type="button"
                        onClick={() => setDraft(tier.id, draft - 5)}
                        disabled={busy || draft <= 0}
                        className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-900"
                        aria-label="Decrease by 5"
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={draft}
                        onChange={(e) =>
                          setDraft(tier.id, Number(e.target.value) || 0)
                        }
                        disabled={busy}
                        className="h-9 w-16 border-x border-gray-200 bg-transparent text-center text-sm font-semibold tabular-nums text-gray-900 outline-none focus:bg-white dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setDraft(tier.id, draft + 5)}
                        disabled={busy}
                        className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-900"
                        aria-label="Increase by 5"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave(tier)}
                      disabled={busy || !dirty}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all ${
                        dirty
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-500 active:scale-[0.98]'
                          : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
                      } disabled:opacity-60`}
                    >
                      {busy ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : dirty ? (
                        <Check size={13} />
                      ) : (
                        <Check size={13} />
                      )}
                      {busy ? 'Saving…' : dirty ? 'Save' : 'Saved'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePublish(tier)}
                      disabled={busy}
                      className="inline-flex h-9 items-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {tier.isPublic ? 'Hide' : 'Publish'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}