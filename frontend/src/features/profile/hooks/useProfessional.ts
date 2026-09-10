// src/features/profile/hooks/useProfessional.ts

import { useState, useEffect, useCallback } from 'react';
import type { Professional } from '../types/profile.types';

interface UseProfessionalOptions {
  autoFetch?: boolean;
}

interface UseProfessionalReturn {
  professional: Professional | null;
  loading: boolean;
  error: string | null;
  fetchProfessional: (professionalId: string) => Promise<Professional | null>;
  fetchMyProfessional: () => Promise<Professional | null>;
  /** NEW – fetch another user's professional record by user id. */
  fetchProfessionalByUserId: (userId: string) => Promise<Professional | null>;
  createProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
  updateProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
}

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normaliseProfessional = (data: any): Professional => ({
  ...data,
  id: data.id,
  userId: data.user_id ?? data.userId,
  profession: data.profession,
  bio: data.bio ?? null,
  skills: data.skills ?? [],
  yearsOfExperience:
    data.years_of_experience ?? data.yearsOfExperience ?? 0,
  services: data.services ?? [],
  hourlyRate: data.hourly_rate ?? data.hourlyRate ?? null,
  country: data.country ?? null,
  region: data.region ?? null,
  city: data.city ?? null,
  available: data.available ?? true,
  isVerified: data.is_verified ?? data.isVerified ?? false,
  rating: Number(data.rating ?? 0),
  totalReviews: data.total_reviews ?? data.totalReviews ?? 0,
  completedJobs: data.completed_jobs ?? data.completedJobs ?? 0,
  createdAt: data.created_at ?? data.createdAt,
  updatedAt: data.updated_at ?? data.updatedAt,
});

export const useProfessional = (
  options: UseProfessionalOptions = {}
): UseProfessionalReturn => {
  const { autoFetch = false } = options;
  const [professional, setProfessional] =
    useState<Professional | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchProfessional = useCallback(
    async (professionalId: string): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/professionals/${professionalId}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch professional: ${response.status}`
          );
        }
        const data = await response.json();
        const mapped = normaliseProfessional(data);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMyProfessional = useCallback(
    async (): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/professionals/me`,
          { headers: getAuthHeaders() }
        );
        if (response.status === 404) {
          setProfessional(null);
          return null;
        }
        if (!response.ok) {
          throw new Error(
            `Failed to fetch professional: ${response.status}`
          );
        }
        const data = await response.json();
        const mapped = normaliseProfessional(data);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── NEW ────────────────────────────────────────────────────────
  const fetchProfessionalByUserId = useCallback(
    async (userId: string): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/users/${userId}/professional`,
          { headers: getAuthHeaders() }
        );

        // 404 = user is not a professional → treat as null, not error
        if (response.status === 404) return null;

        if (!response.ok) {
          throw new Error(
            `Failed to fetch professional: ${response.status}`
          );
        }
        const data = await response.json();
        // NOTE: intentionally does NOT set `professional` state,
        // so we never overwrite "my" professional record.
        return normaliseProfessional(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createProfessional = useCallback(
    async (data: Partial<Professional>): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/professionals/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to create professional: ${response.status}`
          );
        }
        const created = await response.json();
        const mapped = normaliseProfessional(created);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProfessional = useCallback(
    async (data: Partial<Professional>): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}/professionals/me`,
          {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to update professional: ${response.status}`
          );
        }
        const updated = await response.json();
        const mapped = normaliseProfessional(updated);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) fetchMyProfessional();
  }, [autoFetch, fetchMyProfessional]);

  return {
    professional,
    loading,
    error,
    fetchProfessional,
    fetchMyProfessional,
    fetchProfessionalByUserId,
    createProfessional,
    updateProfessional,
  };
};