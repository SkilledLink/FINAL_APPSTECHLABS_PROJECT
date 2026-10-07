// src/features/subscription/tierCache.ts
/**
 * Client-side cache of subscription tier badges keyed by user_id.
 *
 * Populated by Header.tsx whenever the search endpoint returns
 * `tier_badge`. Read by ProfileHeader and any professional card that
 * needs to render the badge but doesn't have it in its own payload.
 *
 * Not authoritative — the backend is. 24h TTL keeps stale entries
 * from lingering after a subscription expires.
 */

const KEY = 'skilledlink:tier-cache:v1';
const TTL_MS = 24 * 60 * 60 * 1000;

export interface CachedTierBadge {
  tier_id: string;
  level: number;
  name: string;
  badge_name?: string | null;
  badge_code?: string | null;
  badge_icon?: string | null;
  badge_color?: string | null;
  badge_secondary_color?: string | null;
  badge_shape?: string | null;
}

interface CacheEntry {
  tier: CachedTierBadge;
  at: number;
}

type CacheMap = Record<string, CacheEntry>;

function read(): CacheMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CacheMap) : {};
  } catch {
    return {};
  }
}

function write(map: CacheMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function cacheTierBadge(
  userId: string | null | undefined,
  tier: CachedTierBadge | null | undefined,
) {
  if (!userId) return;
  const map = read();
  if (tier && tier.tier_id) {
    map[userId] = { tier, at: Date.now() };
  } else {
    // Explicit null = user has no active tier → clear stale entry.
    delete map[userId];
  }
  write(map);
}

export function readTierBadge(
  userId: string | null | undefined,
): CachedTierBadge | null {
  if (!userId) return null;
  const map = read();
  const entry = map[userId];
  if (!entry) return null;

  if (Date.now() - entry.at > TTL_MS) {
    delete map[userId];
    write(map);
    return null;
  }

  return entry.tier;
}