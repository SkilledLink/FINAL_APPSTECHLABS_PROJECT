// src/features/subscription/hooks/useSubscription.ts
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Runs the initial fetch exactly once per mount.
  const fetchedRef = useRef(false);

  // Tracks the currently running refresh so rapid callers share one
  // promise instead of racing on the `loading` flag.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    // If a fetch is already running, wait for it instead of starting
    // another one. Prevents the "spinner never stops" flicker when
    // multiple components call refresh() in the same tick.
    if (inFlightRef.current) return inFlightRef.current;

    setLoading(true);
    setError(null);

    const run = (async () => {
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
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    return run;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, [enabled, refresh]);

  return { active, entitlements, tiers, loading, error, refresh };
}