// src/features/profile/hooks/useProfileImage.ts

import { useState, useCallback } from 'react';
import type { UserProfile } from '../types/profile.types';

interface UseProfileImageReturn {
  loading: boolean;
  error: string | null;
  uploadProfileImage: (file: File) => Promise<UserProfile | null>;
  uploadBannerImage: (file: File) => Promise<UserProfile | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useProfileImage = (): UseProfileImageReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const uploadProfileImage = useCallback(async (file: File): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/users/me/profile-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload profile image: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload profile image';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBannerImage = useCallback(async (file: File): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/users/me/banner-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload banner image: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload banner image';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadProfileImage,
    uploadBannerImage,
  };
};