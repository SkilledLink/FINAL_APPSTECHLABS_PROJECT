// src/features/profile/hooks/useUser.ts

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/profile.types';

interface UseUserOptions {
  autoFetch?: boolean;
}

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<UserProfile | null>;
  updateUser: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  deleteUser: () => Promise<boolean>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useUser = (options: UseUserOptions = {}): UseUserReturn => {
  const { autoFetch = false } = options;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchUser = useCallback(async (userId: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async (): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch current user';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      const updated = await response.json();
      setUser(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      setUser(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch current user on mount if enabled
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