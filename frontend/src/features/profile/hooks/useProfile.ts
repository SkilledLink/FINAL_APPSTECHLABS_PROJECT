// src/features/profile/hooks/useProfile.ts

import { useEffect, useState } from 'react';
import type { UserProfile } from '../types/profile.types';
import { profileService } from '../services/profileService';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (
    data: Partial<UserProfile>
  ) => Promise<UserProfile | undefined>;
}

export const useProfile = (profileId: string): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!profileId) {
        if (isMounted) {
          setProfile(null);
          setError('Profile ID is required.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await profileService.getProfileById(profileId);

        if (!isMounted) {
          return;
        }

        setProfile(data);
      } catch (err: unknown) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load profile:', err);

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load profile.';

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
  }, [profileId]);

  const updateProfile = async (
    data: Partial<UserProfile>
  ): Promise<UserProfile | undefined> => {
    if (!profile) {
      return undefined;
    }

    try {
      setError(null);

      const updated = await profileService.updateProfile(
        profile.id,
        data
      );

      setProfile(updated);

      return updated;
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update profile.';

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
