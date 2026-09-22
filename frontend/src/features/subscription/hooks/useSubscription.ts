// src/features/subscription/hooks/useSubscription.ts
import { useCallback, useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type {
  ActiveSubscriptionResponse,
  Entitlements,
  TierListResponse,
} from '../types/subscription.types';

export function useSubscription(enabled = true) {
  const [active, setActive] = useState<ActiveSubscriptionResponse | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements>({});
  const [tiers, setTiers] = useState<TierListResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [a, e, t] = await Promise.all([
        subscriptionService.getActive().catch(() => null),
        subscriptionService.getEntitlements().catch(() => ({})),
        subscriptionService.listTiers().catch(() => null),
      ]);
      setActive(a);
      setEntitlements(e);
      setTiers(t);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return { active, entitlements, tiers, loading, error, refresh };
}