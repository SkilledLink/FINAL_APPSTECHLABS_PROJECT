import { useState } from 'react';
import { apiClient } from '../../../api/client';

export function useVoiceUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVoice = async (file: File, duration: number): Promise<{ path: string; publicUrl: string }> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duration', String(duration));

      const res = await apiClient.post('/uploads/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploading(false);
      return {
        path: res.data.path,
        publicUrl: res.data.url,   // ✅ Cloudinary URL
      };
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      throw err;
    }
  };

  return { uploadVoice, uploading, error };
}