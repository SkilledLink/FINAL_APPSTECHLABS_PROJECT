// src/features/user_profile/hooks/useUserProfile.ts

import { useEffect, useState } from 'react';
import type { UserProfile } from '../types/user.types';
import { userService } from '../services/userService';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (
    data: Partial<UserProfile>
  ) => Promise<UserProfile | undefined>;
}

export const useUserProfile = (
  userId: string
): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId) {
        if (isMounted) {
          setProfile(null);
          setError('User ID is required.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // TODO: wire up to backend
        const data = await userService.getUserById(userId);

        if (!isMounted) return;

        setProfile(data);
      } catch (err: unknown) {
        if (!isMounted) return;

        console.error('Failed to load user profile:', err);

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load user profile.';

        setProfile(null);
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<UserProfile | undefined> => {
    if (!profile) return undefined;

    try {
      setError(null);

      // TODO: wire up to backend
      const updated = await userService.updateUser(profile.id, data);

      if (!updated) return undefined;

      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      console.error('Failed to update user profile:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update user profile.';

      setError(message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};