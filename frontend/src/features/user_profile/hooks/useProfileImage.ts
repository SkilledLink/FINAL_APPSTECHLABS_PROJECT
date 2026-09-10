// src/features/user_profile/hooks/useProfileImage.ts

import { useState, useCallback } from 'react';
import type { UserProfile } from '../types/user.types';
import { userService } from '../services/userService';

interface UseProfileImageReturn {
  loading: boolean;
  error: string | null;
  uploadProfileImage: (file: File) => Promise<UserProfile | null>;
  uploadBannerImage: (file: File) => Promise<UserProfile | null>;
}

export const useProfileImage = (): UseProfileImageReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadProfileImage = useCallback(
    async (file: File): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return await userService.uploadProfileImage(file);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to upload profile image';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadBannerImage = useCallback(
    async (file: File): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return await userService.uploadBannerImage(file);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to upload banner image';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    uploadProfileImage,
    uploadBannerImage,
  };
};