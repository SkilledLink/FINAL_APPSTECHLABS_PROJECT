// src/features/subscription/components/SubscriptionCard.tsx
import { Sparkles, Crown, ArrowUpRight, Loader2 } from 'lucide-react';
import type {
  ActiveSubscriptionResponse,
  Entitlements,
  TierInfo,
} from '../types/subscription.types';
import TierBadge from './TierBadge';

interface SubscriptionCardProps {
  active: ActiveSubscriptionResponse | null;
  entitlements: Entitlements;
  loading?: boolean;
  onUpgrade: () => void;
}

const FEATURE_LABELS: Record<string, string> = {
  ai_portfolio_suggestions: 'AI Portfolio Suggestions',
  ai_profile_optimization: 'AI Profile Optimization',
  ai_service_description: 'AI Service Description',
  ai_image_analysis: 'AI Image Analysis',
  ai_portfolio_deep_analysis: 'AI Deep Portfolio Analysis',
  ai_post_suggestions: 'AI Post Suggestions',
  ai_reply_suggestions: 'AI Reply Suggestions',
  ai_customer_reply_assistant: 'AI Customer Reply Assistant',
  ai_service_inquiry_assistant: 'AI Inquiry Assistant',
  ai_quote_assistant: 'AI Quote Assistant',
  ai_branding_assistant: 'AI Branding Assistant',
  ai_auto_reply: 'AI Auto Reply',
  ai_search_priority: 'AI Search Priority',
  profile_visibility: 'Enhanced Visibility',
  featured_placement: 'Featured Placement',
  analytics: 'Advanced Analytics',
};

function describeLimit(value: Record<string, any> | undefined): string {
  if (!value) return 'Included';
  if (value.limit != null) {
    const period = value.period === 'daily'
      ? '/ day'
      : value.period === 'weekly'
        ? '/ week'
        : '/ month';
    return `${value.limit} ${period}`;
  }
  if (value.enabled === true) return 'Enabled';
  return 'Included';
}

export default function SubscriptionCard({
  active,
  entitlements,
  loading = false,
  onUpgrade,
}: SubscriptionCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white/85 p-6 dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading subscription…
        </div>
      </div>
    );
  }

  const sub = active?.subscription;
  const tier: TierInfo | null = sub?.tier ?? null;
  const featureKeys = Object.keys(entitlements);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      {/* Accent rail */}
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: tier?.badge_color || '#3B82F6' }}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{
                backgroundColor: `${tier?.badge_color || '#3B82F6'}20`,
                borderColor: `${tier?.badge_color || '#3B82F6'}40`,
                color: tier?.badge_color || '#3B82F6',
              }}
            >
              <Crown className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {tier?.name ?? 'No active subscription'}
                </h3>
                {tier && <TierBadge tier={tier} size="sm" />}
              </div>

              {sub?.expires_at && active?.days_remaining != null && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {active.days_remaining} days remaining · Renews{' '}
                  {new Date(sub.expires_at).toLocaleDateString()}
                </p>
              )}
              {!sub && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Subscribe to unlock AI features and priority placement.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onUpgrade}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-500/25 transition-colors hover:bg-blue-500 active:scale-[0.98]"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {sub ? 'Upgrade' : 'Subscribe'}
          </button>
        </div>

        {/* Features */}
        {featureKeys.length > 0 ? (
          <div className="mt-5 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Your benefits</span>
            </div>

            <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {featureKeys.map((key) => (
                <li
                  key={key}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: tier?.badge_color || '#3B82F6',
                      }}
                    />
                    <span className="truncate">
                      {FEATURE_LABELS[key] ?? key.replace(/_/g, ' ')}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                    {describeLimit(entitlements[key])}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-5 border-t border-slate-200/60 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            No active benefits yet. Subscribe to unlock AI-powered features.
          </div>
        )}
      </div>
    </div>
  );
}