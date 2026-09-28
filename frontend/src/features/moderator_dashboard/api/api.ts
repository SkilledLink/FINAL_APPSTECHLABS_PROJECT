import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const raw =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      'Request failed';
    const message =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw.map(x => x.msg ?? JSON.stringify(x)).join(', ')
          : JSON.stringify(raw);
    return Promise.reject(new Error(message));
  },
);

export default api;
