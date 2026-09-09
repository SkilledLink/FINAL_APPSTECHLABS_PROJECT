import { apiClient } from './client';
import type { User, UserUpdate } from '../types/user';

export const userApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  updateMe: async (data: UserUpdate): Promise<User> => {
    const res = await apiClient.put('/users/me', data);
    return res.data;
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me');
  },

  getUserById: async (userId: string): Promise<User> => {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadBanner: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/users/me/banner-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  listUsers: async (params?: { skip?: number; limit?: number; search?: string }): Promise<{ items: User[]; total: number; page: number; size: number }> => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },
};