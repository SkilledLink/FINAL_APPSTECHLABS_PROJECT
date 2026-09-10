// src/features/user_profile/hooks/useFollow.ts

import { useState, useCallback } from 'react';
import { userService } from '../services/userService';

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
  getFollowers: (
    userId: string,
    skip?: number,
    limit?: number
  ) => Promise<any[] | null>;
  getFollowing: (
    userId: string,
    skip?: number,
    limit?: number
  ) => Promise<any[] | null>;
}

export const useFollow = (): UseFollowReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const follow = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: wire up to backend
      return await userService.followUser(userId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to follow user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollow = useCallback(
    async (userId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return await userService.unfollowUser(userId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to unfollow user';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkFollowStatus = useCallback(
    async (userId: string): Promise<FollowStatus | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return await userService.checkFollowStatus(userId);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to check follow status';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getFollowers = useCallback(
    async (
      _userId: string,
      _skip = 0,
      _limit = 20
    ): Promise<any[] | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return [];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get followers';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getFollowing = useCallback(
    async (
      _userId: string,
      _skip = 0,
      _limit = 20
    ): Promise<any[] | null> => {
      setLoading(true);
      setError(null);
      try {
        // TODO: wire up to backend
        return [];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to get following';
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
    follow,
    unfollow,
    checkFollowStatus,
    getFollowers,
    getFollowing,
  };
};