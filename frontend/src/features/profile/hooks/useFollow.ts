// src/features/profile/hooks/useFollow.ts

import { useState, useCallback } from 'react';

interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

interface UseFollowReturn {
  loading: boolean;
  error: string | null;
  follow: (userId: string) => Promise<boolean>;
  unfollow: (userId: string) => Promise<boolean>;
  checkFollowStatus: (userId: string) => Promise<FollowStatus | null>;
  getFollowers: (userId: string, skip?: number, limit?: number) => Promise<any[] | null>;
  getFollowing: (userId: string, skip?: number, limit?: number) => Promise<any[] | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useFollow = (): UseFollowReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const follow = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me/follow`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ followed_user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to follow user: ${response.status}`);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to follow user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollow = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me/follow`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ followed_user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to unfollow user: ${response.status}`);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfollow user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkFollowStatus = useCallback(async (userId: string): Promise<FollowStatus | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/users/me/follow-status/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to check follow status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check follow status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (userId: string, skip = 0, limit = 20): Promise<any[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/users/${userId}/followers?skip=${skip}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to get followers: ${response.status}`);
      }

      const data = await response.json();
      return data.items || data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get followers';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (userId: string, skip = 0, limit = 20): Promise<any[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/users/${userId}/following?skip=${skip}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to get following: ${response.status}`);
      }

      const data = await response.json();
      return data.items || data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get following';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    follow,
    unfollow,
    checkFollowStatus,
    getFollowers,
    getFollowing,
  };
};