import { apiClient } from './client';
import type { UploadUrlRequest, UploadUrlResponse } from '../types/message.types';

export const uploadsApi = {
  getFileUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const res = await apiClient.post('/uploads/file', data);
    return res.data;
  },
  getVoiceUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const res = await apiClient.post('/uploads/voice', data);
    return res.data;
  },
  uploadFileToStorage: async (uploadUrl: string, file: File) => {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  },
};