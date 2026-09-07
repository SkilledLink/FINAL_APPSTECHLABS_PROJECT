import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  updateMe: async (data: any) => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getUserById: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};