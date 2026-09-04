// src/api/uploads.ts
import { apiClient } from '../../../api/client';
import type { UploadUrlRequest, UploadUrlResponse } from '../types/message.types';

export const uploadsApi = {
  getVoiceUploadUrl: (data: UploadUrlRequest): Promise<UploadUrlResponse> =>
    apiClient.post('/uploads/voice', data).then((res) => res.data),

  uploadFileToStorage: (uploadUrl: string, file: File): Promise<void> =>
    fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    }).then((res) => {
      if (!res.ok) throw new Error('Upload failed');
    }),
};