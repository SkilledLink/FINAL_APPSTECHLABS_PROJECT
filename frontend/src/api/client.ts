// src/api/client.ts
import axios from 'axios';

/* ───────────────────────── Config ───────────────────────── */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ───────────────────────── Public endpoints ─────────────────────────
 * Any request whose URL contains one of these substrings will NEVER
 * trigger a logout, even if the backend responds with 401.
 *
 * Rationale: public data endpoints (location search, auth flows, public
 * discovery) may legitimately return 401 in edge cases (token expired,
 * backend auth not yet wired). We don't want that to nuke the session
 * of a user who is just browsing.
 * ─────────────────────────────────────────────────────────────────── */
const PUBLIC_PATHS = [
  // Location services
  '/locations/search',
  '/locations/reverse',

  // Auth flows
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/verify-email',

  // Public discovery
  '/professionals/',
  '/public/',
];

function isPublicPath(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_PATHS.some((p) => url.includes(p));
}

/* ───────────────────────── Client ───────────────────────── */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20_000,
});

/* ───────────────────────── Request interceptor ─────────────────────────
 * Attaches the bearer token if present.
 * ─────────────────────────────────────────────────────────────────── */
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = config.headers ?? {};
        // @ts-expect-error axios header typing
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* localStorage disabled — just skip auth */
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ───────────────────────── Response interceptor ─────────────────────────
 * 401 handling:
 *   - Public endpoints → pass through, no logout
 *   - Authenticated endpoints → clear session + redirect to /login
 *   - Already on /login → don't redirect again (prevents loop)
 * ─────────────────────────────────────────────────────────────────── */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string | undefined = error?.config?.url;

    if (status === 401 && !isPublicPath(url)) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } catch {
        /* ignore storage errors */
      }

      /* Avoid an infinite redirect loop if we're already on the login page */
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/* ───────────────────────── User API ───────────────────────── */

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


/* ───────────────────────── Report API ───────────────────────── */

export type ReportTargetType = 'user' | 'professional' | 'job' | 'feed';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fraud'
  | 'inappropriate_content'
  | 'fake_account'
  | 'scam'
  | 'impersonation'
  | 'other';

export interface ReportCreatePayload {
  target_id: string;
  target_type: ReportTargetType;
  reason: ReportReason;
  description?: string | null;
}

export interface ReportResponse {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: ReportTargetType;
  reason: ReportReason;
  description: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  action_taken: string;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const reportApi = {
  create: async (payload: ReportCreatePayload): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>('/reports', payload);
    return response.data;
  },

  listMine: async (skip = 0, limit = 20) => {
    const response = await apiClient.get('/reports/me', {
      params: { skip, limit },
    });
    return response.data;
  },

  withdraw: async (reportId: string): Promise<void> => {
    await apiClient.delete(`/reports/${reportId}`);
  },
};