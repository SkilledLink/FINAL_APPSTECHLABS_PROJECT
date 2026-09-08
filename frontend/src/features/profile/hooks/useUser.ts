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
  updateUser: (
    data: Partial<UserProfile>
  ) => Promise<UserProfile | null>;
  deleteUser: () => Promise<boolean>;
}

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

/*
 * Convert the FastAPI snake_case response into the
 * camelCase structure used throughout the React frontend.
 */
const mapUserFromAPI = (data: any): UserProfile => {
  return {
    ...data,

    id: data.id,

    email: data.email,

    username: data.username ?? null,

    firstName: data.first_name ?? '',

    lastName: data.last_name ?? '',

    bio: data.bio ?? null,

    location: data.location ?? null,

    accountType: data.account_type,

    status: data.status,

    isEmailVerified: data.is_email_verified ?? false,

    isAdmin: data.is_admin ?? false,

    isModerator: data.is_moderator ?? false,

    createdAt: data.created_at,

    updatedAt: data.updated_at,

    lastLoginAt: data.last_login_at ?? null,

    deletedAt: data.deleted_at ?? null,

    profileImageUrl: data.profile_image_url ?? null,

    bannerImageUrl: data.banner_image_url ?? null,

    followersCount: data.followers_count ?? 0,

    followingCount: data.following_count ?? 0,

    isFollowing: data.is_following ?? false,

    /*
     * Preserve the professional object if the backend
     * includes it.
     */
    professional: data.professional
      ? {
          ...data.professional,

          id: data.professional.id,

          userId:
            data.professional.user_id ??
            data.professional.userId,

          bio: data.professional.bio ?? null,

          rating: Number(
            data.professional.rating ?? 0
          ),

          totalReviews:
            data.professional.total_reviews ??
            data.professional.totalReviews ??
            0,

          completedJobs:
            data.professional.completed_jobs ??
            data.professional.completedJobs ??
            0,

          hourlyRate:
            data.professional.hourly_rate ??
            data.professional.hourlyRate ??
            null,

          isVerified:
            data.professional.is_verified ??
            data.professional.isVerified ??
            false,

          services:
            data.professional.services ?? [],
        }
      : undefined,
  };
};

/*
 * Convert frontend camelCase data into snake_case data
 * expected by FastAPI/Pydantic.
 */
const mapUserToAPI = (
  data: Partial<UserProfile>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  if (data.username !== undefined) {
    result.username = data.username;
  }

  if (data.firstName !== undefined) {
    result.first_name = data.firstName;
  }

  if (data.lastName !== undefined) {
    result.last_name = data.lastName;
  }

  if (data.bio !== undefined) {
    result.bio = data.bio;
  }

  if (data.location !== undefined) {
    result.location = data.location;
  }

  if (data.profileImageUrl !== undefined) {
    result.profile_image_url =
      data.profileImageUrl;
  }

  if (data.bannerImageUrl !== undefined) {
    result.banner_image_url =
      data.bannerImageUrl;
  }

  return result;
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');

  return {
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

export const useUser = (
  options: UseUserOptions = {}
): UseUserReturn => {
  const { autoFetch = false } = options;

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Fetch a user by ID.
   */
  const fetchUser = useCallback(
    async (
      userId: string
    ): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/users/${userId}`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user: ${response.status}`
          );
        }

        const data = await response.json();

        /*
         * Convert backend response before storing it.
         */
        const mappedUser =
          mapUserFromAPI(data);

        setUser(mappedUser);

        return mappedUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch user';

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Fetch the currently authenticated user.
   */
  const fetchMe = useCallback(
    async (): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/users/me`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch current user: ${response.status}`
          );
        }

        const data = await response.json();

        /*
         * Convert backend snake_case response.
         */
        const mappedUser =
          mapUserFromAPI(data);

        setUser(mappedUser);

        return mappedUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch current user';

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Update the currently authenticated user.
   */
  const updateUser = useCallback(
    async (
      data: Partial<UserProfile>
    ): Promise<UserProfile | null> => {
      setLoading(true);
      setError(null);

      try {
        /*
         * Convert frontend camelCase to backend snake_case.
         */
        const apiData = mapUserToAPI(data);

        const response = await fetch(
          `${API_BASE}/users/me`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(apiData),
          }
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          throw new Error(
            `Failed to update user: ${response.status}${
              errorText
                ? ` - ${errorText}`
                : ''
            }`
          );
        }

        const updated =
          await response.json();

        /*
         * Convert updated backend response
         * back to frontend format.
         */
        const mappedUser =
          mapUserFromAPI(updated);

        setUser(mappedUser);

        return mappedUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update user';

        setError(message);

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Delete the currently authenticated user.
   */
  const deleteUser = useCallback(
    async (): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/users/me`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to delete user: ${response.status}`
          );
        }

        setUser(null);

        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to delete user';

        setError(message);

        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Automatically fetch the current user when enabled.
   */
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
