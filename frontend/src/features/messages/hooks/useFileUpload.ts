// src/hooks/useFileUpload.ts
import { useState } from 'react';
import { uploadsApi } from '../api/file_uploads';

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
      const { upload_url, path, public_url } = await uploadsApi.getFileUploadUrl({
        file_name: file.name,
        content_type: file.type,
        file_size: file.size,
      });

      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      await uploadPromise;

      setUploading(false);
      return {
        path,
        publicUrl: public_url || '',
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