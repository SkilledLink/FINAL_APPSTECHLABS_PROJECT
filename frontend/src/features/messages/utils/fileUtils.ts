// src/utils/fileUtils.ts
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string): string {
  if (!mimeType) return 'file-alt';
  if (mimeType.startsWith('image/')) return 'file-image';
  if (mimeType === 'application/pdf') return 'file-pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-excel';
  if (mimeType.startsWith('video/')) return 'file-video';
  if (mimeType.startsWith('audio/')) return 'file-audio';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'file-archive';
  if (mimeType === 'text/plain') return 'file-alt';
  if (mimeType === 'application/json') return 'file-code';
  return 'file-alt';
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function isImageFile(mimeType: string): boolean {
  return mimeType?.startsWith('image/') || false;
}