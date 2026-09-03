// src/api/uploads.ts
import { apiClient } from './client';
import type{ UploadUrlRequest, UploadUrlResponse } from '../features/messages/types/message.types';

export const uploadsApi = {
  getVoiceUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const res = await apiClient.post('/uploads/voice', data);
    return res.data;
  },
  // Direct upload to Supabase Storage using the returned signed URL
  uploadFileToStorage: async (uploadUrl: string, file: File): Promise<void> => {
    // This is a raw PUT request, not via axios interceptors
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (!res.ok) {
      throw new Error('Upload failed');
    }
  },
};
