import { useState, useCallback } from 'react';
import { followApi } from '../api/followApi';
import type { FollowersListResponse, FollowingListResponse, FollowStatusResponse } from '../types/follow';

export function useFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const follow = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const result = await followApi.follow(userId);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to follow user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unfollow = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      await followApi.unfollow(userId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to unfollow user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (userId: string, skip?: number, limit?: number): Promise<FollowersListResponse> => {
    try {
      setLoading(true);
      return await followApi.getFollowers(userId, skip, limit);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get followers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (userId: string, skip?: number, limit?: number): Promise<FollowingListResponse> => {
    try {
      setLoading(true);
      return await followApi.getFollowing(userId, skip, limit);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get following');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkFollowStatus = useCallback(async (targetUserId: string): Promise<FollowStatusResponse> => {
    try {
      setLoading(true);
      return await followApi.checkFollowStatus(targetUserId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to check follow status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    follow,
    unfollow,
    getFollowers,
    getFollowing,
    checkFollowStatus,
  };
}