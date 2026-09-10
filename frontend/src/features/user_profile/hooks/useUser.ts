// src/features/user_profile/hooks/useUser.ts

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/user.types';
import { userService } from '../services/userService';

interface UseUserOptions {
  autoFetch?: boolean;
}

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<UserProfile | null>;
  updateUser: (
    data: Partial<UserProfile>
  ) => Promise<UserProfile | null>;
  deleteUser: () => Promise<boolean>;
}

export const useUser = (
  options: UseUserOptions = {}
): UseUserReturn => {
  const { autoFetch = false } = options;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const data = await userService.getUserById(userId);
        setUser(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch user';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMe = useCallback(async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: wire up to backend
      const data = await userService.getCurrentUser();
      setUser(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch current user';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        const targetId = user?.id;
        if (!targetId) return null;
        const updated = await userService.updateUser(targetId, data);
        setUser(updated);
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update user';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const deleteUser = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: wire up to backend
      setUser(null);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchMe();
    }
  }, [autoFetch, fetchMe]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser,
    deleteUser,
  };
};