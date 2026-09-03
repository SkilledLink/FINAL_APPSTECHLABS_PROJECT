import { useState } from 'react';
import { uploadsApi } from '../../../api/uploads';

export function useVoiceUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVoice = async (file: File, duration: number): Promise<{ path: string; publicUrl: string }> => {
    setUploading(true);
    setError(null);
    try {
      const { upload_url, path, public_url } = await uploadsApi.getVoiceUploadUrl({
        file_name: file.name || 'recording.webm',
        content_type: file.type || 'audio/webm',
        duration_seconds: duration,
      });

      await uploadsApi.uploadFileToStorage(upload_url, file);

      setUploading(false);
      return { path, publicUrl: public_url || '' };
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      throw err;
    }
  };

  return { uploadVoice, uploading, error };
}