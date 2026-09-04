// src/utils/idUtils.ts
export function normalizeId(id: string | null | undefined): string {
  if (!id) return '';
  return String(id).trim().replace(/^["']|["']$/g, ''); // remove surrounding quotes
}