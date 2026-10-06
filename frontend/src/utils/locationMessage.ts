// src/utils/locationMessage.ts

const LOCATION_PREFIX = '__LOC__';

export interface LocationPayload {
  lat: number;
  lng: number;
  label?: string;
  note?: string;
}

/** True if a message's content encodes a shared location. */
export function isLocationMessage(content?: string | null): boolean {
  if (!content) return false;
  return content.startsWith(LOCATION_PREFIX);
}

/** Serialize a location into a text-message-safe string. */
export function encodeLocationMessage(payload: LocationPayload): string {
  return (
    LOCATION_PREFIX +
    JSON.stringify({
      lat: payload.lat,
      lng: payload.lng,
      label: payload.label?.trim() || undefined,
      note: payload.note?.trim() || undefined,
    })
  );
}

/** Parse a message back into a location payload (or null). */
export function decodeLocationMessage(
  content?: string | null
): LocationPayload | null {
  if (!content || !content.startsWith(LOCATION_PREFIX)) return null;
  try {
    const raw = content.slice(LOCATION_PREFIX.length);
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.lat !== 'number' ||
      typeof parsed?.lng !== 'number' ||
      Number.isNaN(parsed.lat) ||
      Number.isNaN(parsed.lng)
    ) {
      return null;
    }
    return {
      lat: parsed.lat,
      lng: parsed.lng,
      label: typeof parsed.label === 'string' ? parsed.label : undefined,
      note: typeof parsed.note === 'string' ? parsed.note : undefined,
    };
  } catch {
    return null;
  }
}

/** Open-in-maps deep link (works on mobile + web). */
export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * OpenStreetMap embed URL — free, no API key, includes attribution.
 * A small bbox is built around the point so the pin lands in the middle.
 */
export function buildOsmEmbedUrl(
  lat: number,
  lng: number,
  zoom: number = 15
): string {
  // Smaller delta = tighter zoom. 0.004 is ~ 400m at the equator.
  const delta = 0.02 / Math.pow(1.6, zoom - 13);
  const bbox = [
    lng - delta,
    lat - delta * 0.72,
    lng + delta,
    lat + delta * 0.72,
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** Human-readable coordinate pair. */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}