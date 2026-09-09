export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'file-image';
  if (mimeType === 'application/pdf') return 'file-pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel';
  if (mimeType.startsWith('video/')) return 'file-video';
  if (mimeType.startsWith('audio/')) return 'file-audio';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'file-archive';
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('python')) return 'file-code';
  return 'file-alt';
};