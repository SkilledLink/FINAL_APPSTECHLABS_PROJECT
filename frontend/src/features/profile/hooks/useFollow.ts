// src/features/profile/hooks/useFollow.ts

import { useState, useCallback } from 'react';
import type { ViewerRelation } from '../types/profile.types';

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
  /** NEW – richer viewer relationship flags. */
  checkViewerRelation: (userId: string) => Promise<ViewerRelation | null>;
  getFollowers: (userId: string, skip?: number, limit?: number) => Promise<void[] | null>;
  getFollowing: (userId: string, skip?: number, limit?: number) => Promise<void[] | null>;
}

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DEFAULT_RELATION: ViewerRelation = {
  isFollowing: false,
  followsYou: false,
  isMutual: false,
  hasRequestedFollow: false,
  isBlocked: false,
  isBlockedBy: false,
  isMuted: false,
  canFollow: true,
  canMessage: true,
  canRequestService: true,
  canViewWork: true,
};

interface RelationPayload {
  is_following?: boolean;
  isFollowing?: boolean;
  follows_you?: boolean;
  followsYou?: boolean;
  is_mutual?: boolean;
  isMutual?: boolean;
  has_requested_follow?: boolean;
  hasRequestedFollow?: boolean;
  is_blocked?: boolean;
  isBlocked?: boolean;
  is_blocked_by?: boolean;
  isBlockedBy?: boolean;
  is_muted?: boolean;
  isMuted?: boolean;
  can_follow?: boolean;
  canFollow?: boolean;
  can_message?: boolean;
  canMessage?: boolean;
  can_request_service?: boolean;
  canRequestService?: boolean;
  can_view_work?: boolean;
  canViewWork?: boolean;
}

const mapRelation = (data: RelationPayload): ViewerRelation => ({
  isFollowing: data.is_following ?? data.isFollowing ?? false,
  followsYou: data.follows_you ?? data.followsYou ?? false,
  isMutual: data.is_mutual ?? data.isMutual ?? false,
  hasRequestedFollow:
    data.has_requested_follow ?? data.hasRequestedFollow ?? false,
  isBlocked: data.is_blocked ?? data.isBlocked ?? false,
  isBlockedBy: data.is_blocked_by ?? data.isBlockedBy ?? false,
  isMuted: data.is_muted ?? data.isMuted ?? false,
  canFollow: data.can_follow ?? data.canFollow ?? true,
  canMessage: data.can_message ?? data.canMessage ?? true,
  canRequestService:
    data.can_request_service ?? data.canRequestService ?? true,
  canViewWork: data.can_view_work ?? data.canViewWork ?? true,
});

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
      const message =
        err instanceof Error ? err.message : 'Failed to follow user';
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
      const message =
        err instanceof Error ? err.message : 'Failed to unfollow user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkFollowStatus = useCallback(
    async (userId: string): Promise<FollowStatus | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/users/me/follow-status/${userId}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to check follow status: ${response.status}`
          );
        }
        return await response.json();
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

  // ── NEW ────────────────────────────────────────────────────────
  const checkViewerRelation = useCallback(
    async (userId: string): Promise<ViewerRelation | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/users/me/relation/${userId}`,
          { headers: getAuthHeaders() }
        );

        // Endpoint not yet implemented → fall back to follow-status
        if (response.status === 404) {
          const fallback = await fetch(
            `${API_BASE}/users/me/follow-status/${userId}`,
            { headers: getAuthHeaders() }
          );
          if (!fallback.ok) return { ...DEFAULT_RELATION };
          const data = await fallback.json();
          return {
            ...DEFAULT_RELATION,
            isFollowing: !!(
              data.is_following ?? data.isFollowing
            ),
          };
        }

        if (!response.ok) {
          throw new Error(
            `Failed to check viewer relation: ${response.status}`
          );
        }

        const data = await response.json();
        return mapRelation(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to check viewer relation';
        setError(message);
        return { ...DEFAULT_RELATION };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getFollowers = useCallback(
    async (userId: string, skip = 0, limit = 20): Promise<void[] | null> => {
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
    async (userId: string, skip = 0, limit = 20): Promise<void[] | null> => {
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
    checkViewerRelation,
    getFollowers,
    getFollowing,
  };
};