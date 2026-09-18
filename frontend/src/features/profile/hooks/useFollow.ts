// src/features/profile/hooks/useFollow.ts

import { useState, useCallback } from 'react';
import type { ViewerRelation, UserProfile } from '../types/profile.types';

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
  checkViewerRelation: (userId: string) => Promise<ViewerRelation | null>;
  getFollowers: (userId: string, skip?: number, limit?: number) => Promise<UserProfile[] | null>;
  getFollowing: (userId: string, skip?: number, limit?: number) => Promise<UserProfile[] | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

// ── NEW: Mapper to convert backend snake_case to frontend camelCase ──
const mapFollowerFromAPI = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email ?? '',
    username: data.username ?? null,
    firstName: data.first_name ?? data.firstName ?? '',
    lastName: data.last_name ?? data.lastName ?? '',
    bio: data.bio ?? null,
    location: data.location ?? null,
    accountType: data.account_type ?? data.accountType ?? 'standard',
    status: data.status ?? 'active',
    isEmailVerified: data.is_email_verified ?? data.isEmailVerified ?? false,
    isAdmin: data.is_admin ?? data.isAdmin ?? false,
    isModerator: data.is_moderator ?? data.isModerator ?? false,
    createdAt: data.created_at ?? data.createdAt ?? '',
    updatedAt: data.updated_at ?? data.updatedAt ?? '',
    // This is the key part for the avatars!
    profileImageUrl: data.profile_image_url ?? data.profileImageUrl ?? null,
    bannerImageUrl: data.banner_image_url ?? data.bannerImageUrl ?? null,
    followersCount: data.followers_count ?? data.followersCount ?? 0,
    followingCount: data.following_count ?? data.followingCount ?? 0,
    isFollowing: data.is_following ?? data.isFollowing ?? false,
    visibility: data.visibility ?? 'public',
  };
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
  hasRequestedFollow: data.has_requested_follow ?? data.hasRequestedFollow ?? false,
  isBlocked: data.is_blocked ?? data.isBlocked ?? false,
  isBlockedBy: data.is_blocked_by ?? data.isBlockedBy ?? false,
  isMuted: data.is_muted ?? data.isMuted ?? false,
  canFollow: data.can_follow ?? data.canFollow ?? true,
  canMessage: data.can_message ?? data.canMessage ?? true,
  canRequestService: data.can_request_service ?? data.canRequestService ?? true,
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
      if (!response.ok) throw new Error(`Failed to follow user: ${response.status}`);
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
      if (!response.ok) throw new Error(`Failed to unfollow user: ${response.status}`);
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
      const response = await fetch(`${API_BASE}/users/me/follow-status/${userId}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to check follow status: ${response.status}`);
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check follow status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkViewerRelation = useCallback(async (userId: string): Promise<ViewerRelation | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/users/me/relation/${userId}`, { headers: getAuthHeaders() });
      if (response.status === 404) {
        const fallback = await fetch(`${API_BASE}/users/me/follow-status/${userId}`, { headers: getAuthHeaders() });
        if (!fallback.ok) return { ...DEFAULT_RELATION };
        const data = await fallback.json();
        return { ...DEFAULT_RELATION, isFollowing: !!(data.is_following ?? data.isFollowing) };
      }
      if (!response.ok) throw new Error(`Failed to check viewer relation: ${response.status}`);
      const data = await response.json();
      return mapRelation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check viewer relation';
      setError(message);
      return { ...DEFAULT_RELATION };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (userId: string, skip = 0, limit = 20): Promise<UserProfile[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/followers?skip=${skip}&limit=${limit}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to get followers: ${response.status}`);
      const data = await response.json();
      const items = data.items || data;
      // Map the raw API response to our frontend UserProfile type
      return items.map(mapFollowerFromAPI);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get followers';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (userId: string, skip = 0, limit = 20): Promise<UserProfile[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/following?skip=${skip}&limit=${limit}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to get following: ${response.status}`);
      const data = await response.json();
      const items = data.items || data;
      return items.map(mapFollowerFromAPI);
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
    checkViewerRelation,
    getFollowers,
    getFollowing,
  };
};