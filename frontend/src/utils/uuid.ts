// src/utils/uuid.ts

/**
 * Generate a UUID v4 that works in both secure and non-secure contexts.
 *
 * `crypto.randomUUID()` is only available over HTTPS or localhost.
 * On HTTP LAN addresses (http://192.168.x.x), we fall back to a
 * Math.random-based RFC-4122 v4 generator. Not cryptographically
 * strong, but collision-resistant enough for client message IDs.
 */
export function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      /* fall through to polyfill */
    }
  }

  // RFC 4122 v4 shape
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}