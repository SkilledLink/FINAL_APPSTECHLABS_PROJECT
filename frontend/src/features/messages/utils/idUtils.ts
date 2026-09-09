export const normalizeId = (id: any): string => {
  if (!id) return '';
  return String(id).trim();
};