import { apiClient } from './client';
import type { Job, JobCreate, JobUpdate, JobCommentCreate } from '../types/job';

export const jobApi = {
  create: async (data: FormData): Promise<Job> => {
    const res = await apiClient.post('/jobs', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getById: async (jobId: string): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${jobId}`);
    return res.data;
  },

  list: async (params?: { skip?: number; limit?: number; user_id?: string; search?: string }): Promise<{ items: Job[]; total: number; page: number; size: number }> => {
    const res = await apiClient.get('/jobs', { params });
    return res.data;
  },

  update: async (jobId: string, data: JobUpdate): Promise<Job> => {
    const res = await apiClient.put(`/jobs/${jobId}`, data);
    return res.data;
  },

  delete: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}`);
  },

  uploadImages: async (jobId: string, files: File[]): Promise<{ id: string; image_url: string; order: number }[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await apiClient.post(`/jobs/${jobId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/jobs/images/${imageId}`);
  },

  toggleLike: async (jobId: string): Promise<{ job_id: string; liked: boolean }> => {
    const res = await apiClient.post(`/jobs/${jobId}/like`);
    return res.data;
  },

  createComment: async (jobId: string, data: JobCommentCreate): Promise<any> => {
    const res = await apiClient.post(`/jobs/${jobId}/comments`, data);
    return res.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/jobs/comments/${commentId}`);
  },
};