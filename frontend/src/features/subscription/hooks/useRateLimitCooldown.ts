// src/features/subscription/hooks/useRateLimitCooldown.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { SubscriptionApiError } from '../services/subscriptionService';

const STORAGE_PREFIX = 'aiCooldown:';

/**
 * Tracks a per-feature cooldown window (in seconds).
 *
 * - Persists the unlock timestamp in sessionStorage so a page refresh
 *   doesn't reset the timer.
 * - Reads `Retry-After` (or `retry_after`) from `SubscriptionApiError`
 *   when available, otherwise falls back to `defaultSeconds`.
 */
export function useRateLimitCooldown(key: string, defaultSeconds = 60) {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return;
      const remaining = Math.ceil((Number(raw) - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    } catch {
      /* ignore */
    }
  }, [key]);

  // Tick every second while cooling down
  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cooldown]);

  const start = useCallback(
    (seconds?: number) => {
      const s = Math.max(1, Math.ceil(seconds ?? defaultSeconds));
      try {
        sessionStorage.setItem(
          STORAGE_PREFIX + key,
          String(Date.now() + s * 1000),
        );
      } catch {
        /* ignore */
      }
      setCooldown(s);
    },
    [key, defaultSeconds],
  );

  /**
   * Convert an unknown error into a user-facing string, and start the
   * cooldown if it's a 429. Returns `null` if the error shape is
   * completely unrecognized (caller should supply its own fallback).
   */
  const handleError = useCallback(
    (err: unknown): string | null => {
      if (err instanceof SubscriptionApiError) {
        if (err.isRateLimited) {
          const wait = err.retryAfter ?? defaultSeconds;
          start(wait);
          return `Too many requests. Please wait ${wait}s before trying again.`;
        }
        return err.message;
      }
      if (err instanceof Error) return err.message;
      return null;
    },
    [defaultSeconds, start],
  );

  return {
    cooldown,
    isLocked: cooldown > 0,
    start,
    handleError,
  };
}