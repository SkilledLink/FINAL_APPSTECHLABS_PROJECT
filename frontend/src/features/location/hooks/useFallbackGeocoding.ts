// src/features/location/hooks/useFallbackGeocoding.ts
import { useEffect, useState } from 'react';
import { locationService } from '../services/locationService';
import type { DiscoverProfessional } from '../types/location.types';

export interface FallbackLocation {
  latitude: number;
  longitude: number;
  display_name: string;
}

/* Module-level caches — persist across component remounts */
const geocodeCache = new Map<string, FallbackLocation | null>();
const pending = new Map<string, Promise<FallbackLocation | null>>();

/* Nominatim politely: max 1 request per second */
const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;

async function throttledGeocode(
  query: string
): Promise<FallbackLocation | null> {
  if (geocodeCache.has(query)) return geocodeCache.get(query)!;
  if (pending.has(query)) return pending.get(query)!;

  const task = (async () => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();

    try {
      const res = await locationService.search(query, 1);
      const hit = res.results?.[0];
      if (!hit || hit.latitude == null || hit.longitude == null) {
        geocodeCache.set(query, null);
        return null;
      }
      const loc: FallbackLocation = {
        latitude: hit.latitude,
        longitude: hit.longitude,
        display_name: hit.display_name,
      };
      geocodeCache.set(query, loc);
      return loc;
    } catch {
      geocodeCache.set(query, null);
      return null;
    } finally {
      pending.delete(query);
    }
  })();

  pending.set(query, task);
  return task;
}

/**
 * Given a list of professionals, returns a map of professional.id →
 * geocoded fallback location. Only professionals WITHOUT a real
 * `public_location` are geocoded.
 */
export function useFallbackGeocoding(
  professionals: DiscoverProfessional[]
): Record<string, FallbackLocation | null> {
  const [fallbacks, setFallbacks] = useState<
    Record<string, FallbackLocation | null>
  >({});

  useEffect(() => {
    let cancelled = false;

    const missing = professionals.filter(
      (p) =>
        p.public_location?.latitude == null ||
        p.public_location?.longitude == null
    );

    if (missing.length === 0) {
      setFallbacks({});
      return;
    }

    (async () => {
      const next: Record<string, FallbackLocation | null> = {};

      for (const p of missing) {
        const text = [p.city, p.region, p.country]
          .filter(Boolean)
          .join(', ')
          .trim();

        if (!text) {
          next[p.id] = null;
          continue;
        }

        const loc = await throttledGeocode(text);
        if (cancelled) return;
        next[p.id] = loc;
      }

      if (!cancelled) setFallbacks(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [professionals]);

  return fallbacks;
}