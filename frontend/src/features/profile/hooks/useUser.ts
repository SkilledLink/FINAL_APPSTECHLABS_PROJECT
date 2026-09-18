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

/* ── Case-insensitive + truncation-safe enum normalisation ── */
const normaliseAccountType = (raw: unknown): UserProfile['accountType'] => {
  const value = String(raw ?? '').toLowerCase().trim();

  // Matches: "professional", "pro", "profession" (truncated), "PROFESSIONAL"
  if (value === 'pro' || value.startsWith('profession')) {
    return 'professional';
  }
  if (value === 'business' || value === 'biz') {
    return 'business';
  }
  return 'standard';
};

const mapUserFromAPI = (data: any): UserProfile => {
  return {
    ...data,
    id: data.id,
    email: data.email,
    username: data.username ?? null,
    firstName: data.first_name ?? data.firstName ?? '',
    lastName: data.last_name ?? data.lastName ?? '',
    bio: data.bio ?? null,
    location: data.location ?? null,
    accountType: normaliseAccountType(data.account_type ?? data.accountType),
    status: data.status,
    isEmailVerified: data.is_email_verified ?? data.isEmailVerified ?? false,
    isAdmin: data.is_admin ?? data.isAdmin ?? false,
    isModerator: data.is_moderator ?? data.isModerator ?? false,
    createdAt: data.created_at ?? data.createdAt,
    updatedAt: data.updated_at ?? data.updatedAt,
    lastLoginAt: data.last_login_at ?? data.lastLoginAt ?? null,
    deletedAt: data.deleted_at ?? data.deletedAt ?? null,
    visibility: data.visibility ?? 'public',
    deactivatedAt: data.deactivated_at ?? data.deactivatedAt ?? null,
    suspendedAt: data.suspended_at ?? data.suspendedAt ?? null,
    profileImageUrl: data.profile_image_url ?? data.profileImageUrl ?? null,
    bannerImageUrl: data.banner_image_url ?? data.bannerImageUrl ?? null,
    followersCount: data.followers_count ?? data.followersCount ?? 0,
    followingCount: data.following_count ?? data.followingCount ?? 0,
    isFollowing: data.is_following ?? data.isFollowing ?? false,
    professional: data.professional
      ? {
          ...data.professional,
          id: data.professional.id,
          userId: data.professional.user_id ?? data.professional.userId,
          bio: data.professional.bio ?? null,
          rating: Number(data.professional.rating ?? 0),
          totalReviews:
            data.professional.total_reviews ?? data.professional.totalReviews ?? 0,
          completedJobs:
            data.professional.completed_jobs ?? data.professional.completedJobs ?? 0,
          hourlyRate:
            data.professional.hourly_rate ?? data.professional.hourlyRate ?? null,
          isVerified:
            data.professional.is_verified ?? data.professional.isVerified ?? false,
          services: data.professional.services ?? [],
          skills: data.professional.skills ?? [],
          yearsOfExperience:
            data.professional.years_of_experience ??
            data.professional.yearsOfExperience ??
            0,
        }
      : undefined,
  };
};

const mapUserToAPI = (data: Partial<UserProfile>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  if (data.username !== undefined) result.username = data.username;
  if (data.firstName !== undefined) result.first_name = data.firstName;
  if (data.lastName !== undefined) result.last_name = data.lastName;
  if (data.bio !== undefined) result.bio = data.bio;
  if (data.location !== undefined) result.location = data.location;
  if (data.profileImageUrl !== undefined)
    result.profile_image_url = data.profileImageUrl;
  if (data.bannerImageUrl !== undefined)
    result.banner_image_url = data.bannerImageUrl;
  return result;
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useUser = (options: UseUserOptions = {}): UseUserReturn => {
  const { autoFetch = false } = options;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        if (response.status === 404) return null;
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
        const data = await response.json();
        const mappedUser = mapUserFromAPI(data);
        setUser(mappedUser);
        return mappedUser;
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
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.status}`);
      }
      const data = await response.json();
      const mappedUser = mapUserFromAPI(data);
      setUser(mappedUser);
      return mappedUser;
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
        const apiData = mapUserToAPI(data);
        const response = await fetch(`${API_BASE}/users/me`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(apiData),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update user: ${response.status}${
              errorText ? ` - ${errorText}` : ''
            }`
          );
        }
        const updated = await response.json();
        const mappedUser = mapUserFromAPI(updated);
        setUser(mappedUser);
        return mappedUser;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update user';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
      const message =
        err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchMe();
  }, [autoFetch, fetchMe]);

  return { user, loading, error, fetchUser, updateUser, deleteUser };
};