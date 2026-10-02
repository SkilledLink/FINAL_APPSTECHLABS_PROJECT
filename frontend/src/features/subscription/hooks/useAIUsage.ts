// src/features/subscription/hooks/useAIUsage.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { AIUsageItem, Entitlements } from '../types/subscription.types';

const DEEP_ANALYSIS_KEY = 'ai_portfolio_deep_analysis';

export interface DeepAnalysisUsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

export interface UseAIUsageOptions {
  /**
   * Entitlements from `useSubscription`. When the backend has no
   * usage row yet for a feature (i.e. the pro hasn't used it this
   * period), we synthesize "0 / limit" using the entitlement config
   * so the counter is visible from day one.
   */
  entitlements?: Entitlements | null;
}

export function useAIUsage(
  enabled = true,
  options: UseAIUsageOptions = {},
) {
  const { entitlements = null } = options;

  const [items, setItems] = useState<AIUsageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionService.getAIUsage();
      setItems(res.items);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load AI usage');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, [enabled, refresh]);

  /**
   * Usage for the deep-analysis feature.
   * - If backend has a row → use it (real count).
   * - If not but entitlements declare a limit → synthesize 0 / limit.
   * - Otherwise → null (nothing to show).
   */
  const deepAnalysisUsage = useMemo<DeepAnalysisUsageInfo | null>(() => {
    const row = items.find((i) => i.feature_key === DEEP_ANALYSIS_KEY);
    if (row) {
      return {
        used: row.usage_count,
        limit: row.usage_limit,
        remaining: row.remaining,
      };
    }

    const entitlementLimit = entitlements?.[DEEP_ANALYSIS_KEY]?.limit;
    if (
      typeof entitlementLimit === 'number' &&
      Number.isFinite(entitlementLimit) &&
      entitlementLimit > 0
    ) {
      return {
        used: 0,
        limit: entitlementLimit,
        remaining: entitlementLimit,
      };
    }

    return null;
  }, [items, entitlements]);

  return {
    items,
    loading,
    error,
    refresh,
    deepAnalysisUsage,
  };
}