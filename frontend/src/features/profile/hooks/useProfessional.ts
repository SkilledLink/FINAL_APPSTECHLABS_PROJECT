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
  fetchProfessionalByUserId: (userId: string) => Promise<Professional | null>;
  createProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
  updateProfessional: (data: Partial<Professional>) => Promise<Professional | null>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─────────────────────────────────────────────────────────── */
/*  Normalise API → frontend (snake_case → camelCase)         */
/* ─────────────────────────────────────────────────────────── */

const normaliseProfessional = (data: any): Professional => ({
  ...data,
  id: data.id,
  userId: data.user_id ?? data.userId,
  profession: data.profession,
  headline: data.headline ?? null,
  bio: data.bio ?? null,
  experienceLevel:
    data.experience_level ?? data.experienceLevel ?? 'INTERMEDIATE',
  yearsOfExperience:
    data.years_of_experience ?? data.yearsOfExperience ?? 0,
  companyName: data.company_name ?? data.companyName ?? null,
  jobTitle: data.job_title ?? data.jobTitle ?? null,
  employmentType: data.employment_type ?? data.employmentType ?? null,
  websiteUrl: data.website_url ?? data.websiteUrl ?? null,
  linkedinUrl: data.linkedin_url ?? data.linkedinUrl ?? null,
  portfolioUrl: data.portfolio_url ?? data.portfolioUrl ?? null,
  facebookUrl: data.facebook_url ?? data.facebookUrl ?? null,
  instagramUrl: data.instagram_url ?? data.instagramUrl ?? null,
  twitterUrl: data.twitter_url ?? data.twitterUrl ?? null,
  skills: data.skills ?? [],
  services: data.services ?? [],
  languages: data.languages ?? [],
  hourlyRate: data.hourly_rate ?? data.hourlyRate ?? null,
  currency: data.currency ?? 'XAF',
  country: data.country ?? null,
  region: data.region ?? null,
  city: data.city ?? null,
  available: data.available ?? true,
  availabilityNotes: data.availability_notes ?? data.availabilityNotes ?? null,
  responseTimeHours:
    data.response_time_hours ?? data.responseTimeHours ?? null,
  isVerified: data.is_verified ?? data.isVerified ?? false,
  verificationStatus: data.verification_status ?? data.verificationStatus,
  rating: Number(data.rating ?? 0),
  totalReviews: data.total_reviews ?? data.totalReviews ?? 0,
  completedJobs: data.completed_jobs ?? data.completedJobs ?? 0,
  createdAt: data.created_at ?? data.createdAt,
  updatedAt: data.updated_at ?? data.updatedAt,
});

/* ─────────────────────────────────────────────────────────── */
/*  Map frontend → API (camelCase → snake_case)               */
/*  ← THIS IS THE FIX. Without it the backend silently drops  */
/*    every camelCase field, including hourlyRate.            */
/* ─────────────────────────────────────────────────────────── */

const mapProfessionalToAPI = (
  data: Partial<Professional>
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};

  if (data.profession !== undefined) out.profession = data.profession;
  if (data.headline !== undefined) out.headline = data.headline;
  if (data.bio !== undefined) out.bio = data.bio;

  if (data.experienceLevel !== undefined)
    out.experience_level = data.experienceLevel;
  if (data.yearsOfExperience !== undefined)
    out.years_of_experience = data.yearsOfExperience;

  if (data.companyName !== undefined) out.company_name = data.companyName;
  if (data.jobTitle !== undefined) out.job_title = data.jobTitle;
  if (data.employmentType !== undefined)
    out.employment_type = data.employmentType;

  if (data.websiteUrl !== undefined) out.website_url = data.websiteUrl;
  if (data.linkedinUrl !== undefined) out.linkedin_url = data.linkedinUrl;
  if (data.portfolioUrl !== undefined) out.portfolio_url = data.portfolioUrl;
  if (data.facebookUrl !== undefined) out.facebook_url = data.facebookUrl;
  if (data.instagramUrl !== undefined) out.instagram_url = data.instagramUrl;
  if (data.twitterUrl !== undefined) out.twitter_url = data.twitterUrl;

  if (data.skills !== undefined) out.skills = data.skills;
  if (data.services !== undefined) out.services = data.services;
  if (data.languages !== undefined) out.languages = data.languages;

  if (data.hourlyRate !== undefined) out.hourly_rate = data.hourlyRate;
  if (data.currency !== undefined) out.currency = data.currency;

  if (data.country !== undefined) out.country = data.country;
  if (data.region !== undefined) out.region = data.region;
  if (data.city !== undefined) out.city = data.city;

  if (data.available !== undefined) out.available = data.available;
  if (data.availabilityNotes !== undefined)
    out.availability_notes = data.availabilityNotes;
  if (data.responseTimeHours !== undefined)
    out.response_time_hours = data.responseTimeHours;

  return out;
};

/* ─────────────────────────────────────────────────────────── */
/*  Hook                                                      */
/* ─────────────────────────────────────────────────────────── */

export const useProfessional = (
  options: UseProfessionalOptions = {}
): UseProfessionalReturn => {
  const { autoFetch = false } = options;
  const [professional, setProfessional] = useState<Professional | null>(null);
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
          throw new Error(`Failed to fetch professional: ${response.status}`);
        }
        const data = await response.json();
        const mapped = normaliseProfessional(data);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch professional';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMyProfessional = useCallback(async (): Promise<Professional | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/professionals/me`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 404) {
        setProfessional(null);
        return null;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch professional: ${response.status}`);
      }
      const data = await response.json();
      const mapped = normaliseProfessional(data);
      setProfessional(mapped);
      return mapped;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch professional';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfessionalByUserId = useCallback(
    async (userId: string): Promise<Professional | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/users/${userId}/professional`, {
          headers: getAuthHeaders(),
        });
        if (response.status === 404) return null;
        if (!response.ok) {
          throw new Error(`Failed to fetch professional: ${response.status}`);
        }
        const data = await response.json();
        return normaliseProfessional(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch professional';
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
        const apiData = mapProfessionalToAPI(data);
        const response = await fetch(`${API_BASE}/professionals/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(apiData),
        });
        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(
            `Failed to create professional: ${response.status}${
              errText ? ` - ${errText}` : ''
            }`
          );
        }
        const created = await response.json();
        const mapped = normaliseProfessional(created);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create professional';
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
        // ← THE FIX: convert camelCase → snake_case before sending
        const apiData = mapProfessionalToAPI(data);

        // eslint-disable-next-line no-console
        console.log('[useProfessional] PATCH payload:', apiData);

        const response = await fetch(`${API_BASE}/professionals/me`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(
            `Failed to update professional: ${response.status}${
              errText ? ` - ${errText}` : ''
            }`
          );
        }

        const updated = await response.json();
        const mapped = normaliseProfessional(updated);
        setProfessional(mapped);
        return mapped;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update professional';
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