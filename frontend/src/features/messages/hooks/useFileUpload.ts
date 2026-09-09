import { useState } from 'react';
import { apiClient } from '../../../api/client';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File): Promise<{
    path: string;
    publicUrl: string;
    name: string;
    size: number;
    type: string;
  }> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post('/uploads/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      setUploading(false);
      return {
        path: res.data.path,
        publicUrl: res.data.url,   // ✅ Cloudinary URL
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      throw err;
    }
  };

  return { uploadFile, uploading, progress, error };
}